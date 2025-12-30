import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  ItemType,
  ListingType,
  AuctionCategory,
  JerseySize,
  JerseyCondition,
} from "../entities/auction.entity";

export class SearchAuctionsDto {
  // Search query
  @ApiPropertyOptional({ description: "Search query (title, team, player)" })
  @IsOptional()
  @IsString()
  query?: string;

  // Product type
  @ApiPropertyOptional({ enum: ItemType, description: "Item type filter" })
  @IsOptional()
  @IsEnum(ItemType)
  itemType?: ItemType;

  // Listing type
  @ApiPropertyOptional({
    enum: ListingType,
    description: "Listing type filter",
  })
  @IsOptional()
  @IsEnum(ListingType)
  listingType?: ListingType;

  // Category/League
  @ApiPropertyOptional({
    enum: AuctionCategory,
    description: "League/Category filter",
  })
  @IsOptional()
  @IsEnum(AuctionCategory)
  category?: AuctionCategory;

  // Team
  @ApiPropertyOptional({ description: "Team name" })
  @IsOptional()
  @IsString()
  team?: string;

  // Season
  @ApiPropertyOptional({ description: "Season (e.g., 2008/09)" })
  @IsOptional()
  @IsString()
  season?: string;

  // Size
  @ApiPropertyOptional({ enum: JerseySize, description: "Jersey size" })
  @IsOptional()
  @IsEnum(JerseySize)
  size?: JerseySize;

  // Condition
  @ApiPropertyOptional({
    enum: JerseyCondition,
    description: "Jersey condition",
  })
  @IsOptional()
  @IsEnum(JerseyCondition)
  condition?: JerseyCondition;

  // Manufacturer
  @ApiPropertyOptional({ description: "Manufacturer (Nike, Adidas, etc.)" })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  // Player
  @ApiPropertyOptional({ description: "Player name" })
  @IsOptional()
  @IsString()
  playerName?: string;

  // Price range
  @ApiPropertyOptional({ description: "Minimum price" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: "Maximum price" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  // Special filters
  @ApiPropertyOptional({ description: "Only rare items" })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  rare?: boolean;

  @ApiPropertyOptional({ description: "Only verified sellers" })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  verified?: boolean;

  @ApiPropertyOptional({ description: "Only featured items" })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  featured?: boolean;

  // Sorting
  @ApiPropertyOptional({
    description: "Sort by field",
    enum: [
      "recommended",
      "ending_soon",
      "price_low",
      "price_high",
      "newest",
      "most_bids",
    ],
    default: "recommended",
  })
  @IsOptional()
  @IsString()
  sortBy?: string = "recommended";

  @ApiPropertyOptional({
    description: "Sort order",
    enum: ["asc", "desc"],
    default: "desc",
  })
  @IsOptional()
  @IsString()
  order?: "asc" | "desc" = "desc";

  // Pagination
  @ApiPropertyOptional({ description: "Page number", default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Items per page",
    default: 30,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 30;
}
