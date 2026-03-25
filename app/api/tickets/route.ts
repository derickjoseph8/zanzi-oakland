import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ticketPurchaseSchema } from "@/lib/validations";
import { createPayment } from "@/lib/square";
import QRCode from "qrcode";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceId, ...ticketData } = body;

    const validatedData = ticketPurchaseSchema.parse(ticketData);

    // Get the event
    const event = await db.event.findUnique({
      where: { id: validatedData.eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (!event.isPublished) {
      return NextResponse.json(
        { error: "Event is not available for ticket sales" },
        { status: 400 }
      );
    }

    if (!event.isTicketed || !event.ticketPrice) {
      return NextResponse.json(
        { error: "This event does not require tickets" },
        { status: 400 }
      );
    }

    // Check ticket availability
    if (event.ticketLimit) {
      const availableTickets = event.ticketLimit - event.ticketsSold;
      if (validatedData.quantity > availableTickets) {
        return NextResponse.json(
          { error: `Only ${availableTickets} tickets remaining` },
          { status: 400 }
        );
      }
    }

    const unitPrice = Number(event.ticketPrice);
    const totalPrice = unitPrice * validatedData.quantity;

    // Process payment if sourceId provided
    let paymentId = "";
    let paymentProvider = "square";

    if (sourceId) {
      const paymentResult = await createPayment({
        sourceId,
        amount: totalPrice,
        note: `${validatedData.quantity}x tickets for ${event.title}`,
        referenceId: event.id,
      });

      if (!paymentResult.success) {
        return NextResponse.json(
          { error: paymentResult.error || "Payment failed" },
          { status: 402 }
        );
      }

      paymentId = paymentResult.paymentId || "";
    }

    // Generate QR code
    const qrData = `ZANZI:TKT:${Date.now()}:${event.id}:${validatedData.quantity}`;
    const qrCode = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: "#1a1a2e",
        light: "#ffffff",
      },
    });

    // Create ticket
    const ticket = await db.ticket.create({
      data: {
        eventId: validatedData.eventId,
        buyerName: validatedData.buyerName,
        buyerEmail: validatedData.buyerEmail,
        buyerPhone: validatedData.buyerPhone || null,
        quantity: validatedData.quantity,
        ticketType: validatedData.ticketType,
        unitPrice,
        totalPrice,
        paymentId,
        paymentProvider,
        qrCode,
        status: "VALID",
      },
      include: {
        event: true,
      },
    });

    // Update tickets sold count
    await db.event.update({
      where: { id: event.id },
      data: {
        ticketsSold: { increment: validatedData.quantity },
      },
    });

    // TODO: Send confirmation email

    return NextResponse.json(ticket, { status: 201 });
  } catch (error: any) {
    console.error("Ticket purchase error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to purchase tickets" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const email = searchParams.get("email");

    const where: any = {};

    if (eventId) {
      where.eventId = eventId;
    }

    if (email) {
      where.buyerEmail = email;
    }

    const tickets = await db.ticket.findMany({
      where,
      include: {
        event: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Tickets fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
