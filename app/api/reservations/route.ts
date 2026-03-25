import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reservationSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = reservationSchema.parse(body);

    // Check if table exists and is active
    const table = await db.table.findUnique({
      where: { id: validatedData.tableId, isActive: true },
    });

    if (!table) {
      return NextResponse.json(
        { error: "Table not found or unavailable" },
        { status: 404 }
      );
    }

    // Check if table is already reserved for this date
    const existingReservation = await db.reservation.findFirst({
      where: {
        tableId: validatedData.tableId,
        date: validatedData.date,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (existingReservation) {
      return NextResponse.json(
        { error: "This table is already reserved for the selected date" },
        { status: 409 }
      );
    }

    // Check party size against table capacity
    if (validatedData.partySize > table.capacity) {
      return NextResponse.json(
        { error: `Party size exceeds table capacity of ${table.capacity}` },
        { status: 400 }
      );
    }

    // Create reservation
    const reservation = await db.reservation.create({
      data: {
        tableId: validatedData.tableId,
        eventId: validatedData.eventId || null,
        date: validatedData.date,
        guestName: validatedData.guestName,
        guestEmail: validatedData.guestEmail,
        guestPhone: validatedData.guestPhone,
        partySize: validatedData.partySize,
        specialRequests: validatedData.specialRequests || null,
        occasion: validatedData.occasion || null,
        depositAmount: table.depositRequired,
        depositPaid: false,
        status: table.depositRequired ? "PENDING" : "CONFIRMED",
      },
      include: {
        table: {
          include: { section: true },
        },
        event: true,
      },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error: any) {
    console.error("Reservation creation error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const status = searchParams.get("status");
    const tableId = searchParams.get("tableId");

    const where: any = {};

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.date = { gte: startOfDay, lte: endOfDay };
    }

    if (status) {
      where.status = status;
    }

    if (tableId) {
      where.tableId = tableId;
    }

    const reservations = await db.reservation.findMany({
      where,
      include: {
        table: {
          include: { section: true },
        },
        event: true,
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error("Reservations fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}
