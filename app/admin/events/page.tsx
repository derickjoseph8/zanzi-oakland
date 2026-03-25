"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Calendar,
  Ticket,
  Eye,
  EyeOff,
  Star,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { formatCurrency, formatDate, getEventStatus } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  endDate: string | null;
  poster: string | null;
  isTicketed: boolean;
  ticketPrice: string | null;
  ticketLimit: number | null;
  ticketsSold: number;
  isFeatured: boolean;
  isPublished: boolean;
  genre: string | null;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/events");
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished }),
      });

      if (!response.ok) throw new Error("Failed to update");

      toast({
        title: isPublished ? "Event Unpublished" : "Event Published",
        description: isPublished
          ? "Event is now hidden from the public"
          : "Event is now visible to the public",
        variant: "success",
      });

      fetchEvents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    }
  };

  const toggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });

      if (!response.ok) throw new Error("Failed to update");

      toast({
        title: isFeatured ? "Removed from Featured" : "Added to Featured",
        variant: "success",
      });

      fetchEvents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    }
  };

  const deleteEvent = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/events/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast({
        title: "Event Deleted",
        variant: "success",
      });

      setDeleteId(null);
      fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.date) >= now);
  const pastEvents = events.filter((e) => new Date(e.date) < now);

  const filteredEvents = (list: Event[]) =>
    list.filter((e) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query)
      );
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Events</h1>
          <p className="text-white/60 mt-1">Create and manage events</p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Events Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastEvents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <EventGrid
            events={filteredEvents(upcomingEvents)}
            loading={loading}
            onTogglePublish={togglePublish}
            onToggleFeatured={toggleFeatured}
            onDelete={(id) => setDeleteId(id)}
          />
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <EventGrid
            events={filteredEvents(pastEvents)}
            loading={loading}
            onTogglePublish={togglePublish}
            onToggleFeatured={toggleFeatured}
            onDelete={(id) => setDeleteId(id)}
            isPast
          />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteEvent}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EventGrid({
  events,
  loading,
  onTogglePublish,
  onToggleFeatured,
  onDelete,
  isPast = false,
}: {
  events: Event[];
  loading: boolean;
  onTogglePublish: (id: string, isPublished: boolean) => void;
  onToggleFeatured: (id: string, isFeatured: boolean) => void;
  onDelete: (id: string) => void;
  isPast?: boolean;
}) {
  if (loading) {
    return <div className="text-center text-white/60 py-12">Loading...</div>;
  }

  if (events.length === 0) {
    return (
      <Card glass className="p-12 text-center">
        <Calendar className="h-12 w-12 text-white/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Events</h3>
        <p className="text-white/60 mb-6">
          {isPast ? "No past events to show." : "Create your first event to get started."}
        </p>
        {!isPast && (
          <Button asChild>
            <Link href="/admin/events/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Link>
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <Card key={event.id} glass className="overflow-hidden">
          <div className="aspect-video relative">
            {event.poster ? (
              <Image
                src={event.poster}
                alt={event.title}
                fill
                className={`object-cover ${isPast ? "grayscale opacity-70" : ""}`}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-black to-gold-600" />
            )}
            <div className="absolute top-2 left-2 flex gap-2">
              {!event.isPublished && (
                <Badge variant="secondary">
                  <EyeOff className="h-3 w-3 mr-1" />
                  Draft
                </Badge>
              )}
              {event.isFeatured && (
                <Badge>
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{event.title}</h3>
                <p className="text-sm text-white/60">{formatDate(event.date)}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/events/${event.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/events/${event.slug}`} target="_blank">
                      <Eye className="h-4 w-4 mr-2" />
                      View on Site
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onTogglePublish(event.id, event.isPublished)}
                  >
                    {event.isPublished ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Publish
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onToggleFeatured(event.id, event.isFeatured)}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {event.isFeatured ? "Remove Featured" : "Make Featured"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(event.id)}
                    className="text-red-400"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {event.isTicketed && (
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gold-500 font-semibold">
                  {formatCurrency(Number(event.ticketPrice))}
                </span>
                <span className="text-white/50">
                  {event.ticketsSold}/{event.ticketLimit || "∞"} sold
                </span>
              </div>
            )}

            {event.genre && (
              <Badge variant="outline" className="mt-3">
                {event.genre}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
