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
    if (!hasPermission(userRole, "bottles.view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const categories = await db.bottleCategory.findMany({
      include: {
        bottles: {
          orderBy: [{ isFeatured: "desc" }, { price: "asc" }],
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching bottles:", error);
    return NextResponse.json(
      { error: "Failed to fetch bottles" },
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
    if (!hasPermission(userRole, "bottles.create")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, categoryId, description, price, size, image, isAvailable, isFeatured } = body;

    if (!name || !categoryId || !price) {
      return NextResponse.json(
        { error: "Name, category, and price are required" },
        { status: 400 }
      );
    }

    const bottle = await db.bottle.create({
      data: {
        name,
        categoryId,
        description: description || null,
        price,
        size: size || null,
        image: image || null,
        isAvailable: isAvailable ?? true,
        isFeatured: isFeatured ?? false,
      },
    });

    return NextResponse.json({ bottle }, { status: 201 });
  } catch (error) {
    console.error("Error creating bottle:", error);
    return NextResponse.json(
      { error: "Failed to create bottle" },
      { status: 500 }
    );
  }
}
