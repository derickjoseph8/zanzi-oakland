import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { Role } from "@prisma/client";

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
    const { name, description, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Section name is required" },
        { status: 400 }
      );
    }

    const maxOrder = await db.section.aggregate({
      _max: { order: true },
    });

    const section = await db.section.create({
      data: {
        name,
        description: description || null,
        color: color || "#d4af37",
        order: (maxOrder._max.order || 0) + 1,
      },
    });

    return NextResponse.json({ section }, { status: 201 });
  } catch (error) {
    console.error("Error creating section:", error);
    return NextResponse.json(
      { error: "Failed to create section" },
      { status: 500 }
    );
  }
}
