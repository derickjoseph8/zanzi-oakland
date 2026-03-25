"use client";

import { useState } from "react";
import { Loader2, Save, Plus, Trash2, Image as ImageIcon, Type, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

interface PageContentEditorProps {
  initialContent: Record<string, any[]>;
}

// Default content structure for the homepage
const defaultHomepageContent = {
  hero: {
    badge: "Oakland's Premier International Nightclub",
    title_line1: "Experience",
    title_line2: "The Night",
    subtitle: "Where diverse cultures unite under one roof. World-class DJs, premium bottle service, and an atmosphere unlike any other.",
    cta_primary: "Reserve a Table",
    cta_secondary: "View Events",
    stat1_value: "5+",
    stat1_label: "Years Open",
    stat2_value: "500+",
    stat2_label: "Events Hosted",
    stat3_value: "100K+",
    stat3_label: "Happy Guests",
    stat4_value: "2K+",
    stat4_label: "5-Star Reviews",
  },
  features: {
    title: "Why Zanzi?",
    subtitle: "We offer more than just a night out. Experience Oakland's most diverse and inclusive nightlife destination.",
    feature1_title: "International Vibes",
    feature1_description: "Music from around the world. Afrobeats, Latin, Hip-Hop, R&B, and more. Everyone is welcome.",
    feature2_title: "Premium Bottle Service",
    feature2_description: "VIP tables with dedicated servers, top-shelf spirits, and the best views in the house.",
    feature3_title: "Unforgettable Events",
    feature3_description: "Weekly themed nights, celebrity appearances, and special holiday celebrations.",
  },
  vip: {
    badge: "VIP Experience",
    title: "Elevate Your Night with Bottle Service",
    description: "Reserve a private table, enjoy premium spirits, and receive VIP treatment all night long. Our dedicated hosts ensure your experience is nothing short of exceptional.",
    benefit1: "Priority entry - skip the line",
    benefit2: "Dedicated VIP host",
    benefit3: "Premium bottle selection",
    benefit4: "Best views and seating",
    cta_primary: "View Packages",
    cta_secondary: "Reserve Now",
  },
  newsletter: {
    title: "Stay in the Loop",
    subtitle: "Get exclusive access to event announcements, VIP offers, and special promotions.",
    placeholder: "Enter your email",
    button: "Subscribe",
    disclaimer: "By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.",
  },
  cta: {
    title: "Ready to Experience Zanzi?",
    subtitle: "Book your table now and secure your spot for an unforgettable night.",
    button: "Reserve Your Table",
  },
};

export function PageContentEditor({ initialContent }: PageContentEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState<Record<string, Record<string, string>>>(() => {
    // Convert initial content array to object
    const contentObj: Record<string, Record<string, string>> = {};

    Object.entries(initialContent).forEach(([page, items]) => {
      contentObj[page] = {};
      items.forEach((item: any) => {
        contentObj[page][`${item.section}_${item.key}`] = item.value;
      });
    });

    // Merge with defaults for homepage
    if (!contentObj.home) {
      contentObj.home = {};
    }
    Object.entries(defaultHomepageContent).forEach(([section, fields]) => {
      Object.entries(fields).forEach(([key, value]) => {
        if (!contentObj.home[`${section}_${key}`]) {
          contentObj.home[`${section}_${key}`] = value;
        }
      });
    });

    return contentObj;
  });

  const updateContent = (page: string, sectionKey: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      [page]: {
        ...prev[page],
        [sectionKey]: value,
      },
    }));
  };

  const saveContent = async (page: string) => {
    setIsSubmitting(true);
    try {
      const items = Object.entries(content[page] || {}).map(([sectionKey, value]) => {
        const [section, ...keyParts] = sectionKey.split("_");
        const key = keyParts.join("_");
        return { page, section, key, value, type: "TEXT" };
      });

      const response = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) throw new Error("Failed to save");

      toast({
        title: "Content Saved",
        description: `${page.charAt(0).toUpperCase() + page.slice(1)} page content has been updated.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ContentField = ({
    page,
    section,
    fieldKey,
    label,
    multiline = false,
    placeholder,
  }: {
    page: string;
    section: string;
    fieldKey: string;
    label: string;
    multiline?: boolean;
    placeholder?: string;
  }) => {
    const sectionKey = `${section}_${fieldKey}`;
    const value = content[page]?.[sectionKey] || "";

    return (
      <div className="space-y-2">
        <Label htmlFor={sectionKey}>{label}</Label>
        {multiline ? (
          <Textarea
            id={sectionKey}
            value={value}
            onChange={(e) => updateContent(page, sectionKey, e.target.value)}
            placeholder={placeholder}
            rows={3}
          />
        ) : (
          <Input
            id={sectionKey}
            value={value}
            onChange={(e) => updateContent(page, sectionKey, e.target.value)}
            placeholder={placeholder}
          />
        )}
      </div>
    );
  };

  return (
    <Tabs defaultValue="home" className="w-full">
      <TabsList>
        <TabsTrigger value="home">Homepage</TabsTrigger>
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
      </TabsList>

      {/* Homepage */}
      <TabsContent value="home" className="mt-6 space-y-6">
        {/* Hero Section */}
        <Card glass>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>The main banner at the top of your homepage</CardDescription>
              </div>
              <Badge>Section 1</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ContentField page="home" section="hero" fieldKey="badge" label="Badge Text" />
            <div className="grid sm:grid-cols-2 gap-4">
              <ContentField page="home" section="hero" fieldKey="title_line1" label="Title Line 1" />
              <ContentField page="home" section="hero" fieldKey="title_line2" label="Title Line 2" />
            </div>
            <ContentField page="home" section="hero" fieldKey="subtitle" label="Subtitle" multiline />
            <div className="grid sm:grid-cols-2 gap-4">
              <ContentField page="home" section="hero" fieldKey="cta_primary" label="Primary Button Text" />
              <ContentField page="home" section="hero" fieldKey="cta_secondary" label="Secondary Button Text" />
            </div>
            <Separator />
            <p className="text-sm text-white/60">Statistics</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <ContentField page="home" section="hero" fieldKey="stat1_value" label="Stat 1 Value" />
                <ContentField page="home" section="hero" fieldKey="stat1_label" label="Stat 1 Label" />
              </div>
              <div className="space-y-2">
                <ContentField page="home" section="hero" fieldKey="stat2_value" label="Stat 2 Value" />
                <ContentField page="home" section="hero" fieldKey="stat2_label" label="Stat 2 Label" />
              </div>
              <div className="space-y-2">
                <ContentField page="home" section="hero" fieldKey="stat3_value" label="Stat 3 Value" />
                <ContentField page="home" section="hero" fieldKey="stat3_label" label="Stat 3 Label" />
              </div>
              <div className="space-y-2">
                <ContentField page="home" section="hero" fieldKey="stat4_value" label="Stat 4 Value" />
                <ContentField page="home" section="hero" fieldKey="stat4_label" label="Stat 4 Label" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card glass>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Features Section</CardTitle>
                <CardDescription>&quot;Why Zanzi?&quot; section highlighting your venue</CardDescription>
              </div>
              <Badge>Section 2</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ContentField page="home" section="features" fieldKey="title" label="Section Title" />
            <ContentField page="home" section="features" fieldKey="subtitle" label="Section Subtitle" multiline />
            <Separator />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <ContentField page="home" section="features" fieldKey="feature1_title" label="Feature 1 Title" />
                <ContentField page="home" section="features" fieldKey="feature1_description" label="Feature 1 Description" multiline />
              </div>
              <div className="space-y-2">
                <ContentField page="home" section="features" fieldKey="feature2_title" label="Feature 2 Title" />
                <ContentField page="home" section="features" fieldKey="feature2_description" label="Feature 2 Description" multiline />
              </div>
              <div className="space-y-2">
                <ContentField page="home" section="features" fieldKey="feature3_title" label="Feature 3 Title" />
                <ContentField page="home" section="features" fieldKey="feature3_description" label="Feature 3 Description" multiline />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VIP Section */}
        <Card glass>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>VIP Section</CardTitle>
                <CardDescription>Bottle service promotion</CardDescription>
              </div>
              <Badge>Section 3</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ContentField page="home" section="vip" fieldKey="badge" label="Badge Text" />
            <ContentField page="home" section="vip" fieldKey="title" label="Title" />
            <ContentField page="home" section="vip" fieldKey="description" label="Description" multiline />
            <Separator />
            <p className="text-sm text-white/60">Benefits List</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <ContentField page="home" section="vip" fieldKey="benefit1" label="Benefit 1" />
              <ContentField page="home" section="vip" fieldKey="benefit2" label="Benefit 2" />
              <ContentField page="home" section="vip" fieldKey="benefit3" label="Benefit 3" />
              <ContentField page="home" section="vip" fieldKey="benefit4" label="Benefit 4" />
            </div>
            <Separator />
            <div className="grid sm:grid-cols-2 gap-4">
              <ContentField page="home" section="vip" fieldKey="cta_primary" label="Primary Button" />
              <ContentField page="home" section="vip" fieldKey="cta_secondary" label="Secondary Button" />
            </div>
          </CardContent>
        </Card>

        {/* Newsletter Section */}
        <Card glass>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Newsletter Section</CardTitle>
                <CardDescription>Email signup section</CardDescription>
              </div>
              <Badge>Section 4</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ContentField page="home" section="newsletter" fieldKey="title" label="Title" />
            <ContentField page="home" section="newsletter" fieldKey="subtitle" label="Subtitle" />
            <div className="grid sm:grid-cols-2 gap-4">
              <ContentField page="home" section="newsletter" fieldKey="placeholder" label="Input Placeholder" />
              <ContentField page="home" section="newsletter" fieldKey="button" label="Button Text" />
            </div>
            <ContentField page="home" section="newsletter" fieldKey="disclaimer" label="Disclaimer Text" />
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card glass>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Final CTA Section</CardTitle>
                <CardDescription>Call-to-action at the bottom of the page</CardDescription>
              </div>
              <Badge>Section 5</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ContentField page="home" section="cta" fieldKey="title" label="Title" />
            <ContentField page="home" section="cta" fieldKey="subtitle" label="Subtitle" />
            <ContentField page="home" section="cta" fieldKey="button" label="Button Text" />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => saveContent("home")} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Homepage Content
              </>
            )}
          </Button>
        </div>
      </TabsContent>

      {/* About Page */}
      <TabsContent value="about" className="mt-6">
        <Card glass className="p-8 text-center">
          <Type className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">About Page Editor</h3>
          <p className="text-white/60 mb-4">
            Edit your About page content including mission statement, history, and team info.
          </p>
          <p className="text-sm text-white/40">Coming soon...</p>
        </Card>
      </TabsContent>

      {/* Contact Page */}
      <TabsContent value="contact" className="mt-6">
        <Card glass className="p-8 text-center">
          <Type className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Contact Page Editor</h3>
          <p className="text-white/60 mb-4">
            Edit FAQ, contact info display, and form labels.
          </p>
          <p className="text-sm text-white/40">Coming soon...</p>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
