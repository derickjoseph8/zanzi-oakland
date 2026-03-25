"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface SiteSettingsFormProps {
  initialSettings: Record<string, any>;
}

export function SiteSettingsForm({ initialSettings }: SiteSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      businessName: initialSettings.business_name?.value?.name || "Zanzi Oakland",
      tagline: initialSettings.tagline?.value || "Oakland's Premier International Nightclub",
      email: initialSettings.contact?.value?.email || "",
      phone: initialSettings.contact?.value?.phone || "",
      address: initialSettings.contact?.value?.address || "",
      instagram: initialSettings.social?.value?.instagram || "",
      facebook: initialSettings.social?.value?.facebook || "",
      twitter: initialSettings.social?.value?.twitter || "",
      fridayHours: initialSettings.business_hours?.value?.friday || "9:00 PM - 2:00 AM",
      saturdayHours: initialSettings.business_hours?.value?.saturday || "10:00 PM - 3:00 AM",
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const settings = {
        business_name: { name: data.businessName },
        tagline: data.tagline,
        contact: {
          email: data.email,
          phone: data.phone,
          address: data.address,
        },
        social: {
          instagram: data.instagram,
          facebook: data.facebook,
          twitter: data.twitter,
        },
        business_hours: {
          monday: "Closed",
          tuesday: "Closed",
          wednesday: "Closed",
          thursday: "Closed",
          friday: data.fridayHours,
          saturday: data.saturdayHours,
          sunday: "Closed",
        },
      };

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) throw new Error("Failed to save");

      toast({
        title: "Settings Saved",
        description: "Your site settings have been updated.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Business Info */}
      <Card glass>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Basic information about your venue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" {...register("businessName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" {...register("tagline")} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card glass>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>How customers can reach you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" {...register("phone")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" rows={2} {...register("address")} />
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card glass>
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
          <CardDescription>Your social media profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram URL</Label>
              <Input id="instagram" {...register("instagram")} placeholder="https://instagram.com/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook URL</Label>
              <Input id="facebook" {...register("facebook")} placeholder="https://facebook.com/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter URL</Label>
              <Input id="twitter" {...register("twitter")} placeholder="https://twitter.com/..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card glass>
        <CardHeader>
          <CardTitle>Business Hours</CardTitle>
          <CardDescription>When you&apos;re open for business</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fridayHours">Friday Hours</Label>
              <Input id="fridayHours" {...register("fridayHours")} placeholder="9:00 PM - 2:00 AM" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="saturdayHours">Saturday Hours</Label>
              <Input id="saturdayHours" {...register("saturdayHours")} placeholder="10:00 PM - 3:00 AM" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
