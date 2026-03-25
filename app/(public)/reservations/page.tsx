import { Suspense } from "react";
import { Calendar, Clock, Users, Wine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReservationFlow } from "@/components/booking/reservation-flow";
import { db } from "@/lib/db";

export const metadata = {
  title: "Reservations",
  description: "Reserve your table at Zanzi Oakland. Choose from VIP booths, main floor tables, and lounge seating.",
};

async function getSections() {
  return db.section.findMany({
    where: { isActive: true },
    include: {
      tables: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });
}

async function getUpcomingEvents() {
  return db.event.findMany({
    where: {
      isPublished: true,
      date: { gte: new Date() },
    },
    orderBy: { date: "asc" },
    take: 10,
  });
}

export default async function ReservationsPage() {
  const [sections, events] = await Promise.all([
    getSections(),
    getUpcomingEvents(),
  ]);

  return (
    <div className="pt-24 pb-16">
      {/* Hero */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <Badge variant="outline" className="mb-4">
            <Wine className="h-3 w-3 mr-1" />
            Table Reservations
          </Badge>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-4">
            Reserve Your Table
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Secure the best seats in the house. From intimate lounge seating to premium VIP booths with bottle service.
          </p>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Calendar,
                title: "Select Your Date",
                description: "Choose when you want to visit and see available events",
              },
              {
                icon: Users,
                title: "Pick Your Table",
                description: "Browse our interactive floor plan and select your preferred spot",
              },
              {
                icon: Wine,
                title: "Add Bottles",
                description: "Pre-order your bottles and have everything ready when you arrive",
              },
            ].map((step, index) => (
              <Card key={index} glass className="text-center p-6">
                <CardContent className="pt-4">
                  <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-6 w-6 text-gold-500" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/60">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reservation Flow */}
          <Suspense fallback={<ReservationFlowSkeleton />}>
            <ReservationFlow sections={sections} events={events} />
          </Suspense>
        </div>
      </section>

      {/* Policies */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card glass className="max-w-3xl mx-auto p-8">
            <h2 className="font-serif text-2xl font-bold text-white mb-6">
              Reservation Policies
            </h2>
            <div className="space-y-4 text-white/70 text-sm">
              <p>
                <strong className="text-white">Deposits:</strong> VIP tables require a deposit that goes toward your bottle minimum. Deposits are non-refundable if cancelled within 24 hours of reservation.
              </p>
              <p>
                <strong className="text-white">Arrival:</strong> Please arrive within 30 minutes of your reservation time. Tables will be released after 30 minutes without notice.
              </p>
              <p>
                <strong className="text-white">Dress Code:</strong> Upscale casual attire required. No athletic wear, excessive jewelry, or baggy clothing. Management reserves the right to deny entry.
              </p>
              <p>
                <strong className="text-white">Age Requirement:</strong> All guests must be 21+ with valid ID.
              </p>
              <p>
                <strong className="text-white">Cancellations:</strong> Please cancel at least 24 hours in advance for a full deposit refund. Contact us directly for any changes.
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

function ReservationFlowSkeleton() {
  return (
    <Card glass className="p-6">
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    </Card>
  );
}
