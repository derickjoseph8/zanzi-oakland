"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Ticket, Upload, X, Save, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function NewEventPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    date: "",
    endDate: "",
    poster: "",
    isTicketed: false,
    ticketPrice: "",
    ticketLimit: "",
    isFeatured: false,
    isPublished: false,
    genre: "",
    ageLimit: "21",
  });

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("type", "event");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setFormData({ ...formData, poster: data.url });

      toast({
        title: "Image uploaded",
        description: "Your event poster has been uploaded",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, poster: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.title || formData.title.length < 3) {
      toast({
        title: "Validation Error",
        description: "Title must be at least 3 characters",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!formData.description || formData.description.length < 10) {
      toast({
        title: "Validation Error",
        description: "Description must be at least 10 characters",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!formData.date) {
      toast({
        title: "Validation Error",
        description: "Please select an event date",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug || generateSlug(formData.title),
          description: formData.description,
          date: new Date(formData.date).toISOString(),
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
          poster: formData.poster || null,
          isTicketed: formData.isTicketed,
          ticketPrice: formData.ticketPrice ? parseFloat(formData.ticketPrice) : null,
          ticketLimit: formData.ticketLimit ? parseInt(formData.ticketLimit) : null,
          isFeatured: formData.isFeatured,
          isPublished: formData.isPublished,
          genre: formData.genre || null,
          ageLimit: parseInt(formData.ageLimit) || 21,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create event");
      }

      toast({
        title: "Event Created",
        description: "Your event has been created successfully",
        variant: "success",
      });

      router.push("/admin/events");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/events">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Create Event</h1>
          <p className="text-white/60 mt-1">Add a new event to your calendar</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Details
              </CardTitle>
              <CardDescription>Basic information about the event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Friday Night Vibes"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  placeholder="auto-generated-from-title"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-white/40">URL: /events/{formData.slug || "your-event-slug"}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the event in detail..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Start Date & Time *</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date & Time</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre / Category</Label>
                  <Input
                    id="genre"
                    placeholder="e.g., Hip Hop, Latin, House"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageLimit">Age Limit</Label>
                  <select
                    id="ageLimit"
                    value={formData.ageLimit}
                    onChange={(e) => setFormData({ ...formData, ageLimit: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-white/10 bg-white/5 text-white"
                  >
                    <option value="21">21+</option>
                    <option value="18">18+</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media & Ticketing */}
          <div className="space-y-6">
            {/* Event Poster Upload */}
            <Card glass>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Event Poster
                </CardTitle>
                <CardDescription>Upload a square image (recommended: 1080x1080)</CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="poster-upload"
                />

                {imagePreview || formData.poster ? (
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-black/50 border border-white/10">
                    <Image
                      src={imagePreview || formData.poster}
                      alt="Event poster preview"
                      fill
                      className="object-cover"
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center hover:bg-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="poster-upload"
                    className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-white/20 hover:border-gold-500/50 cursor-pointer transition-colors bg-white/5"
                  >
                    <Upload className="h-10 w-10 text-white/30 mb-3" />
                    <span className="text-white/50 text-sm">Click to upload poster</span>
                    <span className="text-white/30 text-xs mt-1">JPG, PNG up to 5MB</span>
                  </label>
                )}
              </CardContent>
            </Card>

            {/* Ticketing */}
            <Card glass>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Ticketing
                </CardTitle>
                <CardDescription>Configure ticket sales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Ticketing</Label>
                    <p className="text-sm text-white/50">Sell tickets for this event</p>
                  </div>
                  <Switch
                    checked={formData.isTicketed}
                    onCheckedChange={(checked) => setFormData({ ...formData, isTicketed: checked })}
                  />
                </div>

                {formData.isTicketed && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div className="space-y-2">
                      <Label htmlFor="ticketPrice">Ticket Price ($)</Label>
                      <Input
                        id="ticketPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="25.00"
                        value={formData.ticketPrice}
                        onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ticketLimit">Ticket Limit</Label>
                      <Input
                        id="ticketLimit"
                        type="number"
                        min="1"
                        placeholder="Unlimited"
                        value={formData.ticketLimit}
                        onChange={(e) => setFormData({ ...formData, ticketLimit: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Publishing */}
            <Card glass>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
                <CardDescription>Control visibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Publish Event</Label>
                    <p className="text-sm text-white/50">Make visible to the public</p>
                  </div>
                  <Switch
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Featured Event</Label>
                    <p className="text-sm text-white/50">Show on homepage</p>
                  </div>
                  <Switch
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/events">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading || uploading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Event
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
