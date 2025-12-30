import "dotenv/config"; // MUST be first - load .env before anything else
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";
import * as compression from "compression";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // API prefix
  app.setGlobalPrefix("api/v1");

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Matchdays API")
    .setDescription("Matchdays Auction Marketplace API Documentation")
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("auth", "Authentication endpoints")
    .addTag("users", "User management")
    .addTag("auctions", "Auction operations")
    .addTag("bids", "Bidding system")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);

  console.log(`
    🚀 Matchdays Backend is running!
    📡 Server: http://localhost:${port}
    📚 API Docs: http://localhost:${port}/api/docs
    🔥 Environment: ${process.env.NODE_ENV || "development"}
  `);
}

bootstrap();
