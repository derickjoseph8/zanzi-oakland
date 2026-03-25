import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Calendar, MapPin, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { formatDate, formatCurrency } from "@/lib/utils";

interface ConfirmationPageProps {
  params: { id: string };
}

export default async function ReservationConfirmationPage({
  params,
}: ConfirmationPageProps) {
  const reservation = await db.reservation.findUnique({
    where: { id: params.id },
    include: {
      table: {
        include: { section: true },
      },
      event: true,
    },
  });

  if (!reservation) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <Card glass className="w-full max-w-lg">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>

          <h1 className="font-serif text-3xl font-bold text-white mb-2">
            Reservation Confirmed!
          </h1>
          <p className="text-white/60 mb-8">
            A confirmation email has been sent to {reservation.guestEmail}
          </p>

          <div className="text-left space-y-4 bg-white/5 rounded-lg p-6 mb-8">
            <div className="flex justify-between">
              <span className="text-white/60">Confirmation #</span>
              <span className="text-white font-mono">
                {reservation.id.slice(0, 8).toUpperCase()}
              </span>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gold-500" />
              <div>
                <p className="text-white">{formatDate(reservation.date)}</p>
                {reservation.event && (
                  <p className="text-sm text-white/60">{reservation.event.title}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gold-500" />
              <div>
                <p className="text-white">{reservation.table.name}</p>
                <p className="text-sm text-white/60">
                  {reservation.table.section.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gold-500" />
              <p className="text-white">{reservation.partySize} guests</p>
            </div>

            {reservation.depositAmount && (
              <>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Deposit</span>
                  <div className="text-right">
                    <p className="text-white font-semibold">
                      {formatCurrency(Number(reservation.depositAmount))}
                    </p>
                    <Badge
                      variant={reservation.depositPaid ? "success" : "warning"}
                    >
                      {reservation.depositPaid ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="bg-gold-500/10 border border-gold-500/20 rounded-lg p-4 mb-8">
            <h3 className="text-gold-500 font-semibold mb-2">Important</h3>
            <ul className="text-sm text-white/70 space-y-1 text-left">
              <li>Please arrive within 30 minutes of your reservation time</li>
              <li>All guests must be 21+ with valid ID</li>
              <li>Dress code: Upscale casual</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link href="/events">View Events</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
