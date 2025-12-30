// Test script to verify environment variables are loaded
require("dotenv").config();

console.log("=== Environment Variables Test ===");
console.log(
  "DATABASE_URL:",
  process.env.DATABASE_URL ? "✓ Loaded" : "✗ Not found"
);
console.log("DIRECT_URL:", process.env.DIRECT_URL ? "✓ Loaded" : "✗ Not found");
console.log("PORT:", process.env.PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);

if (process.env.DATABASE_URL) {
  // Mask password for security
  const maskedUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@");
  console.log("\nDatabase URL (masked):", maskedUrl);
}
