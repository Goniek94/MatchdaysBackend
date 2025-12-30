import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard } from "@nestjs/throttler";

// Prisma
import { PrismaModule } from "./prisma/prisma.module";

// Modules
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { AuctionsModule } from "./modules/auctions/auctions.module";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // Database - Prisma (Supabase PostgreSQL)
    PrismaModule,

    // Rate Limiting (Throttler)
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute (global default)
      },
    ]),

    // Feature Modules
    AuthModule,
    UsersModule,
    AuctionsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Global rate limiting
    },
  ],
})
export class AppModule {}
