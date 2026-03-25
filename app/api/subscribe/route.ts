import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscribeSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = subscribeSchema.parse(body);

    // Check if already subscribed
    const existing = await db.subscriber.findUnique({
      where: { email: validatedData.email },
    });

    if (existing) {
      if (!existing.isActive) {
        // Reactivate subscription
        await db.subscriber.update({
          where: { email: validatedData.email },
          data: { isActive: true },
        });
        return NextResponse.json({ message: "Subscription reactivated" });
      }
      return NextResponse.json({ message: "Already subscribed" });
    }

    // Create new subscriber
    await db.subscriber.create({
      data: {
        email: validatedData.email,
        name: validatedData.name || null,
        source: validatedData.source || "website",
      },
    });

    return NextResponse.json(
      { message: "Successfully subscribed" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Subscribe error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await db.subscriber.update({
      where: { email },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Successfully unsubscribed" });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
