import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as Role;
    if (!hasPermission(userRole, "tickets.validate")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ticketId = params.id;

    // Get the ticket
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: {
          select: { title: true, date: true },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Check if ticket is valid for entry
    if (ticket.status === "USED") {
      return NextResponse.json(
        { error: "Ticket has already been used for entry" },
        { status: 400 }
      );
    }

    if (ticket.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Ticket has been cancelled" },
        { status: 400 }
      );
    }

    if (ticket.status === "REFUNDED") {
      return NextResponse.json(
        { error: "Ticket has been refunded" },
        { status: 400 }
      );
    }

    // Mark ticket as used
    const updatedTicket = await db.ticket.update({
      where: { id: ticketId },
      data: {
        status: "USED",
        usedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${ticket.quantity} ticket(s) validated for ${ticket.buyerName}`,
      ticket: {
        id: updatedTicket.id,
        buyerName: updatedTicket.buyerName,
        quantity: updatedTicket.quantity,
        status: updatedTicket.status,
        usedAt: updatedTicket.usedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error validating ticket:", error);
    return NextResponse.json({ error: "Failed to validate ticket" }, { status: 500 });
  }
}
