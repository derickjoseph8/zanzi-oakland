import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user.role as Role) || Role.STAFF;
    if (!hasPermission(userRole, "tables.view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const sections = await db.section.findMany({
      include: {
        tables: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("Error fetching tables:", error);
    return NextResponse.json(
      { error: "Failed to fetch tables" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user.role as Role) || Role.STAFF;
    if (!hasPermission(userRole, "tables.create")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, sectionId, capacity, minimumSpend, depositRequired, requiresBottle, shape } = body;

    if (!name || !sectionId) {
      return NextResponse.json(
        { error: "Name and section are required" },
        { status: 400 }
      );
    }

    const table = await db.table.create({
      data: {
        name,
        sectionId,
        capacity: capacity || 6,
        minimumSpend: minimumSpend || null,
        depositRequired: depositRequired || null,
        requiresBottle: requiresBottle || false,
        shape: shape || "BOOTH",
        position: { x: 100, y: 100, width: 100, height: 80 },
      },
    });

    return NextResponse.json({ table }, { status: 201 });
  } catch (error) {
    console.error("Error creating table:", error);
    return NextResponse.json(
      { error: "Failed to create table" },
      { status: 500 }
    );
  }
}
