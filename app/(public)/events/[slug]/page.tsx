import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MapPin, Music, Users, Ticket, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { formatDate, formatTime, getEventStatus } from "@/lib/utils";

interface EventPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: EventPageProps) {
  const event = await db.event.findUnique({
    where: { slug: params.slug },
  });

  if (!event) {
    return { title: "Event Not Found" };
  }

  return {
    title: event.title,
    description: event.shortDesc || event.description.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.shortDesc || event.description.slice(0, 160),
      images: event.poster ? [event.poster] : undefined,
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await db.event.findUnique({
    where: { slug: params.slug, isPublished: true },
  });

  if (!event) {
    notFound();
  }

  const status = getEventStatus(event.date, event.endDate);
  const ticketsAvailable = event.ticketLimit
    ? event.ticketLimit - event.ticketsSold
    : null;
  const isSoldOut = ticketsAvailable !== null && ticketsAvailable <= 0;

  return (
    <div className="pt-24 pb-16">
      {/* Back Button */}
      <div className="container mx-auto px-4 mb-8">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>
      </div>

      {/* Event Header */}
      <section className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Poster */}
          <div className="relative aspect-[3/4] lg:aspect-auto lg:min-h-[600px] rounded-xl overflow-hidden">
            {event.poster ? (
              <Image
                src={event.poster}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-gold-600" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent" />

            {/* Status Badge */}
            <div className="absolute top-4 left-4 flex gap-2">
              {status === "ongoing" && (
                <Badge className="bg-green-500">Happening Now</Badge>
              )}
              {status === "past" && (
                <Badge variant="secondary">Past Event</Badge>
              )}
              {event.isFeatured && status === "upcoming" && (
                <Badge>Featured</Badge>
              )}
              {isSoldOut && <Badge variant="destructive">Sold Out</Badge>}
            </div>
          </div>

          {/* Event Details */}
          <div className="flex flex-col justify-center">
            {event.genre && (
              <Badge variant="outline" className="w-fit mb-4">
                <Music className="h-3 w-3 mr-1" />
                {event.genre}
              </Badge>
            )}

            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
              {event.title}
            </h1>

            {/* Event Info */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-white/80">
                <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-gold-500" />
                </div>
                <div>
                  <p className="font-medium">{formatDate(event.date)}</p>
                  {event.endDate && (
                    <p className="text-sm text-white/50">
                      Until {formatDate(event.endDate)}
                    </p>
                  )}
                </div>
              </div>

              {event.doors && (
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-gold-500" />
                  </div>
                  <div>
                    <p className="font-medium">Doors Open: {event.doors}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-white/80">
                <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-gold-500" />
                </div>
                <div>
                  <p className="font-medium">Zanzi Oakland</p>
                  <p className="text-sm text-white/50">123 Broadway, Oakland, CA 94607</p>
                </div>
              </div>

              {event.artists && event.artists.length > 0 && (
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-gold-500" />
                  </div>
                  <div>
                    <p className="font-medium">Featuring</p>
                    <p className="text-sm text-white/50">
                      {event.artists.join(" • ")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Ticket Info & CTA */}
            {status === "upcoming" && (
              <Card glass className="p-6">
                {event.isTicketed ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/60">Ticket Price</p>
                        <p className="text-3xl font-bold text-gold-500">
                          ${Number(event.ticketPrice)}
                        </p>
                      </div>
                      {ticketsAvailable !== null && (
                        <div className="text-right">
                          <p className="text-sm text-white/60">Available</p>
                          <p className="text-lg font-semibold text-white">
                            {ticketsAvailable} tickets
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      asChild
                      size="lg"
                      className="w-full"
                      disabled={isSoldOut}
                    >
                      <Link href={`/checkout/tickets/${event.id}`}>
                        <Ticket className="mr-2 h-5 w-5" />
                        {isSoldOut ? "Sold Out" : "Get Tickets"}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-white/60">
                      This is a free entry event. Reserve a table for the VIP experience.
                    </p>
                    <Button asChild size="lg" className="w-full">
                      <Link href={`/reservations?event=${event.id}`}>
                        Reserve a Table
                      </Link>
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Event Details */}
            <div className="mt-8 space-y-4">
              {event.dressCode && (
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60">Dress Code</span>
                  <span className="text-white">{event.dressCode}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Age Requirement</span>
                <span className="text-white">{event.ageLimit}+</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="container mx-auto px-4 mt-16">
        <h2 className="font-serif text-2xl font-bold text-white mb-6">
          About This Event
        </h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-white/70 whitespace-pre-line leading-relaxed">
            {event.description}
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 mt-16">
        <Card glass className="p-8 md:p-12 text-center">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">
            Make It a VIP Night
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            Skip the line and enjoy premium bottle service. Reserve a table and get the full Zanzi experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href={`/reservations?event=${event.id}`}>
                Reserve a Table
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/bottle-service">View Bottle Menu</Link>
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
