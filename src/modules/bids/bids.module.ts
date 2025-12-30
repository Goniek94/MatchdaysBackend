import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Bid } from "./entities/bid.entity";
import { BidsService } from "./bids.service";
import { BidsController } from "./bids.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Bid])],
  controllers: [BidsController],
  providers: [BidsService],
  exports: [BidsService],
})
export class BidsModule {}
