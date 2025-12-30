import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

// Use direct connection for seeding (not pooler)
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
});

async function main() {
  console.log("🌱 Seeding admin user...");

  // Hash password
  const hashedPassword = await bcrypt.hash("Neluchu321.", 10);

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "mateusz.goszczycki1994@gmail.com" },
  });

  if (existingAdmin) {
    console.log("⚠️  Admin user already exists!");
    console.log("📧 Email:", existingAdmin.email);
    console.log("👤 Username:", existingAdmin.username);
    console.log("🔑 Role:", existingAdmin.role);
    return;
  }

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: "mateusz.goszczycki1994@gmail.com",
      username: "mateusz_admin",
      password: hashedPassword,
      name: "Mateusz",
      lastName: "Goszczycki",
      birthDate: new Date("1994-01-01"), // Adjust if needed
      country: "PL",
      phone: "+48000000000", // Placeholder - update if you have real number
      isVerified: true, // Email verified
      role: "admin", // Admin role
      status: "active",
      rating: 5.0,
      reviews: 0,
      sales: 0,
      positivePercentage: 100,
      avgShippingTime: "2-3 days",
      failedLoginAttempts: 0,
      accountLocked: false,
    },
  });

  console.log("✅ Admin user created successfully!");
  console.log("📧 Email:", admin.email);
  console.log("👤 Username:", admin.username);
  console.log("🔑 Role:", admin.role);
  console.log("✅ Email verified:", admin.isVerified);
  console.log("📱 Phone:", admin.phone);
  console.log("\n🔐 Login credentials:");
  console.log("   Email: mateusz.goszczycki1994@gmail.com");
  console.log("   Password: Neluchu321.");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
