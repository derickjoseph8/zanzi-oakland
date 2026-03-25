import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eventSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get("published");
    const featured = searchParams.get("featured");
    const upcoming = searchParams.get("upcoming");

    const where: any = {};

    if (published === "true") {
      where.isPublished = true;
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    if (upcoming === "true") {
      where.date = { gte: new Date() };
    }

    const events = await db.event.findMany({
      where,
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Events fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = eventSchema.parse(body);

    // Check if slug is unique
    const existingEvent = await db.event.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingEvent) {
      return NextResponse.json(
        { error: "An event with this slug already exists" },
        { status: 409 }
      );
    }

    const event = await db.event.create({
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        description: validatedData.description,
        shortDesc: validatedData.shortDesc || null,
        date: validatedData.date,
        endDate: validatedData.endDate || null,
        doors: validatedData.doors || null,
        poster: validatedData.poster || null,
        isTicketed: validatedData.isTicketed,
        ticketPrice: validatedData.ticketPrice || null,
        ticketLimit: validatedData.ticketLimit || null,
        isFeatured: validatedData.isFeatured,
        isPublished: validatedData.isPublished,
        dressCode: validatedData.dressCode || null,
        ageLimit: validatedData.ageLimit,
        artists: validatedData.artists || [],
        genre: validatedData.genre || null,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error("Event creation error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
