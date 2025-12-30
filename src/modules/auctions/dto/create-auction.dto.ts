import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  IsDateString,
  Min,
  IsEnum,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export enum ListingType {
  AUCTION = "auction",
  BUY_NOW = "buy_now",
  AUCTION_BUY_NOW = "auction_buy_now",
}

export class CreateAuctionDto {
  @ApiProperty({ description: "Auction title" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: "Auction description" })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: "Category (e.g., Premier League, La Liga)" })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: "Item type", default: "shirt" })
  @IsString()
  @IsNotEmpty()
  itemType: string;

  @ApiProperty({
    description: "Listing type",
    enum: ListingType,
    default: ListingType.AUCTION,
  })
  @IsEnum(ListingType)
  listingType: ListingType;

  @ApiProperty({ description: "Team name" })
  @IsString()
  @IsNotEmpty()
  team: string;

  @ApiProperty({ description: "Season (e.g., 2023/24)" })
  @IsString()
  @IsNotEmpty()
  season: string;

  @ApiProperty({ description: "Size" })
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiProperty({ description: "Condition" })
  @IsString()
  @IsNotEmpty()
  condition: string;

  @ApiPropertyOptional({ description: "Manufacturer" })
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiPropertyOptional({ description: "Player name" })
  @IsString()
  @IsOptional()
  playerName?: string;

  @ApiPropertyOptional({ description: "Player number" })
  @IsString()
  @IsOptional()
  playerNumber?: string;

  @ApiProperty({ description: "Image URLs", type: [String] })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({ description: "Starting bid amount", minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  startingBid: number;

  @ApiProperty({ description: "Bid increment", minimum: 1, default: 5 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  bidIncrement: number;

  @ApiPropertyOptional({
    description: "Buy now price (optional)",
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  buyNowPrice?: number;

  @ApiProperty({ description: "Auction start time" })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: "Auction end time" })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({ description: "Shipping cost", default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  shippingCost?: number;

  @ApiPropertyOptional({
    description: "Shipping time",
    default: "3-5 business days",
  })
  @IsString()
  @IsOptional()
  shippingTime?: string;

  @ApiProperty({ description: "Shipping from location" })
  @IsString()
  @IsNotEmpty()
  shippingFrom: string;

  @ApiPropertyOptional({ description: "Is verified", default: false })
  @IsOptional()
  verified?: boolean;

  @ApiPropertyOptional({ description: "Is rare", default: false })
  @IsOptional()
  rare?: boolean;

  @ApiPropertyOptional({ description: "Is featured", default: false })
  @IsOptional()
  featured?: boolean;
}
