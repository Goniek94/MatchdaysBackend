import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
  IsOptional,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "John", description: "User's first name" })
  @IsString()
  @MinLength(2, { message: "Imię musi mieć minimum 2 znaki" })
  @MaxLength(50, { message: "Imię nie może przekraczać 50 znaków" })
  firstName: string;

  @ApiProperty({ example: "Doe", description: "User's last name" })
  @IsString()
  @MinLength(2, { message: "Nazwisko musi mieć minimum 2 znaki" })
  @MaxLength(50, { message: "Nazwisko nie może przekraczać 50 znaków" })
  lastName: string;

  @ApiProperty({
    example: "2000-01-15",
    description: "Date of birth (YYYY-MM-DD)",
  })
  @IsDateString({}, { message: "Podaj prawidłową datę urodzenia" })
  birthDate: string;

  @ApiProperty({
    example: "PL",
    description: "Country code (ISO 3166-1 alpha-2)",
  })
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  country: string;

  @ApiProperty({ example: "john@example.com", description: "User's email" })
  @IsEmail({}, { message: "Podaj prawidłowy adres email" })
  email: string;

  @ApiProperty({
    example: "+48123456789",
    description: "Phone number with country code",
  })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: "Podaj prawidłowy numer telefonu",
  })
  phone: string;

  @ApiProperty({
    example: "Password123!",
    description: "Password (min 8 characters)",
  })
  @IsString()
  @MinLength(8, { message: "Hasło musi mieć minimum 8 znaków" })
  password: string;

  @ApiProperty({
    example: "Password123!",
    description: "Confirm password",
  })
  @IsString()
  confirmPassword: string;

  @ApiProperty({
    example: "john_doe",
    description: "Username (optional, auto-generated if not provided)",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message:
      "Nazwa użytkownika może zawierać tylko litery, cyfry i podkreślenia",
  })
  username?: string;
}
