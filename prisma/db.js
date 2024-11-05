const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient({
  log: ["query", "error", "info", "warn"],
});

prisma.$connect().then(() => {
  console.log("\u001b[1;32mDATABASE CONNECTED");
}).catch(() => {
  console.log("\u001b[1;31m[ERROR] DATABASE CONNECTION FAILED");
});

module.exports = prisma;
