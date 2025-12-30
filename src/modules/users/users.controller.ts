import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
  Patch,
  Body,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("users")
@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get user dashboard - stats, activity, etc.
   */
  @Get("dashboard")
  @SkipThrottle()
  @ApiOperation({ summary: "Get user dashboard data" })
  async getDashboard(@Req() req: any) {
    const userId = req.user.userId;
    const user = await this.usersService.findByIdWithStats(userId);

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Get user stats
    const stats = {
      totalAuctions: user.createdAuctions?.length || 0,
      wonAuctions: user.wonAuctions?.length || 0,
      totalBids: user.bids?.length || 0,
      rating: user.rating || 0,
      reviews: user.reviews || 0,
      sales: user.sales || 0,
      positivePercentage: user.positivePercentage || 100,
      avgShippingTime: user.avgShippingTime || "2-3 days",
    };

    // Activity info
    const activity = {
      lastLogin: user.lastLogin,
      lastActivity: user.lastActivity,
      lastIP: user.lastIP,
      accountCreated: user.createdAt,
    };

    // Account status
    const accountStatus = {
      isVerified: user.isVerified,
      status: user.status,
      role: user.role,
      stripeConnected: user.stripeOnboardingComplete,
    };

    return {
      success: true,
      dashboard: {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          birthDate: user.birthDate,
          country: user.country,
          phone: user.phone,
        },
        stats,
        activity,
        accountStatus,
      },
    };
  }

  /**
   * Get user profile by ID
   */
  @Get("profile/:id")
  @SkipThrottle()
  @ApiOperation({ summary: "Get user profile by ID" })
  @ApiParam({ name: "id", description: "User ID" })
  async getUserProfile(@Param("id") id: string) {
    const user = await this.usersService.findById(id);

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Public profile (without sensitive data)
    return {
      success: true,
      profile: {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        rating: user.rating,
        reviews: user.reviews,
        sales: user.sales,
        positivePercentage: user.positivePercentage,
        avgShippingTime: user.avgShippingTime,
        isVerified: user.isVerified,
        memberSince: user.createdAt,
      },
    };
  }

  /**
   * Update user profile
   */
  @Patch("profile")
  @SkipThrottle()
  @ApiOperation({ summary: "Update user profile" })
  async updateProfile(@Req() req: any, @Body() updateData: any) {
    const userId = req.user.userId;

    // Only allow updating certain fields
    const allowedFields = ["name", "lastName", "avatar", "phone"];
    const filteredData = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    await this.usersService.update(userId, filteredData);

    return {
      success: true,
      message: "Profile updated successfully",
    };
  }

  /**
   * Get user activity log
   */
  @Get("activity")
  @SkipThrottle()
  @ApiOperation({ summary: "Get user activity log" })
  async getActivity(@Req() req: any) {
    const userId = req.user.userId;
    const user = await this.usersService.findById(userId);

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    return {
      success: true,
      activity: {
        lastLogin: user.lastLogin,
        lastActivity: user.lastActivity,
        lastIP: user.lastIP,
        failedLoginAttempts: user.failedLoginAttempts,
        accountLocked: user.accountLocked,
        lockUntil: user.lockUntil,
      },
    };
  }
}
