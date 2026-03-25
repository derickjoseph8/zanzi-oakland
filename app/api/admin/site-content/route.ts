import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

// Get site content - Admin only
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "site.content.view")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page");

    const where = page ? { page } : {};

    const content = await db.siteContent.findMany({
      where,
      orderBy: [{ page: "asc" }, { section: "asc" }, { order: "asc" }],
    });

    // Group by page and section for easier frontend handling
    const grouped = content.reduce((acc, item) => {
      if (!acc[item.page]) {
        acc[item.page] = {};
      }
      if (!acc[item.page][item.section]) {
        acc[item.page][item.section] = {};
      }
      acc[item.page][item.section][item.key] = {
        id: item.id,
        value: item.value,
        type: item.type,
        order: item.order,
        isPublished: item.isPublished,
      };
      return acc;
    }, {} as Record<string, Record<string, Record<string, any>>>);

    return NextResponse.json({ content, grouped });
  } catch (error) {
    console.error("Site content fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch site content" },
      { status: 500 }
    );
  }
}

// Update or create site content - Admin only
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "site.content.edit")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { page, section, key, value, type = "TEXT", order = 0, isPublished = true } = body;

    if (!page || !section || !key) {
      return NextResponse.json(
        { error: "Page, section, and key are required" },
        { status: 400 }
      );
    }

    const content = await db.siteContent.upsert({
      where: {
        page_section_key: { page, section, key },
      },
      update: {
        value,
        type,
        order,
        isPublished,
      },
      create: {
        page,
        section,
        key,
        value,
        type,
        order,
        isPublished,
      },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error("Site content update error:", error);
    return NextResponse.json(
      { error: "Failed to update site content" },
      { status: 500 }
    );
  }
}

// Bulk update site content - Admin only
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "site.content.edit")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items array is required" },
        { status: 400 }
      );
    }

    // Use transaction for bulk updates
    const results = await db.$transaction(
      items.map((item: any) =>
        db.siteContent.upsert({
          where: {
            page_section_key: {
              page: item.page,
              section: item.section,
              key: item.key,
            },
          },
          update: {
            value: item.value,
            type: item.type || "TEXT",
            order: item.order || 0,
            isPublished: item.isPublished ?? true,
          },
          create: {
            page: item.page,
            section: item.section,
            key: item.key,
            value: item.value,
            type: item.type || "TEXT",
            order: item.order || 0,
            isPublished: item.isPublished ?? true,
          },
        })
      )
    );

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error("Site content bulk update error:", error);
    return NextResponse.json(
      { error: "Failed to update site content" },
      { status: 500 }
    );
  }
}
