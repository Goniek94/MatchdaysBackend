import { IsNumber, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class PlaceBidDto {
  @ApiProperty({
    description: "Bid amount",
    minimum: 0,
    example: 100,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;
}
