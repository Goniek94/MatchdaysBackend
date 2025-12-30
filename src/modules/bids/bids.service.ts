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

  async create(bidData: {
    amount: number;
    auctionId: string;
    bidderId: string;
  }) {
    return this.prisma.bid.create({
      data: {
        amount: bidData.amount,
        auctionId: bidData.auctionId,
        bidderId: bidData.bidderId,
      },
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
          },
        },
      },
    });
  }
}
