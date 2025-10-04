// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { name: "Admin User", email: "admin@example.com", password: "admin", role: "ADMIN" },
      { name: "Manager User", email: "manager@example.com", password: "manager", role: "MANAGER" },
      { name: "Employee User", email: "employee@example.com", password: "employee", role: "EMPLOYEE" },
    ],
  });
}

main()
  .then(() => console.log("Database seeded"))
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
