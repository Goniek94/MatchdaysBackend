import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { Response } from "express";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  /**
   * Register new user - MATCHED TO FRONTEND
   * Frontend sends: firstName, lastName, birthDate, country, email, phone, password, confirmPassword
   */
  async register(registerDto: RegisterDto, req: any) {
    const {
      firstName,
      lastName,
      birthDate,
      country,
      email,
      phone,
      password,
      confirmPassword,
      username,
    } = registerDto;

    this.logger.log(`Registration attempt for email: ${email}`);

    // Validate password match
    if (password !== confirmPassword) {
      throw new BadRequestException("Hasła nie są identyczne");
    }

    // Check if user already exists
    const existingUserByEmail = await this.usersService.findByEmail(email);
    if (existingUserByEmail) {
      this.logger.warn(`Registration failed - email already exists: ${email}`);
      throw new ConflictException(
        "Użytkownik z tym adresem email już istnieje"
      );
    }

    // Generate username if not provided
    let finalUsername = username;
    if (!finalUsername) {
      // Auto-generate username from firstName + random number
      finalUsername = `${firstName.toLowerCase()}${Math.floor(Math.random() * 10000)}`;
    }

    // Check if username already exists
    const existingUserByUsername =
      await this.usersService.findByUsername(finalUsername);
    if (existingUserByUsername) {
      // If auto-generated username exists, add more random numbers
      if (!username) {
        finalUsername = `${firstName.toLowerCase()}${Math.floor(Math.random() * 100000)}`;
      } else {
        throw new ConflictException("Użytkownik z tą nazwą już istnieje");
      }
    }

    // Validate age (minimum 16 years)
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
    ) {
      age--;
    }

    if (age < 16) {
      throw new BadRequestException(
        "Musisz mieć co najmniej 16 lat, aby się zarejestrować"
      );
    }

    // Create new user (password will be hashed by entity)
    const newUser = await this.usersService.create({
      name: firstName.trim(),
      lastName: lastName?.trim(),
      email: email.toLowerCase().trim(),
      password, // Will be hashed by @BeforeInsert hook
      username: finalUsername.trim(),
      birthDate: birthDateObj,
      country: country.toUpperCase(),
      phone: phone.trim(),
      isVerified: true, // Auto-verified (no email/phone verification)
      role: "user",
      status: "active",
      lastIP: req.ip,
      lastActivity: new Date(),
      failedLoginAttempts: 0,
      accountLocked: false,
    });

    this.logger.log(`User registered successfully: ${newUser.id}`);

    // Generate tokens
    const tokens = this.generateTokens(newUser.id, newUser.role);

    // Return user data (without sensitive info)
    return {
      user: newUser.toPublicProfile(),
      ...tokens,
    };
  }

  /**
   * Login user with enterprise security
   * Frontend sends: emailOrUsername, password
   */
  async login(loginDto: LoginDto, req: any) {
    const { emailOrUsername, password } = loginDto;
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    this.logger.log(
      `Login attempt for: ${emailOrUsername} from IP: ${ipAddress}`
    );

    // Try to find user by email OR username
    let userRaw = await this.usersService.findByEmail(
      emailOrUsername.toLowerCase().trim()
    );

    if (!userRaw) {
      // Try by username
      userRaw = await this.usersService.findByUsername(
        emailOrUsername.toLowerCase().trim()
      );
    }

    if (!userRaw) {
      this.logger.warn(`Login failed - user not found: ${emailOrUsername}`);
      // Note: We can't log to LoginHistory without userId, so we skip it here
      throw new UnauthorizedException("Nieprawidłowy email/username lub hasło");
    }

    // Convert to user with methods
    const user = await this.usersService.toUserWithMethods(userRaw);

    // Check if user has active ban
    const activeBan = await this.usersService.getActiveBan(user.id);
    if (activeBan) {
      await this.usersService.logLoginAttempt({
        userId: user.id,
        success: false,
        ipAddress,
        userAgent,
        failureReason: "account_banned",
      });

      const banMessage =
        activeBan.type === "permanent"
          ? "Twoje konto zostało permanentnie zablokowane."
          : `Twoje konto jest zablokowane do ${new Date(activeBan.endDate!).toLocaleString("pl-PL")}.`;

      this.logger.warn(`Login attempt on banned account: ${user.id}`);
      throw new UnauthorizedException(
        `${banMessage} Powód: ${activeBan.reason}`
      );
    }

    // Check if account is locked (temporary - due to failed login attempts)
    if (user.accountLocked) {
      const lockTime = user.lockUntil;
      if (lockTime && lockTime > new Date()) {
        const remainingTime = Math.ceil(
          (lockTime.getTime() - Date.now()) / (1000 * 60)
        );
        this.logger.warn(
          `Login attempt on locked account: ${user.id}, remaining: ${remainingTime}min`
        );
        throw new UnauthorizedException(
          `Konto jest zablokowane. Spróbuj ponownie za ${remainingTime} minut.`
        );
      } else {
        // Auto-unlock if lock time expired
        user.accountLocked = false;
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        await this.usersService.update(user.id, {
          accountLocked: false,
          failedLoginAttempts: 0,
          lockUntil: null,
        });
        this.logger.log(`Account automatically unlocked: ${user.id}`);
      }
    }

    // Check account status
    if (user.status === "suspended" || user.status === "banned") {
      this.logger.warn(`Login attempt on ${user.status} account: ${user.id}`);
      throw new UnauthorizedException(
        "Konto zostało zawieszone. Skontaktuj się z administratorem."
      );
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      // Log failed login attempt
      await this.usersService.logLoginAttempt({
        userId: user.id,
        success: false,
        ipAddress,
        userAgent,
        failureReason: "wrong_password",
      });

      // Increment failed attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;

      if (failedAttempts >= 4) {
        // Lock account for 15 minutes
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        await this.usersService.update(user.id, {
          failedLoginAttempts: failedAttempts,
          accountLocked: true,
          lockUntil,
        });

        // Log account lock
        await this.usersService.logLoginAttempt({
          userId: user.id,
          success: false,
          ipAddress,
          userAgent,
          failureReason: "account_locked_too_many_attempts",
        });

        this.logger.warn(
          `Account locked due to failed attempts: ${user.id}, attempts: ${failedAttempts}`
        );

        throw new UnauthorizedException(
          "Konto zostało zablokowane na 15 minut z powodu zbyt wielu nieudanych prób logowania."
        );
      }

      // Update failed attempts
      await this.usersService.update(user.id, {
        failedLoginAttempts: failedAttempts,
      });

      const attemptsLeft = 4 - failedAttempts;
      this.logger.warn(
        `Failed login attempt: ${user.id}, attempts: ${failedAttempts}, left: ${attemptsLeft}`
      );

      throw new UnauthorizedException(
        `Błędny login lub hasło. Pozostało ${attemptsLeft} ${
          attemptsLeft === 1 ? "próba" : attemptsLeft < 4 ? "próby" : "prób"
        }.`
      );
    }

    // Successful login - reset failed attempts and log success
    await this.usersService.update(user.id, {
      failedLoginAttempts: 0,
      lastLogin: new Date(),
      lastActivity: new Date(),
      lastIP: ipAddress,
    });

    // Log successful login
    await this.usersService.logLoginAttempt({
      userId: user.id,
      success: true,
      ipAddress,
      userAgent,
    });

    this.logger.log(`User logged in successfully: ${user.id}`);

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.role);

    // Return user data
    return {
      user: user.toPublicProfile(),
      ...tokens,
    };
  }

  /**
   * Generate access and refresh tokens
   */
  private generateTokens(userId: string, role: string) {
    const payload = { userId, role, type: "access" };
    const refreshPayload = { userId, role, type: "refresh" };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_SECRET"),
      expiresIn: this.configService.get("JWT_EXPIRES_IN", "15m"),
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get("JWT_REFRESH_SECRET"),
      expiresIn: this.configService.get("JWT_REFRESH_EXPIRES_IN", "7d"),
    });

    return { accessToken, refreshToken };
  }

  /**
   * Set secure HTTP-only cookies
   */
  setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = this.configService.get("NODE_ENV") === "production";

    // Access token cookie (15 minutes)
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    // Refresh token cookie (7 days)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    this.logger.debug("Auth cookies set successfully");
  }

  /**
   * Clear authentication cookies
   */
  clearAuthCookies(res: Response) {
    res.clearCookie("token", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
    this.logger.debug("Auth cookies cleared");
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string, req: any) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get("JWT_REFRESH_SECRET"),
      });

      // Verify user still exists and is active
      const user = await this.usersService.findById(payload.userId);

      if (user.status === "suspended" || user.status === "banned") {
        throw new UnauthorizedException("User account suspended");
      }

      // Generate new tokens
      const tokens = this.generateTokens(user.id, user.role);

      // Update last activity
      await this.usersService.update(user.id, {
        lastActivity: new Date(),
        lastIP: req.ip,
      });

      return tokens;
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`);
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  /**
   * Logout user
   */
  async logout(userId: string) {
    // Clear refresh token from database
    await this.usersService.updateRefreshToken(userId, null);
    this.logger.log(`User logged out: ${userId}`);
  }
}
