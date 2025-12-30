import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { AuctionsService } from "./auctions.service";

@Injectable()
export class AuctionsCronService {
  private readonly logger = new Logger(AuctionsCronService.name);

  constructor(private readonly auctionsService: AuctionsService) {}

  /**
   * Close expired auctions every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCloseExpiredAuctions() {
    this.logger.log("Running cron job: Close expired auctions");

    try {
      const result = await this.auctionsService.closeExpiredAuctions();

      if (result.closed > 0) {
        this.logger.log(`Closed ${result.closed} expired auctions`);
        this.logger.debug(`Details: ${JSON.stringify(result.auctions)}`);
      }
    } catch (error) {
      this.logger.error(`Error closing expired auctions: ${error.message}`);
    }
  }

  /**
   * Activate upcoming auctions every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleActivateUpcomingAuctions() {
    this.logger.log("Running cron job: Activate upcoming auctions");

    try {
      // This could be added to AuctionsService if needed
      // For now, auctions are activated when created if startTime <= now
    } catch (error) {
      this.logger.error(`Error activating upcoming auctions: ${error.message}`);
    }
  }
}
