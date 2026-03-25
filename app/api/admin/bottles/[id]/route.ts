import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { Role } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user.role as Role) || Role.STAFF;
    if (!hasPermission(userRole, "bottles.edit")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const bottle = await db.bottle.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ bottle });
  } catch (error) {
    console.error("Error updating bottle:", error);
    return NextResponse.json(
      { error: "Failed to update bottle" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user.role as Role) || Role.STAFF;
    if (!hasPermission(userRole, "bottles.delete")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.bottle.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bottle:", error);
    return NextResponse.json(
      { error: "Failed to delete bottle" },
      { status: 500 }
    );
  }
}
