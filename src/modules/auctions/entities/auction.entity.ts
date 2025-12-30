import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Bid } from "../../bids/entities/bid.entity";

export enum AuctionStatus {
  UPCOMING = "upcoming",
  ACTIVE = "active",
  ENDED = "ended",
  CANCELLED = "cancelled",
}

export enum AuctionCategory {
  PREMIER_LEAGUE = "Premier League",
  LA_LIGA = "La Liga",
  SERIE_A = "Serie A",
  BUNDESLIGA = "Bundesliga",
  LIGUE_1 = "Ligue 1",
  INTERNATIONAL = "International",
  VINTAGE = "Vintage",
  OTHER = "Other",
}

export enum ItemType {
  SHIRT = "shirt",
  SHOES = "shoes",
  PANTS = "pants",
  ACCESSORY = "accessory",
}

export enum ListingType {
  AUCTION = "auction",
  BUY_NOW = "buy_now",
}

export enum JerseySize {
  XS = "XS",
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XXL = "XXL",
}

export enum JerseyCondition {
  NEW_WITH_TAGS = "New with tags",
  NEW_WITHOUT_TAGS = "New without tags",
  EXCELLENT = "Excellent",
  GOOD = "Good",
  FAIR = "Fair",
}

@Entity("auctions")
export class Auction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "enum", enum: AuctionCategory })
  category: AuctionCategory;

  @Column({ type: "enum", enum: ItemType, default: ItemType.SHIRT })
  itemType: ItemType;

  @Column({ type: "enum", enum: ListingType, default: ListingType.AUCTION })
  listingType: ListingType;

  @Column()
  team: string;

  @Column()
  season: string;

  @Column({ type: "enum", enum: JerseySize })
  size: JerseySize;

  @Column({ type: "enum", enum: JerseyCondition })
  condition: JerseyCondition;

  @Column({ nullable: true })
  manufacturer: string; // Nike, Adidas, Puma, etc.

  @Column({ nullable: true })
  playerName: string; // Ronaldo, Messi, etc.

  @Column({ nullable: true })
  playerNumber: string; // 7, 10, etc.

  @Column("simple-array")
  images: string[];

  @Column({ type: "decimal", precision: 10, scale: 2 })
  startingBid: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  currentBid: number;

  @Column({ default: 0 })
  bidCount: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 5 })
  bidIncrement: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  buyNowPrice: number;

  @Column({ type: "timestamp" })
  startTime: Date;

  @Column({ type: "timestamp" })
  endTime: Date;

  @Column({ type: "enum", enum: AuctionStatus, default: AuctionStatus.ACTIVE })
  status: AuctionStatus;

  @Column({ default: false })
  verified: boolean;

  @Column({ default: false })
  rare: boolean;

  @Column({ default: false })
  featured: boolean;

  @Column({ default: 0 })
  views: number;

  // Shipping info
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ default: "3-5 business days" })
  shippingTime: string;

  @Column()
  shippingFrom: string;

  // Relations
  @ManyToOne(() => User, (user) => user.createdAuctions, { eager: true })
  @JoinColumn({ name: "sellerId" })
  seller: User;

  @Column()
  sellerId: string;

  @ManyToOne(() => User, (user) => user.wonAuctions, { nullable: true })
  @JoinColumn({ name: "winnerId" })
  winner: User;

  @Column({ nullable: true })
  winnerId: string;

  @OneToMany(() => Bid, (bid) => bid.auction)
  bids: Bid[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual property - time left
  getTimeLeft(): string {
    const now = new Date();
    const end = new Date(this.endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }

  // Check if auction is ending soon (< 1 hour)
  isEndingSoon(): boolean {
    const now = new Date();
    const end = new Date(this.endTime);
    const diff = end.getTime() - now.getTime();
    return diff > 0 && diff < 3600000; // 1 hour in milliseconds
  }

  // Check if auction has ended
  hasEnded(): boolean {
    return new Date() >= new Date(this.endTime);
  }
}
