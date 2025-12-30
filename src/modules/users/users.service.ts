import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Find user by email
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Find user by username
  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  // Find user by ID
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // Find user by ID with stats (includes relations)
  async findByIdWithStats(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        createdAuctions: true,
        wonAuctions: true,
        bids: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // Create new user
  async create(userData: {
    name: string;
    lastName?: string;
    email: string;
    password: string;
    username: string;
    birthDate?: Date;
    country?: string;
    phone?: string;
    isVerified?: boolean;
    role?: string;
    status?: string;
    lastIP?: string;
    lastActivity?: Date;
    failedLoginAttempts?: number;
    accountLocked?: boolean;
  }) {
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });

    return this.toUserWithMethods(user);
  }

  // Update user
  async update(id: string, userData: any) {
    const user = await this.prisma.user.update({
      where: { id },
      data: userData,
    });

    return this.toUserWithMethods(user);
  }

  // Update refresh token
  async updateRefreshToken(
    userId: string,
    refreshToken: string | null
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  // Get user's public profile
  async getPublicProfile(id: string) {
    const user = await this.findById(id);
    return this.toPublicProfile(user);
  }

  // Get all users (admin only)
  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((user) => this.toUserWithMethods(user));
  }

  // ============================================
  // LOGIN HISTORY METHODS
  // ============================================

  /**
   * Log login attempt to history
   */
  async logLoginAttempt(data: {
    userId: string;
    success: boolean;
    ipAddress: string;
    userAgent?: string;
    location?: string;
    failureReason?: string;
  }) {
    return this.prisma.loginHistory.create({
      data,
    });
  }

  /**
   * Get user's login history
   */
  async getLoginHistory(userId: string, limit: number = 50) {
    return this.prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Get recent failed login attempts
   */
  async getRecentFailedLogins(userId: string, hours: number = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.prisma.loginHistory.findMany({
      where: {
        userId,
        success: false,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // ============================================
  // BAN & WARNING METHODS
  // ============================================

  /**
   * Check if user has active ban
   */
  async getActiveBan(userId: string) {
    const activeBan = await this.prisma.ban.findFirst({
      where: {
        userId,
        active: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Check if temporary ban expired
    if (activeBan && activeBan.type === "temporary" && activeBan.endDate) {
      if (new Date() > activeBan.endDate) {
        // Ban expired, deactivate it
        await this.prisma.ban.update({
          where: { id: activeBan.id },
          data: { active: false },
        });
        return null;
      }
    }

    return activeBan;
  }

  /**
   * Get user's active warnings
   */
  async getActiveWarnings(userId: string) {
    return this.prisma.warning.findMany({
      where: {
        userId,
        active: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get user's warning count
   */
  async getWarningCount(userId: string) {
    return this.prisma.warning.count({
      where: {
        userId,
        active: true,
      },
    });
  }

  /**
   * Get user's moderation history
   */
  async getModerationHistory(userId: string, limit: number = 50) {
    return this.prisma.moderationLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  // Helper: Add methods to user object (like TypeORM entity)
  toUserWithMethods(user: any) {
    return {
      ...user,
      validatePassword: async (password: string): Promise<boolean> => {
        return bcrypt.compare(password, user.password);
      },
      toPublicProfile: () => this.toPublicProfile(user),
    };
  }

  // Helper: Convert to public profile (without sensitive data)
  private toPublicProfile(user: any) {
    const { password, refreshToken, ...publicProfile } = user;
    return publicProfile;
  }
}
