import Link from "next/link";
import {
  Calendar,
  DollarSign,
  Ticket,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { formatCurrency, formatDate, formatTime, getReservationStatusColor } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Role } from "@prisma/client";

async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    todayReservations,
    pendingReservations,
    upcomingEvents,
    monthlyTicketsSold,
    recentReservations,
    subscribers,
  ] = await Promise.all([
    // Today's reservations
    db.reservation.count({
      where: {
        date: { gte: today, lt: tomorrow },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),
    // Pending reservations
    db.reservation.count({
      where: { status: "PENDING" },
    }),
    // Upcoming events
    db.event.count({
      where: {
        date: { gte: today },
        isPublished: true,
      },
    }),
    // Monthly tickets sold
    db.ticket.aggregate({
      where: {
        createdAt: { gte: thisMonth },
        status: "VALID",
      },
      _sum: { quantity: true, totalPrice: true },
    }),
    // Recent reservations
    db.reservation.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        table: { include: { section: true } },
        event: true,
      },
    }),
    // Total subscribers
    db.subscriber.count({
      where: { isActive: true },
    }),
  ]);

  return {
    todayReservations,
    pendingReservations,
    upcomingEvents,
    monthlyRevenue: monthlyTicketsSold._sum?.totalPrice || 0,
    recentReservations,
    subscribers,
  };
}

async function getUpcomingReservations() {
  const now = new Date();
  return db.reservation.findMany({
    where: {
      date: { gte: now },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    orderBy: { date: "asc" },
    take: 10,
    include: {
      table: { include: { section: true } },
      event: true,
    },
  });
}

async function getUpcomingEvents() {
  const now = new Date();
  return db.event.findMany({
    where: {
      date: { gte: now },
      isPublished: true,
    },
    orderBy: { date: "asc" },
    take: 5,
  });
}

export default async function AdminDashboard() {
  const session = await auth();
  const userRole = (session?.user?.role as Role) || Role.STAFF;
  const canViewSales = hasPermission(userRole, "sales.view");
  const canViewSubscribers = hasPermission(userRole, "subscribers.view");

  const [stats, upcomingReservations, upcomingEvents] = await Promise.all([
    getDashboardStats(),
    getUpcomingReservations(),
    getUpcomingEvents(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">Dashboard</h1>
        <p className="text-white/60 mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${canViewSales ? 'lg:grid-cols-4' : 'lg:grid-cols-2'} gap-6`}>
        <Card glass>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Today&apos;s Reservations</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {stats.todayReservations}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-gold-500" />
              </div>
            </div>
            {stats.pendingReservations > 0 && (
              <p className="text-sm text-yellow-500 mt-3">
                {stats.pendingReservations} pending approval
              </p>
            )}
          </CardContent>
        </Card>

        <Card glass>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Upcoming Events</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {stats.upcomingEvents}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center">
                <Ticket className="h-6 w-6 text-gold-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue - Only visible to Admin and Manager */}
        {canViewSales && (
          <Card glass>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {formatCurrency(Number(stats.monthlyRevenue))}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-green-500 mt-3">
                <TrendingUp className="h-4 w-4" />
                From ticket sales
              </div>
            </CardContent>
          </Card>
        )}

        {/* Email Subscribers - Only visible to Admin and Manager */}
        {canViewSubscribers && (
          <Card glass>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Email Subscribers</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {stats.subscribers}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Reservations */}
        <Card glass>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Reservations</CardTitle>
              <CardDescription>Next {upcomingReservations.length} reservations</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/reservations">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingReservations.length > 0 ? (
              upcomingReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-gold-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{reservation.guestName}</p>
                      <p className="text-sm text-white/50">
                        {reservation.table.name} • {reservation.partySize} guests
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{formatDate(reservation.date)}</p>
                    <Badge
                      variant="outline"
                      className={getReservationStatusColor(reservation.status)}
                    >
                      {reservation.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white/50 text-center py-8">No upcoming reservations</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card glass>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Published events on the horizon</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/events">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
                      <Ticket className="h-5 w-5 text-gold-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{event.title}</p>
                      <p className="text-sm text-white/50">{formatDate(event.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {event.isTicketed ? (
                      <div>
                        <p className="text-sm text-gold-500">
                          {formatCurrency(Number(event.ticketPrice))}
                        </p>
                        {/* Only show sales numbers to Admin/Manager */}
                        {canViewSales && (
                          <p className="text-xs text-white/50">
                            {event.ticketsSold}/{event.ticketLimit || '∞'} sold
                          </p>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline">Free Entry</Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white/50 text-center py-8">No upcoming events</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card glass>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {hasPermission(userRole, "events.create") && (
            <Button asChild>
              <Link href="/admin/events/new">Create Event</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/admin/reservations">Manage Reservations</Link>
          </Button>
          {hasPermission(userRole, "gallery.upload") && (
            <Button asChild variant="outline">
              <Link href="/admin/gallery">Upload Photos</Link>
            </Button>
          )}
          {hasPermission(userRole, "bottles.edit") && (
            <Button asChild variant="outline">
              <Link href="/admin/bottles">Update Bottle Menu</Link>
            </Button>
          )}
          {canViewSales && (
            <Button asChild variant="outline">
              <Link href="/admin/sales">View Sales</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
