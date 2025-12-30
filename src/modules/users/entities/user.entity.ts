import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
} from "typeorm";
import * as bcrypt from "bcrypt";
import { Exclude } from "class-transformer";
import { Auction } from "../../auctions/entities/auction.entity";
import { Bid } from "../../bids/entities/bid.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true, length: 30 })
  username: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: "date", nullable: true })
  birthDate: Date;

  @Column({ length: 2, nullable: true })
  country: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  @Exclude() // Don't expose password in responses
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: "decimal", precision: 2, scale: 1, default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviews: number;

  @Column({ default: 0 })
  sales: number;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 100 })
  positivePercentage: number;

  @Column({ default: "2-3 days" })
  avgShippingTime: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: "enum", enum: ["user", "admin"], default: "user" })
  role: string;

  @Column({ nullable: true })
  @Exclude()
  refreshToken: string;

  // Stripe Connect for sellers
  @Column({ nullable: true })
  stripeAccountId: string;

  @Column({ default: false })
  stripeOnboardingComplete: boolean;

  // Security fields for login
  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ default: false })
  accountLocked: boolean;

  @Column({ type: "timestamp", nullable: true })
  lockUntil: Date;

  @Column({ type: "timestamp", nullable: true })
  lastLogin: Date;

  @Column({ nullable: true })
  lastIP: string;

  @Column({ type: "timestamp", nullable: true })
  lastActivity: Date;

  @Column({
    type: "enum",
    enum: ["active", "suspended", "banned"],
    default: "active",
  })
  status: string;

  // Relations
  @OneToMany(() => Auction, (auction) => auction.seller)
  createdAuctions: Auction[];

  @OneToMany(() => Auction, (auction) => auction.winner)
  wonAuctions: Auction[];

  @OneToMany(() => Bid, (bid) => bid.user)
  bids: Bid[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Hash password before insert
  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  // Method to validate password
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // Get public profile (without sensitive data)
  toPublicProfile() {
    const { password, refreshToken, ...publicProfile } = this;
    return publicProfile;
  }
}
