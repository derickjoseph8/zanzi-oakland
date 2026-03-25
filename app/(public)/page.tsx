import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Sparkles, Users, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

async function getUpcomingEvents() {
  return db.event.findMany({
    where: {
      isPublished: true,
      date: { gte: new Date() },
    },
    orderBy: { date: "asc" },
    take: 3,
  });
}

async function getFeaturedBottles() {
  return db.bottle.findMany({
    where: { isFeatured: true, isAvailable: true },
    include: { category: true },
    take: 4,
  });
}

export default async function HomePage() {
  const [events, featuredBottles] = await Promise.all([
    getUpcomingEvents(),
    getFeaturedBottles(),
  ]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-navy-900 to-navy-900" />
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 hero-gradient" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 animate-fade-in">
              <Sparkles className="h-3 w-3 mr-1" />
              Oakland&apos;s Premier International Nightclub
            </Badge>

            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-slide-up">
              <span className="gradient-text">Experience</span>
              <br />
              <span className="text-white">The Night</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl mx-auto animate-fade-in">
              Where diverse cultures unite under one roof. World-class DJs, premium bottle service, and an atmosphere unlike any other.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button asChild size="xl" className="btn-shine">
                <Link href="/reservations">
                  Reserve a Table
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link href="/events">View Events</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { label: "Years Open", value: "5+" },
              { label: "Events Hosted", value: "500+" },
              { label: "Happy Guests", value: "100K+" },
              { label: "5-Star Reviews", value: "2K+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gold-500 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center pt-2">
            <div className="w-1 h-2 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-navy-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Why Zanzi?
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              We offer more than just a night out. Experience Oakland&apos;s most diverse and inclusive nightlife destination.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "International Vibes",
                description:
                  "Music from around the world. Afrobeats, Latin, Hip-Hop, R&B, and more. Everyone is welcome.",
              },
              {
                icon: Wine,
                title: "Premium Bottle Service",
                description:
                  "VIP tables with dedicated servers, top-shelf spirits, and the best views in the house.",
              },
              {
                icon: Calendar,
                title: "Unforgettable Events",
                description:
                  "Weekly themed nights, celebrity appearances, and special holiday celebrations.",
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                glass
                className="card-hover text-center p-8"
              >
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="h-8 w-8 text-gold-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/60">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-2">
                Upcoming Events
              </h2>
              <p className="text-white/60">Don&apos;t miss out on the hottest nights</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/events">
                View All Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {events.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.slug}`}>
                  <Card glass className="overflow-hidden card-hover h-full">
                    <div className="aspect-[4/3] relative img-zoom">
                      {event.poster ? (
                        <Image
                          src={event.poster}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-gold-600" />
                      )}
                      {event.isFeatured && (
                        <Badge className="absolute top-4 left-4">Featured</Badge>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 text-gold-500 text-sm mb-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(event.date)}
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {event.title}
                      </h3>
                      <p className="text-white/60 text-sm line-clamp-2">
                        {event.shortDesc || event.description}
                      </p>
                      {event.isTicketed && event.ticketPrice && (
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-gold-500 font-semibold">
                            ${Number(event.ticketPrice)}
                          </span>
                          <Button size="sm">Get Tickets</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card glass className="p-12 text-center">
              <p className="text-white/60">No upcoming events scheduled. Check back soon!</p>
            </Card>
          )}
        </div>
      </section>

      {/* VIP Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-gold-900/40" />
        <div className="absolute inset-0 bg-[url('/images/vip-bg.jpg')] bg-cover bg-center opacity-10" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6">VIP Experience</Badge>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
                Elevate Your Night with Bottle Service
              </h2>
              <p className="text-white/70 text-lg mb-8">
                Reserve a private table, enjoy premium spirits, and receive VIP treatment all night long. Our dedicated hosts ensure your experience is nothing short of exceptional.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Priority entry - skip the line",
                  "Dedicated VIP host",
                  "Premium bottle selection",
                  "Best views and seating",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-gold-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-4">
                <Button asChild size="lg">
                  <Link href="/bottle-service">View Packages</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/reservations">Reserve Now</Link>
                </Button>
              </div>
            </div>

            {/* Featured Bottles */}
            {featuredBottles.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {featuredBottles.map((bottle) => (
                  <Card key={bottle.id} glass className="p-4 text-center">
                    <div className="aspect-square relative mb-4">
                      {bottle.image ? (
                        <Image
                          src={bottle.image}
                          alt={bottle.name}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gold-600/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                          <Wine className="h-12 w-12 text-gold-500/50" />
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-white">{bottle.name}</h4>
                    <p className="text-sm text-white/50">{bottle.category.name}</p>
                    <p className="text-gold-500 font-bold mt-2">
                      ${Number(bottle.price)}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-navy-800/50">
        <div className="container mx-auto px-4">
          <Card glass className="max-w-2xl mx-auto p-8 md:p-12 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
              Stay in the Loop
            </h2>
            <p className="text-white/60 mb-8">
              Get exclusive access to event announcements, VIP offers, and special promotions.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 px-4 rounded-md border border-white/20 bg-white/5 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
              <Button type="submit" size="lg">
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-white/40 mt-4">
              By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Experience Zanzi?
          </h2>
          <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
            Book your table now and secure your spot for an unforgettable night.
          </p>
          <Button asChild size="xl" className="btn-shine animate-pulse-glow">
            <Link href="/reservations">
              Reserve Your Table
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
