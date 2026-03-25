import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MapPin, Music, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { formatDate, formatTime, getEventStatus } from "@/lib/utils";

export const metadata = {
  title: "Events",
  description: "Discover upcoming events at Zanzi Oakland. From themed nights to special performances, find your next unforgettable experience.",
};

async function getEvents() {
  const events = await db.event.findMany({
    where: { isPublished: true },
    orderBy: { date: "asc" },
  });

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.date) >= now);
  const past = events.filter((e) => new Date(e.date) < now).reverse();

  return { upcoming, past };
}

export default async function EventsPage() {
  const { upcoming, past } = await getEvents();

  return (
    <div className="pt-24 pb-16">
      {/* Hero */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <Badge variant="outline" className="mb-4">
            <Calendar className="h-3 w-3 mr-1" />
            Events Calendar
          </Badge>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-4">
            Upcoming Events
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            From world-class DJs to themed nights, there&apos;s always something happening at Zanzi Oakland.
          </p>
        </div>
      </section>

      {/* Events List */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="past">Past Events ({past.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {upcoming.length > 0 ? (
                <div className="space-y-8">
                  {upcoming.map((event, index) => (
                    <EventCard key={event.id} event={event} featured={index === 0} />
                  ))}
                </div>
              ) : (
                <Card glass className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-white/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Upcoming Events</h3>
                  <p className="text-white/60 mb-6">
                    Check back soon for new events, or follow us on social media for announcements.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past">
              {past.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {past.map((event) => (
                    <Link key={event.id} href={`/events/${event.slug}`}>
                      <Card glass className="overflow-hidden card-hover h-full opacity-70 hover:opacity-100 transition-opacity">
                        <div className="aspect-[4/3] relative">
                          {event.poster ? (
                            <Image
                              src={event.poster}
                              alt={event.title}
                              fill
                              className="object-cover grayscale"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-black to-gold-600/50" />
                          )}
                          <div className="absolute inset-0 bg-black/40" />
                          <Badge variant="secondary" className="absolute top-4 left-4">
                            Past Event
                          </Badge>
                        </div>
                        <CardContent className="p-6">
                          <p className="text-white/50 text-sm mb-2">
                            {formatDate(event.date)}
                          </p>
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {event.title}
                          </h3>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card glass className="p-12 text-center">
                  <p className="text-white/60">No past events to show.</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card glass className="p-8 md:p-12 text-center max-w-3xl mx-auto">
            <h2 className="font-serif text-3xl font-bold text-white mb-4">
              Want VIP Treatment?
            </h2>
            <p className="text-white/60 mb-8">
              Skip the line and enjoy premium bottle service at any of our events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/reservations">Reserve a Table</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/bottle-service">View Bottle Service</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

function EventCard({ event, featured = false }: { event: any; featured?: boolean }) {
  const ticketsAvailable = event.ticketLimit
    ? event.ticketLimit - event.ticketsSold
    : null;
  const isAlmostSoldOut = ticketsAvailable !== null && ticketsAvailable < 50;

  if (featured) {
    return (
      <Link href={`/events/${event.slug}`}>
        <Card glass className="overflow-hidden card-hover">
          <div className="grid lg:grid-cols-2">
            <div className="aspect-[4/3] lg:aspect-auto relative img-zoom">
              {event.poster ? (
                <Image
                  src={event.poster}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-black to-gold-600" />
              )}
              {event.isFeatured && (
                <Badge className="absolute top-4 left-4">Featured</Badge>
              )}
            </div>
            <CardContent className="p-8 flex flex-col justify-center">
              <div className="flex flex-wrap gap-2 mb-4">
                {event.genre && (
                  <Badge variant="outline">
                    <Music className="h-3 w-3 mr-1" />
                    {event.genre}
                  </Badge>
                )}
                {isAlmostSoldOut && (
                  <Badge variant="destructive">Almost Sold Out</Badge>
                )}
              </div>

              <h2 className="font-serif text-3xl font-bold text-white mb-4">
                {event.title}
              </h2>

              <div className="space-y-2 mb-6 text-white/70">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gold-500" />
                  {formatDate(event.date)}
                </div>
                {event.doors && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gold-500" />
                    Doors: {event.doors}
                  </div>
                )}
                {event.artists?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gold-500" />
                    {event.artists.join(", ")}
                  </div>
                )}
              </div>

              <p className="text-white/60 mb-6 line-clamp-3">
                {event.shortDesc || event.description}
              </p>

              <div className="flex items-center justify-between">
                {event.isTicketed && event.ticketPrice ? (
                  <div>
                    <span className="text-2xl font-bold text-gold-500">
                      ${Number(event.ticketPrice)}
                    </span>
                    {ticketsAvailable !== null && (
                      <span className="text-sm text-white/50 ml-2">
                        {ticketsAvailable} left
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-white/60">Free Entry</span>
                )}
                <Button>
                  {event.isTicketed ? "Get Tickets" : "Learn More"}
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/events/${event.slug}`}>
      <Card glass className="overflow-hidden card-hover">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-64 aspect-video sm:aspect-square relative img-zoom shrink-0">
            {event.poster ? (
              <Image
                src={event.poster}
                alt={event.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-black to-gold-600" />
            )}
          </div>
          <CardContent className="p-6 flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              {event.genre && (
                <Badge variant="outline" className="text-xs">
                  {event.genre}
                </Badge>
              )}
              {isAlmostSoldOut && (
                <Badge variant="destructive" className="text-xs">
                  Almost Sold Out
                </Badge>
              )}
            </div>

            <h3 className="text-xl font-semibold text-white mb-2">
              {event.title}
            </h3>

            <div className="flex flex-wrap gap-4 mb-4 text-sm text-white/60">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(event.date)}
              </span>
              {event.doors && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {event.doors}
                </span>
              )}
            </div>

            <p className="text-white/60 text-sm line-clamp-2 mb-4">
              {event.shortDesc || event.description}
            </p>

            <div className="flex items-center justify-between">
              {event.isTicketed && event.ticketPrice ? (
                <span className="text-lg font-bold text-gold-500">
                  ${Number(event.ticketPrice)}
                </span>
              ) : (
                <span className="text-white/50 text-sm">Free Entry</span>
              )}
              <Button size="sm">
                {event.isTicketed ? "Get Tickets" : "Details"}
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}
