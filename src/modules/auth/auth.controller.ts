import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { Response, Request } from "express";
import { Throttle, SkipThrottle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register - 10 requests per hour
   */
  @Post("register")
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 per hour
  @ApiOperation({ summary: "Register new user" })
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.register(registerDto, req);

    // Set secure HTTP-only cookies
    this.authService.setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken
    );

    return {
      success: true,
      message: "Rejestracja zakończona pomyślnie! Witamy w Matchdays!",
      data: result.user,
    };
  }

  /**
   * Login - 20 requests per 15 minutes
   */
  @Post("login")
  @Throttle({ default: { limit: 20, ttl: 900000 } }) // 20 per 15 min
  @ApiOperation({ summary: "Login user" })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.login(loginDto, req);

    // Set secure HTTP-only cookies
    this.authService.setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken
    );

    return {
      success: true,
      message: "Logowanie przebiegło pomyślnie",
      data: result.user,
    };
  }

  /**
   * Logout - No rate limit (authenticated users only)
   */
  @Post("logout")
  @SkipThrottle() // No rate limit for logout
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Logout user" })
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.userId);

    // Clear cookies
    this.authService.clearAuthCookies(res);

    return {
      success: true,
      message: "Wylogowano pomyślnie",
    };
  }

  /**
   * Refresh token - 30 requests per hour
   */
  @Post("refresh")
  @Throttle({ default: { limit: 30, ttl: 3600000 } }) // 30 per hour
  @ApiOperation({ summary: "Refresh access token" })
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    const tokens = await this.authService.refreshToken(refreshToken, req);

    // Set new cookies
    this.authService.setAuthCookies(
      res,
      tokens.accessToken,
      tokens.refreshToken
    );

    return {
      success: true,
      message: "Token refreshed successfully",
    };
  }

  /**
   * Check authentication status - No rate limit
   * Compatible with Marketplace frontend pattern
   */
  @Get("check-auth")
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Check if user is authenticated" })
  async checkAuth(@Req() req: any) {
    return {
      success: true,
      message: "User is authenticated",
      data: req.user,
    };
  }

  /**
   * Get current user - No rate limit (authenticated users only)
   */
  @Get("me")
  @SkipThrottle() // No rate limit for authenticated endpoint
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user" })
  async getMe(@Req() req: any) {
    return {
      success: true,
      user: req.user,
    };
  }
}
