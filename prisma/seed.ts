import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_SERVICES } from "../src/lib/demo-seed";

const prisma = new PrismaClient();

async function main() {
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.timeOff.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  const hash = (p: string) => bcrypt.hashSync(p, 10);

  await prisma.user.create({
    data: { name: "Admin", email: "admin@demo.com", passwordHash: hash("admin123"), role: "ADMIN" },
  });

  const staffData = [
    { name: "Minh Anh", email: "minhanh@demo.com", specialty: "Cắt & tạo kiểu" },
    { name: "Quốc Bảo", email: "quocbao@demo.com", specialty: "Nhuộm & uốn" },
    { name: "Thu Hà", email: "thuha@demo.com", specialty: "Chăm sóc da đầu" },
  ];
  for (const s of staffData) {
    await prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        passwordHash: hash("staff123"),
        role: "STAFF",
        staff: { create: { specialty: s.specialty, workDays: "0,1,2,3,4,5,6" } },
      },
    });
  }

  await prisma.service.createMany({
    data: DEFAULT_SERVICES.map((s) => ({ ...s })),
  });

  console.log("Seed OK. Admin: admin@demo.com / admin123");
}

main().finally(() => prisma.$disconnect());
