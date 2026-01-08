import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class BidsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.bid.findMany({
      include: {
        bidder: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        auction: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByAuction(auctionId: string) {
    return this.prisma.bid.findMany({
      where: { auctionId },
      include: {
        bidder: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Note: Bid creation is handled by AuctionsService.placeBid()
  // which includes full validation, transactions, and auction updates
}
