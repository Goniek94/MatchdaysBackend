import { IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({
    example: "john@example.com",
    description: "Email or username",
  })
  @IsString()
  emailOrUsername: string;

  @ApiProperty({ example: "Password123!", description: "User's password" })
  @IsString()
  @MinLength(6, { message: "Hasło musi mieć minimum 6 znaków" })
  password: string;
}
