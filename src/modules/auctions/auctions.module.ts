import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AuctionsService } from "./auctions.service";
import { AuctionsController } from "./auctions.controller";
import { AuctionsCronService } from "./auctions-cron.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionsCronService],
  exports: [AuctionsService],
})
export class AuctionsModule {}
