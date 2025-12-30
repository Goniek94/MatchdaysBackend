import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Bid } from "./entities/bid.entity";

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid)
    private bidsRepository: Repository<Bid>
  ) {}

  async findAll(): Promise<Bid[]> {
    return this.bidsRepository.find();
  }

  async findByAuction(auctionId: string): Promise<Bid[]> {
    return this.bidsRepository.find({ where: { auctionId } });
  }

  async create(bidData: Partial<Bid>): Promise<Bid> {
    const bid = this.bidsRepository.create(bidData);
    return this.bidsRepository.save(bid);
  }
}
