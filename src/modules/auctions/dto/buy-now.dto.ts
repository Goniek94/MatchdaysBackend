import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class BuyNowDto {
  @ApiPropertyOptional({
    description: "Optional note from buyer",
    example: "Please ship as soon as possible",
  })
  @IsString()
  @IsOptional()
  note?: string;
}
