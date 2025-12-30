import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { BidsService } from "./bids.service";

@ApiTags("bids")
@Controller("bids")
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Get("auction/:auctionId")
  @ApiOperation({ summary: "Get bids for auction" })
  async findByAuction(@Param("auctionId") auctionId: string) {
    return this.bidsService.findByAuction(auctionId);
  }
}
