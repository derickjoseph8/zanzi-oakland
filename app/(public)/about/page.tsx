import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Users, Music, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "About Us",
  description: "Learn about Zanzi Oakland - Oakland's premier international nightclub bringing together diverse cultures under one roof.",
};

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16">
      {/* Hero */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">
              <Star className="h-3 w-3 mr-1" />
              Our Story
            </Badge>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-6">
              About Zanzi Oakland
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed">
              Where the world comes to dance. Zanzi Oakland is more than a nightclub -
              it&apos;s a celebration of diversity, unity, and the universal language of music.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-gold-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative w-40 h-40 mx-auto">
                    <Image
                      src="/logo.gif"
                      alt="Zanzi Oakland"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
                Our Mission
              </h2>
              <p className="text-white/70 leading-relaxed">
                Zanzi Oakland was born from a simple idea: create a space where everyone
                belongs. In a city as diverse as Oakland, we believe nightlife should
                reflect that diversity. From Afrobeats to Latin rhythms, from Hip-Hop
                to House music, our sound is as eclectic as our guests.
              </p>
              <p className="text-white/70 leading-relaxed">
                Since opening our doors, we&apos;ve become the go-to destination for those
                seeking an authentic, inclusive nightlife experience. Our team works
                tirelessly to curate events that bring people together, featuring local
                and international talent that spans genres and borders.
              </p>
              <p className="text-white/70 leading-relaxed">
                Whether you&apos;re celebrating a special occasion with VIP bottle service
                or simply looking to dance the night away, Zanzi Oakland welcomes you
                to experience something different.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-black/50">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white text-center mb-12">
            What We Stand For
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Inclusivity",
                description:
                  "Every person who walks through our doors is valued and respected. We celebrate all backgrounds, identities, and cultures.",
              },
              {
                icon: Music,
                title: "Musical Excellence",
                description:
                  "We curate world-class talent and diverse sounds. Our DJs and performers represent the best of global music.",
              },
              {
                icon: Star,
                title: "Premium Experience",
                description:
                  "From our VIP service to our attention to detail, we strive to deliver an exceptional experience every night.",
              },
            ].map((value) => (
              <Card key={value.title} glass className="text-center p-8">
                <CardContent className="pt-4">
                  <div className="w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto mb-6">
                    <value.icon className="h-8 w-8 text-gold-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {value.title}
                  </h3>
                  <p className="text-white/60">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Location */}
            <Card glass className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6 text-gold-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Location
                  </h3>
                  <p className="text-white/70">
                    19 Grand Avenue<br />
                    Oakland, CA 94612
                  </p>
                </div>
              </div>
              <div className="aspect-video rounded-lg overflow-hidden bg-navy-900">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0977456894867!2d-122.27085!3d37.80483!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ4JzE3LjQiTiAxMjLCsDE2JzE1LjEiVw!5e0!3m2!1sen!2sus!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale opacity-70"
                />
              </div>
            </Card>

            {/* Hours */}
            <Card glass className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center shrink-0">
                  <Clock className="h-6 w-6 text-gold-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Hours of Operation
                  </h3>
                  <p className="text-white/60">
                    Open for events Friday & Saturday
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { day: "Monday", hours: "Closed" },
                  { day: "Tuesday", hours: "Closed" },
                  { day: "Wednesday", hours: "Closed" },
                  { day: "Thursday", hours: "Closed" },
                  { day: "Friday", hours: "9:00 PM - 2:00 AM", open: true },
                  { day: "Saturday", hours: "10:00 PM - 3:00 AM", open: true },
                  { day: "Sunday", hours: "Closed" },
                ].map((schedule) => (
                  <div
                    key={schedule.day}
                    className="flex justify-between items-center py-2 border-b border-white/10"
                  >
                    <span
                      className={
                        schedule.open ? "text-white" : "text-white/50"
                      }
                    >
                      {schedule.day}
                    </span>
                    <span
                      className={
                        schedule.open ? "text-gold-500" : "text-white/50"
                      }
                    >
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/50 mt-4">
                Hours may vary for special events. Check our events page for details.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-black/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "5+", label: "Years of Excellence" },
              { value: "500+", label: "Events Hosted" },
              { value: "100K+", label: "Happy Guests" },
              { value: "50+", label: "International Artists" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl md:text-5xl font-bold text-gold-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
            Come Experience Zanzi
          </h2>
          <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
            Book a table, buy tickets to an event, or just show up and let the music move you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/reservations">
                Reserve a Table
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/events">View Events</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
