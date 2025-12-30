import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { AuctionsService } from "./auctions.service";
import { CreateAuctionDto } from "./dto/create-auction.dto";
import { PlaceBidDto } from "./dto/place-bid.dto";
import { BuyNowDto } from "./dto/buy-now.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SkipThrottle, Throttle } from "@nestjs/throttler";

@ApiTags("auctions")
@Controller("auctions")
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  /**
   * Create new auction
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create new auction" })
  async create(@Body() createAuctionDto: CreateAuctionDto, @Req() req: any) {
    try {
      const sellerId = req.user.userId;
      const auction = await this.auctionsService.create(
        createAuctionDto,
        sellerId
      );

      return {
        success: true,
        message: "Auction created successfully",
        data: auction,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get all auctions with filters
   */
  @Get()
  @SkipThrottle()
  @ApiOperation({ summary: "Get all auctions" })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "category", required: false })
  @ApiQuery({ name: "team", required: false })
  @ApiQuery({ name: "listingType", required: false })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async findAll(
    @Query("status") status?: string,
    @Query("category") category?: string,
    @Query("team") team?: string,
    @Query("listingType") listingType?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    try {
      const filters = {
        status,
        category,
        team,
        listingType,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
      };

      const result = await this.auctionsService.findAll(filters);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get auction by ID
   */
  @Get(":id")
  @SkipThrottle()
  @ApiOperation({ summary: "Get auction by ID" })
  @ApiParam({ name: "id", description: "Auction ID" })
  async findOne(@Param("id") id: string) {
    try {
      const auction = await this.auctionsService.findOne(id);

      return {
        success: true,
        data: auction,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get auction status (for frontend logic)
   */
  @Get(":id/status")
  @SkipThrottle()
  @ApiOperation({
    summary: "Get auction status - canBid, canBuyNow, minBid, etc.",
  })
  @ApiParam({ name: "id", description: "Auction ID" })
  async getStatus(@Param("id") id: string, @Req() req: any) {
    try {
      // Get userId from token if available (optional auth)
      const userId = req.user?.userId;

      const status = await this.auctionsService.getAuctionStatus(id, userId);

      return {
        success: true,
        data: status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Place bid on auction
   */
  @Post(":id/bid")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 bids per minute
  @ApiOperation({ summary: "Place bid on auction" })
  @ApiParam({ name: "id", description: "Auction ID" })
  async placeBid(
    @Param("id") id: string,
    @Body() placeBidDto: PlaceBidDto,
    @Req() req: any
  ) {
    try {
      const bidderId = req.user.userId;
      const result = await this.auctionsService.placeBid(
        id,
        placeBidDto,
        bidderId
      );

      return {
        success: true,
        message: "Bid placed successfully",
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Buy now - instant purchase
   */
  @Post(":id/buy-now")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 purchases per minute
  @ApiOperation({ summary: "Buy now - instant purchase" })
  @ApiParam({ name: "id", description: "Auction ID" })
  async buyNow(
    @Param("id") id: string,
    @Body() buyNowDto: BuyNowDto,
    @Req() req: any
  ) {
    try {
      const buyerId = req.user.userId;
      const auction = await this.auctionsService.buyNow(id, buyerId);

      return {
        success: true,
        message: "Purchase successful",
        data: auction,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get user's bids
   */
  @Get("my/bids")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @SkipThrottle()
  @ApiOperation({ summary: "Get current user's bids" })
  async getMyBids(@Req() req: any) {
    try {
      const userId = req.user.userId;
      const bids = await this.auctionsService.getUserBids(userId);

      return {
        success: true,
        data: bids,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get user's auctions
   */
  @Get("my/auctions")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @SkipThrottle()
  @ApiOperation({ summary: "Get current user's auctions" })
  async getMyAuctions(@Req() req: any) {
    try {
      const userId = req.user.userId;
      const auctions = await this.auctionsService.getUserAuctions(userId);

      return {
        success: true,
        data: auctions,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
