"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Ticket, Image as ImageIcon, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
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
  });

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error("Event not found");

      const data = await response.json();
      const event = data.event;

      setFormData({
        title: event.title || "",
        description: event.description || "",
        date: event.date ? new Date(event.date).toISOString().slice(0, 16) : "",
        endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
        poster: event.poster || "",
        isTicketed: event.isTicketed || false,
        ticketPrice: event.ticketPrice ? String(event.ticketPrice) : "",
        ticketLimit: event.ticketLimit ? String(event.ticketLimit) : "",
        isFeatured: event.isFeatured || false,
        isPublished: event.isPublished || false,
        genre: event.genre || "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load event",
        variant: "destructive",
      });
      router.push("/admin/events");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ticketPrice: formData.ticketPrice ? parseFloat(formData.ticketPrice) : null,
          ticketLimit: formData.ticketLimit ? parseInt(formData.ticketLimit) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update event");
      }

      toast({
        title: "Event Updated",
        description: "Your changes have been saved",
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
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/events">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Edit Event</h1>
          <p className="text-white/60 mt-1">Update event details</p>
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
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the event..."
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

              <div className="space-y-2">
                <Label htmlFor="genre">Genre / Category</Label>
                <Input
                  id="genre"
                  placeholder="e.g., Hip Hop, Latin, House"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Ticketing & Media */}
          <div className="space-y-6">
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

            <Card glass>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Media
                </CardTitle>
                <CardDescription>Event poster image</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="poster">Poster URL</Label>
                  <Input
                    id="poster"
                    type="url"
                    placeholder="https://example.com/poster.jpg"
                    value={formData.poster}
                    onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                  />
                  <p className="text-xs text-white/40">Upload to your image host and paste the URL</p>
                </div>

                {formData.poster && (
                  <div className="aspect-video relative rounded-lg overflow-hidden bg-black/50">
                    <img
                      src={formData.poster}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

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
                    <p className="text-sm text-white/50">Show on homepage hero</p>
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
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
