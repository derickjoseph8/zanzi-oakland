import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasPermission, canManageRole, getCreatableRoles } from "@/lib/permissions";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "MANAGER", "STAFF"]),
});

// Get all staff - Manager+
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "staff.view")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    });

    // Filter out users that the current user can't manage
    const visibleUsers = users.filter(
      (user) =>
        user.id === session.user.id || // Can always see self
        canManageRole(session.user.role, user.role) ||
        session.user.role === "ADMIN" // Admin sees everyone
    );

    return NextResponse.json({ users: visibleUsers });
  } catch (error) {
    console.error("Staff fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

// Create staff member - Manager+ (can only create roles below their level)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "staff.create")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Check if user can create this role
    const creatableRoles = getCreatableRoles(session.user.role);
    if (!creatableRoles.includes(validatedData.role as any)) {
      return NextResponse.json(
        { error: `You cannot create users with role: ${validatedData.role}` },
        { status: 403 }
      );
    }

    // Check if email already exists
    const existing = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 12);

    const user = await db.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        password: hashedPassword,
        role: validatedData.role as any,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error("Staff create error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create staff member" },
      { status: 500 }
    );
  }
}
