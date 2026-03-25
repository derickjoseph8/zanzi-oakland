import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Calendar, MapPin, Ticket, Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { formatDate, formatCurrency } from "@/lib/utils";

interface ConfirmationPageProps {
  params: { id: string };
}

export default async function TicketConfirmationPage({
  params,
}: ConfirmationPageProps) {
  const ticket = await db.ticket.findUnique({
    where: { id: params.id },
    include: {
      event: true,
    },
  });

  if (!ticket) {
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
            Tickets Purchased!
          </h1>
          <p className="text-white/60 mb-8">
            Your tickets have been sent to {ticket.buyerEmail}
          </p>

          {/* QR Code */}
          {ticket.qrCode && (
            <div className="bg-white rounded-lg p-4 inline-block mb-8">
              <Image
                src={ticket.qrCode}
                alt="Ticket QR Code"
                width={200}
                height={200}
              />
            </div>
          )}

          <div className="text-left space-y-4 bg-white/5 rounded-lg p-6 mb-8">
            <div className="flex justify-between">
              <span className="text-white/60">Order #</span>
              <span className="text-white font-mono">
                {ticket.id.slice(0, 8).toUpperCase()}
              </span>
            </div>

            <Separator />

            <div>
              <h3 className="font-serif text-xl font-bold text-white mb-2">
                {ticket.event.title}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gold-500" />
              <p className="text-white">{formatDate(ticket.event.date)}</p>
            </div>

            {ticket.event.doors && (
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gold-500" />
                <p className="text-white">Doors: {ticket.event.doors}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gold-500" />
              <p className="text-white">Zanzi Oakland, 19 Grand Avenue</p>
            </div>

            <div className="flex items-center gap-3">
              <Ticket className="h-5 w-5 text-gold-500" />
              <p className="text-white">
                {ticket.quantity}x {ticket.ticketType}
              </p>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-white/60">Total Paid</span>
              <span className="text-gold-500 font-bold text-xl">
                {formatCurrency(Number(ticket.totalPrice))}
              </span>
            </div>
          </div>

          <div className="bg-gold-500/10 border border-gold-500/20 rounded-lg p-4 mb-8">
            <h3 className="text-gold-500 font-semibold mb-2">Entry Information</h3>
            <ul className="text-sm text-white/70 space-y-1 text-left">
              <li>Show this QR code at the door for entry</li>
              <li>All guests must be 21+ with valid ID</li>
              <li>Dress code: {ticket.event.dressCode || "Upscale casual"}</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link href="/events">View More Events</Link>
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
