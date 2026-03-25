import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { PageContentEditor } from "@/components/admin/page-content-editor";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { db } from "@/lib/db";

async function getPageContent() {
  const content = await db.siteContent.findMany({
    orderBy: [{ page: "asc" }, { section: "asc" }, { order: "asc" }],
  });

  // Group by page
  const grouped: Record<string, any[]> = {};
  content.forEach((item) => {
    if (!grouped[item.page]) {
      grouped[item.page] = [];
    }
    grouped[item.page].push(item);
  });

  return grouped;
}

export default async function PageEditorPage() {
  const session = await auth();

  if (!session?.user || !hasPermission(session.user.role, "site.content.view")) {
    redirect("/admin/dashboard");
  }

  const content = await getPageContent();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Page Editor</h1>
          <p className="text-white/60 mt-1">
            Edit text, images, and content on your website pages
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Shield className="h-3 w-3" />
          Admin Only
        </Badge>
      </div>

      <PageContentEditor initialContent={content} />
    </div>
  );
}
