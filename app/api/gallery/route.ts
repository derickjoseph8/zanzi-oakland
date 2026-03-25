import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = { isPublished: true };

    if (category && category !== "all") {
      where.category = category;
    }

    const images = await db.galleryImage.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      take: limit,
    });

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Gallery fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
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
    const { url, thumbnail, caption, category, tags, width, height, isFeatured } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const image = await db.galleryImage.create({
      data: {
        url,
        thumbnail: thumbnail || null,
        caption: caption || null,
        category: category || null,
        tags: tags || [],
        width: width || null,
        height: height || null,
        isFeatured: isFeatured || false,
        isPublished: true,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("Gallery image creation error:", error);
    return NextResponse.json(
      { error: "Failed to add image" },
      { status: 500 }
    );
  }
}
