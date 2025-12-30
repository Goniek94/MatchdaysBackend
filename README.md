# 🏆 Matchdays Backend

Backend API dla Matchdays Auction Marketplace - platformy aukcyjnej dla koszulek piłkarskich.

## 🚀 Stack Technologiczny

- **Framework**: NestJS 10.x (Node.js + TypeScript)
- **Database**: PostgreSQL 16.x
- **ORM**: TypeORM 0.3.x
- **Cache & Queue**: Redis + Bull
- **Authentication**: JWT + Passport
- **Real-time**: Socket.io
- **Payments**: Stripe Connect
- **Documentation**: Swagger/OpenAPI
- **Storage**: Supabase Storage / AWS S3

## 📋 Wymagania

- Node.js 20.x LTS
- PostgreSQL 16.x
- Redis 7.x (opcjonalnie, dla cache i queue)
- npm lub yarn

## 🛠️ Instalacja

### 1. Sklonuj repozytorium

```bash
git clone <repository-url>
cd Matchdays-Backend
```

### 2. Zainstaluj zależności

```bash
npm install
```

### 3. Konfiguracja środowiska

Skopiuj plik `.env.example` do `.env`:

```bash
copy .env.example .env
```

Wypełnij zmienne środowiskowe w pliku `.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database - PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=matchdays

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=15m

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 4. Uruchom PostgreSQL

**Opcja A: Lokalnie**

```bash
# Zainstaluj PostgreSQL z https://www.postgresql.org/download/
# Utwórz bazę danych
psql -U postgres
CREATE DATABASE matchdays;
```

**Opcja B: Docker**

```bash
docker run --name matchdays-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=matchdays -p 5432:5432 -d postgres:16
```

### 5. Uruchom Redis (opcjonalnie)

```bash
docker run --name matchdays-redis -p 6379:6379 -d redis:7
```

## 🎯 Uruchomienie

### Development

```bash
npm run start:dev
```

Serwer uruchomi się na `http://localhost:5000`

### Production Build

```bash
npm run build
npm run start:prod
```

## 📚 API Documentation

Po uruchomieniu serwera, dokumentacja Swagger dostępna jest pod:

```
http://localhost:5000/api/docs
```

## 🗂️ Struktura Projektu

```
src/
├── main.ts                      # Entry point
├── app.module.ts                # Root module
│
├── modules/
│   ├── auth/                    # Authentication
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   └── strategies/
│   │       ├── jwt.strategy.ts
│   │       └── local.strategy.ts
│   │
│   ├── users/                   # Users management
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   ├── users.controller.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   │
│   ├── auctions/                # Auctions
│   │   ├── auctions.module.ts
│   │   ├── auctions.service.ts
│   │   ├── auctions.controller.ts
│   │   └── entities/
│   │       └── auction.entity.ts
│   │
│   └── bids/                    # Bidding system
│       ├── bids.module.ts
│       ├── bids.service.ts
│       ├── bids.controller.ts
│       └── entities/
│           └── bid.entity.ts
```

## 🔌 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Users

- `GET /api/v1/users/:id` - Get user profile

### Auctions

- `GET /api/v1/auctions` - Get all auctions
- `GET /api/v1/auctions/:id` - Get auction details
- `POST /api/v1/auctions` - Create auction (auth required)

### Bids

- `GET /api/v1/bids/auction/:auctionId` - Get bids for auction
- `POST /api/v1/bids` - Place bid (auth required)

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Scripts

```bash
npm run start          # Start production server
npm run start:dev      # Start development server with watch mode
npm run start:debug    # Start with debug mode
npm run build          # Build for production
npm run lint           # Lint code
npm run format         # Format code with Prettier
```

## 🔐 Security

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Helmet for security headers
- Rate limiting
- Input validation with class-validator
- CORS configuration

## 📝 Database Migrations

TypeORM synchronize jest włączony w development mode. W production używaj migracji:

```bash
npm run typeorm migration:generate -- -n MigrationName
npm run typeorm migration:run
```

## 🚢 Deployment

### Railway / Render

1. Połącz repozytorium
2. Dodaj zmienne środowiskowe
3. Deploy automatycznie

### VPS (DigitalOcean, AWS, etc.)

```bash
# Build
npm run build

# Start with PM2
pm2 start dist/main.js --name matchdays-api

# Or use Docker
docker build -t matchdays-backend .
docker run -p 5000:5000 matchdays-backend
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT

## 👨‍💻 Author

Your Name

## 🔗 Links

- [Frontend Repository](link-to-frontend)
- [Documentation](link-to-docs)
- [Live Demo](link-to-demo)

---

**Made with ❤️ for Matchdays**
