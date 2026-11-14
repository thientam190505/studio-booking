import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [services, staff] = await Promise.all([
    prisma.service.findMany({ where: { active: true }, orderBy: { price: "asc" } }),
    prisma.staff.findMany({ include: { user: { select: { name: true } } } }),
  ]);
  return NextResponse.json({
    services,
    staff: staff.map((s) => ({ id: s.id, name: s.user.name, specialty: s.specialty })),
  });
}
