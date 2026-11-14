import { NextResponse } from "next/server";
import { BookingError, createBooking, createBookingSchema } from "@/lib/booking";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  try {
    const booking = await createBooking(parsed.data);
    return NextResponse.json({ code: booking.code }, { status: 201 });
  } catch (e) {
    if (e instanceof BookingError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error(e);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
