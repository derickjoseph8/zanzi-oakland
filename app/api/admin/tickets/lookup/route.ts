import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as Role;
    if (!hasPermission(userRole, "tickets.scan")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Ticket code is required" }, { status: 400 });
    }

    // Look up ticket by ID or QR code
    const ticket = await db.ticket.findFirst({
      where: {
        OR: [
          { id: code },
          { qrCode: code },
        ],
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({
      ticket: {
        id: ticket.id,
        buyerName: ticket.buyerName,
        buyerEmail: ticket.buyerEmail,
        quantity: ticket.quantity,
        status: ticket.status,
        event: {
          title: ticket.event.title,
          date: ticket.event.date.toISOString(),
        },
        usedAt: ticket.usedAt?.toISOString(),
        createdAt: ticket.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error looking up ticket:", error);
    return NextResponse.json({ error: "Failed to look up ticket" }, { status: 500 });
  }
}
