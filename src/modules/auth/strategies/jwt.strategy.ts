import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Extract JWT from cookies OR Authorization header
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // First try to get from cookie
          let token = request?.cookies?.token;

          // If not in cookie, try Authorization header
          if (!token) {
            const authHeader = request?.headers?.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
              token = authHeader.substring(7);
            }
          }

          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
    });
  }

  async validate(payload: any) {
    if (!payload.userId) {
      throw new UnauthorizedException("Invalid token payload");
    }

    return {
      userId: payload.userId,
      role: payload.role,
      isAdmin: payload.role === "admin",
    };
  }
}
