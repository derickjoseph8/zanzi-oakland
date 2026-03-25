import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { ApiKeysForm } from "@/components/admin/api-keys-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, Key, Globe, Palette } from "lucide-react";
import { db } from "@/lib/db";

async function getSettings() {
  const settings = await db.setting.findMany();
  const settingsObj: Record<string, any> = {};
  settings.forEach((s) => {
    settingsObj[s.key] = { value: s.value, isSecret: s.isSecret };
  });
  return settingsObj;
}

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user || !hasPermission(session.user.role, "site.settings.view")) {
    redirect("/admin/dashboard");
  }

  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Site Settings</h1>
          <p className="text-white/60 mt-1">
            Manage your website settings, integrations, and API keys
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Shield className="h-3 w-3" />
          Admin Only
        </Badge>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <SiteSettingsForm initialSettings={settings} />
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card glass>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize colors, fonts, and visual elements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/60">
                Appearance customization coming soon. Use the Page Editor to update content.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="mt-6">
          <ApiKeysForm initialSettings={settings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
