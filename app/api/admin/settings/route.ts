import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

// Get settings - Admin only for secrets, Manager+ for non-secrets
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeSecrets = searchParams.get("includeSecrets") === "true";

    // Only admin can view secrets (API keys)
    const canViewSecrets = hasPermission(session.user.role, "site.apikeys.view");

    const where = includeSecrets && canViewSecrets ? {} : { isSecret: false };

    const settings = await db.setting.findMany({ where });

    // Convert to object format
    const settingsObj: Record<string, any> = {};
    settings.forEach((setting) => {
      // Mask secret values for display
      if (setting.isSecret && !canViewSecrets) {
        settingsObj[setting.key] = { masked: true };
      } else {
        settingsObj[setting.key] = setting.value;
      }
    });

    return NextResponse.json({ settings: settingsObj });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// Update settings - Admin only
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "site.settings.edit")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { key, value, isSecret = false } = body;

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    // Extra check for API keys
    if (isSecret && !hasPermission(session.user.role, "site.apikeys.edit")) {
      return NextResponse.json(
        { error: "Not authorized to modify API keys" },
        { status: 403 }
      );
    }

    const setting = await db.setting.upsert({
      where: { key },
      update: { value, isSecret },
      create: { key, value, isSecret },
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

// Bulk update settings - Admin only
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "site.settings.edit")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Settings object is required" },
        { status: 400 }
      );
    }

    const canEditSecrets = hasPermission(session.user.role, "site.apikeys.edit");

    // Check if trying to update secrets without permission
    const existingSettings = await db.setting.findMany({
      where: { key: { in: Object.keys(settings) } },
    });
    const secretKeys = existingSettings
      .filter((s) => s.isSecret)
      .map((s) => s.key);

    if (!canEditSecrets && Object.keys(settings).some((k) => secretKeys.includes(k))) {
      return NextResponse.json(
        { error: "Not authorized to modify API keys" },
        { status: 403 }
      );
    }

    // Update all settings
    const results = await db.$transaction(
      Object.entries(settings).map(([key, value]) =>
        db.setting.upsert({
          where: { key },
          update: { value: value as any },
          create: { key, value: value as any },
        })
      )
    );

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error("Settings bulk update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

// Delete setting - Admin only
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "site.settings.edit")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    // Check if it's a secret
    const setting = await db.setting.findUnique({ where: { key } });
    if (setting?.isSecret && !hasPermission(session.user.role, "site.apikeys.edit")) {
      return NextResponse.json(
        { error: "Not authorized to delete API keys" },
        { status: 403 }
      );
    }

    await db.setting.delete({ where: { key } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete setting" },
      { status: 500 }
    );
  }
}
