import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAuctionDto } from "./dto/create-auction.dto";
import { PlaceBidDto } from "./dto/place-bid.dto";
import { Decimal } from "@prisma/client/runtime/library";

@Injectable()
export class AuctionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create new auction
   */
  async create(createAuctionDto: CreateAuctionDto, sellerId: string) {
    const {
      startingBid,
      bidIncrement,
      buyNowPrice,
      startTime,
      endTime,
      ...rest
    } = createAuctionDto;

    // Validation
    if (startingBid <= 0) {
      throw new BadRequestException("Starting bid must be greater than 0");
    }

    if (bidIncrement <= 0) {
      throw new BadRequestException("Bid increment must be greater than 0");
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      throw new BadRequestException("End time must be after start time");
    }

    if (buyNowPrice && buyNowPrice <= startingBid) {
      throw new BadRequestException(
        "Buy now price must be greater than starting bid"
      );
    }

    // Determine initial status
    const now = new Date();
    let status = "active";
    if (start > now) {
      status = "upcoming";
    }

    // Create auction
    const auction = await this.prisma.auction.create({
      data: {
        ...rest,
        startingBid: new Decimal(startingBid),
        currentBid: new Decimal(startingBid),
        bidIncrement: new Decimal(bidIncrement),
        buyNowPrice: buyNowPrice ? new Decimal(buyNowPrice) : null,
        startTime: start,
        endTime: end,
        status,
        sellerId,
        bidCount: 0,
      },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            rating: true,
            reviews: true,
          },
        },
      },
    });

    return auction;
  }

  /**
   * Get all auctions with filters
   */
  async findAll(filters?: {
    status?: string;
    category?: string;
    team?: string;
    listingType?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      status,
      category,
      team,
      listingType,
      page = 1,
      limit = 20,
    } = filters || {};

    const where: any = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (team) where.team = team;
    if (listingType) where.listingType = listingType;

    const [auctions, total] = await Promise.all([
      this.prisma.auction.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              rating: true,
              reviews: true,
            },
          },
          _count: {
            select: { bids: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auction.count({ where }),
    ]);

    return {
      auctions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get auction by ID
   */
  async findOne(id: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            rating: true,
            reviews: true,
            sales: true,
            positivePercentage: true,
            avgShippingTime: true,
          },
        },
        bids: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            bidder: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!auction) {
      throw new NotFoundException(`Auction with ID ${id} not found`);
    }

    // Increment views
    await this.prisma.auction.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return auction;
  }

  /**
   * Place bid on auction
   */
  async placeBid(
    auctionId: string,
    placeBidDto: PlaceBidDto,
    bidderId: string
  ) {
    const { amount } = placeBidDto;

    // Use transaction for atomic operations
    return await this.prisma.$transaction(async (tx) => {
      // Get auction with lock
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
      });

      if (!auction) {
        throw new NotFoundException(`Auction with ID ${auctionId} not found`);
      }

      // Validations
      if (auction.status !== "active") {
        throw new BadRequestException("Auction is not active");
      }

      const now = new Date();
      if (now < auction.startTime) {
        throw new BadRequestException("Auction has not started yet");
      }

      if (now >= auction.endTime) {
        throw new BadRequestException("Auction has ended");
      }

      if (auction.sellerId === bidderId) {
        throw new ForbiddenException("You cannot bid on your own auction");
      }

      const minBid = Number(auction.currentBid) + Number(auction.bidIncrement);
      if (amount < minBid) {
        throw new BadRequestException(
          `Bid must be at least ${minBid} (current bid + increment)`
        );
      }

      // Create bid
      const bid = await tx.bid.create({
        data: {
          amount: new Decimal(amount),
          auctionId,
          bidderId,
        },
        include: {
          bidder: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      // Update auction
      const updatedAuction = await tx.auction.update({
        where: { id: auctionId },
        data: {
          currentBid: new Decimal(amount),
          bidCount: { increment: 1 },
          // Optional: Extend auction if bid placed in last 5 minutes
          ...(now >= new Date(auction.endTime.getTime() - 5 * 60 * 1000) && {
            endTime: new Date(auction.endTime.getTime() + 5 * 60 * 1000),
          }),
        },
      });

      return {
        bid,
        auction: updatedAuction,
      };
    });
  }

  /**
   * Buy now - instant purchase
   */
  async buyNow(auctionId: string, buyerId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
      });

      if (!auction) {
        throw new NotFoundException(`Auction with ID ${auctionId} not found`);
      }

      // Validations
      if (!auction.buyNowPrice) {
        throw new BadRequestException(
          "This auction does not have a buy now option"
        );
      }

      if (auction.listingType === "auction") {
        throw new BadRequestException(
          "Buy now is not available for auction-only listings"
        );
      }

      if (auction.status !== "active") {
        throw new BadRequestException("Auction is not active");
      }

      if (auction.sellerId === buyerId) {
        throw new ForbiddenException("You cannot buy your own item");
      }

      // Update auction to sold
      const updatedAuction = await tx.auction.update({
        where: { id: auctionId },
        data: {
          status: "sold",
          winnerId: buyerId,
          endTime: new Date(),
        },
        include: {
          seller: {
            select: {
              id: true,
              username: true,
            },
          },
          winner: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      return updatedAuction;
    });
  }

  /**
   * Get auction status for frontend
   */
  async getAuctionStatus(auctionId: string, userId?: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        bids: {
          orderBy: { amount: "desc" },
          take: 1,
          include: {
            bidder: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!auction) {
      throw new NotFoundException(`Auction with ID ${auctionId} not found`);
    }

    const now = new Date();
    const isActive =
      auction.status === "active" &&
      now >= auction.startTime &&
      now < auction.endTime;

    const canBid =
      isActive &&
      auction.listingType !== "buy_now" &&
      auction.sellerId !== userId;

    const canBuyNow =
      isActive &&
      auction.buyNowPrice !== null &&
      auction.listingType !== "auction" &&
      auction.sellerId !== userId;

    const minBid = Number(auction.currentBid) + Number(auction.bidIncrement);
    const endsIn = Math.max(0, auction.endTime.getTime() - now.getTime());

    const highestBidder = auction.bids[0]?.bidder?.id;
    const isWinning = userId ? highestBidder === userId : false;

    return {
      canBid,
      canBuyNow,
      minBid,
      buyNowPrice: auction.buyNowPrice ? Number(auction.buyNowPrice) : null,
      endsIn,
      isActive,
      status: auction.status,
      isWinning,
    };
  }

  /**
   * Close expired auctions (called by cron job)
   */
  async closeExpiredAuctions() {
    const now = new Date();

    // Find all active auctions that have ended
    const expiredAuctions = await this.prisma.auction.findMany({
      where: {
        status: "active",
        endTime: { lte: now },
      },
      include: {
        bids: {
          orderBy: { amount: "desc" },
          take: 1,
        },
      },
    });

    const results = [];

    for (const auction of expiredAuctions) {
      if (auction.bids.length > 0) {
        // Has bids - mark as sold
        const highestBid = auction.bids[0];
        await this.prisma.auction.update({
          where: { id: auction.id },
          data: {
            status: "sold",
            winnerId: highestBid.bidderId,
          },
        });
        results.push({
          id: auction.id,
          status: "sold",
          winnerId: highestBid.bidderId,
        });
      } else {
        // No bids - mark as ended
        await this.prisma.auction.update({
          where: { id: auction.id },
          data: {
            status: "ended",
          },
        });
        results.push({ id: auction.id, status: "ended" });
      }
    }

    return {
      closed: results.length,
      auctions: results,
    };
  }

  /**
   * Get user's bids
   */
  async getUserBids(userId: string) {
    return await this.prisma.bid.findMany({
      where: { bidderId: userId },
      include: {
        auction: {
          include: {
            seller: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get user's auctions
   */
  async getUserAuctions(userId: string) {
    return await this.prisma.auction.findMany({
      where: { sellerId: userId },
      include: {
        _count: {
          select: { bids: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
