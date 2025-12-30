// Script to check the number of registered users in the database
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkUsersCount() {
  try {
    console.log("🔍 Connecting to database...\n");

    // Get total count of users
    const totalUsers = await prisma.user.count();

    // Get count by role
    const adminUsers = await prisma.user.count({
      where: { role: "admin" },
    });

    const regularUsers = await prisma.user.count({
      where: { role: "user" },
    });

    // Get count by status
    const activeUsers = await prisma.user.count({
      where: { status: "active" },
    });

    const suspendedUsers = await prisma.user.count({
      where: { status: "suspended" },
    });

    const bannedUsers = await prisma.user.count({
      where: { status: "banned" },
    });

    // Get verified users count
    const verifiedUsers = await prisma.user.count({
      where: { isVerified: true },
    });

    // Get users with Stripe accounts
    const usersWithStripe = await prisma.user.count({
      where: {
        stripeAccountId: { not: null },
        stripeOnboardingComplete: true,
      },
    });

    // Display results
    console.log("═══════════════════════════════════════════════════════");
    console.log("📊 MATCHDAYS - USER STATISTICS");
    console.log("═══════════════════════════════════════════════════════\n");

    console.log("👥 TOTAL REGISTERED USERS:", totalUsers);
    console.log("");

    console.log("📋 BY ROLE:");
    console.log("   • Administrators:", adminUsers);
    console.log("   • Regular Users:", regularUsers);
    console.log("");

    console.log("🔐 BY STATUS:");
    console.log("   • Active:", activeUsers);
    console.log("   • Suspended:", suspendedUsers);
    console.log("   • Banned:", bannedUsers);
    console.log("");

    console.log("✅ VERIFICATION:");
    console.log("   • Verified Users:", verifiedUsers);
    console.log("   • Unverified Users:", totalUsers - verifiedUsers);
    console.log("");

    console.log("💳 STRIPE INTEGRATION:");
    console.log("   • Users with Stripe Account:", usersWithStripe);
    console.log("");

    console.log("═══════════════════════════════════════════════════════\n");

    // Get some additional stats
    const usersWithAuctions = await prisma.user.count({
      where: {
        createdAuctions: {
          some: {},
        },
      },
    });

    const usersWithBids = await prisma.user.count({
      where: {
        bids: {
          some: {},
        },
      },
    });

    console.log("📈 ACTIVITY STATS:");
    console.log("   • Users who created auctions:", usersWithAuctions);
    console.log("   • Users who placed bids:", usersWithBids);
    console.log("");

    console.log("═══════════════════════════════════════════════════════\n");
  } catch (error) {
    console.error("❌ Error checking users count:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
checkUsersCount();
