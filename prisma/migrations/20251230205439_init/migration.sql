-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "lastName" TEXT,
    "birthDate" TIMESTAMP(3),
    "country" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviews" INTEGER NOT NULL DEFAULT 0,
    "sales" INTEGER NOT NULL DEFAULT 0,
    "positivePercentage" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "avgShippingTime" TEXT NOT NULL DEFAULT '2-3 days',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "role" TEXT NOT NULL DEFAULT 'user',
    "lastLogin" TIMESTAMP(3),
    "lastActivity" TIMESTAMP(3),
    "lastIP" TEXT,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "accountLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockUntil" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripeAccountId" TEXT,
    "stripeOnboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auctions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "itemType" TEXT NOT NULL DEFAULT 'shirt',
    "listingType" TEXT NOT NULL DEFAULT 'auction',
    "team" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "manufacturer" TEXT,
    "playerName" TEXT,
    "playerNumber" TEXT,
    "images" TEXT[],
    "startingBid" DECIMAL(10,2) NOT NULL,
    "currentBid" DECIMAL(10,2) NOT NULL,
    "bidCount" INTEGER NOT NULL DEFAULT 0,
    "bidIncrement" DECIMAL(10,2) NOT NULL DEFAULT 5,
    "buyNowPrice" DECIMAL(10,2),
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "rare" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "shippingCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "shippingTime" TEXT NOT NULL DEFAULT '3-5 business days',
    "shippingFrom" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "winnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auctions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bids" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "auctionId" TEXT NOT NULL,
    "bidderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "auctions_status_idx" ON "auctions"("status");

-- CreateIndex
CREATE INDEX "auctions_category_idx" ON "auctions"("category");

-- CreateIndex
CREATE INDEX "auctions_team_idx" ON "auctions"("team");

-- CreateIndex
CREATE INDEX "auctions_itemType_idx" ON "auctions"("itemType");

-- CreateIndex
CREATE INDEX "auctions_listingType_idx" ON "auctions"("listingType");

-- CreateIndex
CREATE INDEX "bids_auctionId_idx" ON "bids"("auctionId");

-- CreateIndex
CREATE INDEX "bids_bidderId_idx" ON "bids"("bidderId");

-- AddForeignKey
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "auctions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
