import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Auction } from '../../auctions/entities/auction.entity';

@Entity('bids')
export class Bid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: false })
  isWinning: boolean;

  @Column({ default: false })
  isAutoBid: boolean; // For future auto-bidding feature

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxAutoBid: number; // Maximum amount for auto-bidding

  // Relations
  @ManyToOne(() => User, (user) => user.bids, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Auction, (auction) => auction.bids)
  @JoinColumn({ name: 'auctionId' })
  auction: Auction;

  @Column()
  auctionId: string;

  @CreateDateColumn()
  createdAt: Date;

  // Get formatted time (e.g., "2 minutes ago")
  getTimeAgo(): string {
    const now = new Date();
    const diff = now.getTime() - this.createdAt.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  }
}
