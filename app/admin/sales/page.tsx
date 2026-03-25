import { redirect } from "next/navigation";
import {
  DollarSign,
  Ticket,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Role } from "@prisma/client";

async function getSalesStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  const [
    thisMonthTickets,
    lastMonthTickets,
    thisMonthReservations,
    lastMonthReservations,
    recentTickets,
    recentReservations,
    topEvents,
  ] = await Promise.all([
    // This month's ticket revenue
    db.ticket.aggregate({
      where: {
        createdAt: { gte: thisMonth },
        status: { in: ["VALID", "USED"] },
      },
      _sum: { totalPrice: true },
      _count: true,
    }),
    // Last month's ticket revenue
    db.ticket.aggregate({
      where: {
        createdAt: { gte: lastMonth, lt: thisMonth },
        status: { in: ["VALID", "USED"] },
      },
      _sum: { totalPrice: true },
      _count: true,
    }),
    // This month's reservation deposits
    db.reservation.aggregate({
      where: {
        createdAt: { gte: thisMonth },
        depositPaid: true,
      },
      _sum: { depositAmount: true },
      _count: true,
    }),
    // Last month's reservation deposits
    db.reservation.aggregate({
      where: {
        createdAt: { gte: lastMonth, lt: thisMonth },
        depositPaid: true,
      },
      _sum: { depositAmount: true },
      _count: true,
    }),
    // Recent ticket purchases
    db.ticket.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { event: true },
    }),
    // Recent reservations with deposits
    db.reservation.findMany({
      where: { depositPaid: true },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { table: { include: { section: true } } },
    }),
    // Top performing events
    db.event.findMany({
      where: { isTicketed: true },
      orderBy: { ticketsSold: "desc" },
      take: 5,
    }),
  ]);

  const thisMonthTicketRevenue = Number(thisMonthTickets._sum?.totalPrice || 0);
  const lastMonthTicketRevenue = Number(lastMonthTickets._sum?.totalPrice || 0);
  const thisMonthDepositRevenue = Number(thisMonthReservations._sum?.depositAmount || 0);
  const lastMonthDepositRevenue = Number(lastMonthReservations._sum?.depositAmount || 0);

  const totalThisMonth = thisMonthTicketRevenue + thisMonthDepositRevenue;
  const totalLastMonth = lastMonthTicketRevenue + lastMonthDepositRevenue;

  const revenueChange = totalLastMonth > 0
    ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100
    : 0;

  return {
    thisMonth: {
      ticketRevenue: thisMonthTicketRevenue,
      ticketCount: thisMonthTickets._count,
      depositRevenue: thisMonthDepositRevenue,
      reservationCount: thisMonthReservations._count,
      totalRevenue: totalThisMonth,
    },
    lastMonth: {
      ticketRevenue: lastMonthTicketRevenue,
      depositRevenue: lastMonthDepositRevenue,
      totalRevenue: totalLastMonth,
    },
    revenueChange,
    recentTickets,
    recentReservations,
    topEvents,
  };
}

export default async function SalesPage() {
  const session = await auth();
  const userRole = (session?.user?.role as Role) || Role.STAFF;

  // Check permission
  if (!hasPermission(userRole, "sales.view")) {
    redirect("/admin/dashboard");
  }

  const stats = await getSalesStats();
  const isPositiveChange = stats.revenueChange >= 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Sales & Analytics</h1>
          <p className="text-white/60 mt-1">Track revenue from tickets and reservations</p>
        </div>
        <Badge variant="outline" className="gap-2">
          <BarChart3 className="h-3 w-3" />
          Admin & Manager
        </Badge>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card glass>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Monthly Revenue</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {formatCurrency(stats.thisMonth.totalRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className={`flex items-center gap-1 text-sm mt-3 ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
              {isPositiveChange ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {Math.abs(stats.revenueChange).toFixed(1)}% vs last month
            </div>
          </CardContent>
        </Card>

        <Card glass>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Ticket Sales</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {formatCurrency(stats.thisMonth.ticketRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Ticket className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <p className="text-sm text-white/50 mt-3">
              {stats.thisMonth.ticketCount} tickets sold
            </p>
          </CardContent>
        </Card>

        <Card glass>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Reservation Deposits</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {formatCurrency(stats.thisMonth.depositRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-gold-500" />
              </div>
            </div>
            <p className="text-sm text-white/50 mt-3">
              {stats.thisMonth.reservationCount} reservations
            </p>
          </CardContent>
        </Card>

        <Card glass>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Last Month</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {formatCurrency(stats.lastMonth.totalRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <p className="text-sm text-white/50 mt-3">
              Previous period comparison
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Ticket Sales */}
        <Card glass>
          <CardHeader>
            <CardTitle>Recent Ticket Sales</CardTitle>
            <CardDescription>Latest ticket purchases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentTickets.length > 0 ? (
              stats.recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                >
                  <div>
                    <p className="font-medium text-white">{ticket.buyerName}</p>
                    <p className="text-sm text-white/50">
                      {ticket.event.title} • {ticket.quantity} ticket{ticket.quantity > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gold-500 font-medium">
                      {formatCurrency(Number(ticket.totalPrice))}
                    </p>
                    <p className="text-xs text-white/40">
                      {formatDate(ticket.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white/50 text-center py-8">No ticket sales yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Reservation Deposits */}
        <Card glass>
          <CardHeader>
            <CardTitle>Recent Reservation Deposits</CardTitle>
            <CardDescription>Latest table deposits collected</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentReservations.length > 0 ? (
              stats.recentReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                >
                  <div>
                    <p className="font-medium text-white">{reservation.guestName}</p>
                    <p className="text-sm text-white/50">
                      {reservation.table.name} • {reservation.table.section.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gold-500 font-medium">
                      {formatCurrency(Number(reservation.depositAmount || 0))}
                    </p>
                    <p className="text-xs text-white/40">
                      {formatDate(reservation.date)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white/50 text-center py-8">No deposits collected yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Events */}
      <Card glass>
        <CardHeader>
          <CardTitle>Top Performing Events</CardTitle>
          <CardDescription>Events with the most ticket sales</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.topEvents.length > 0 ? (
            <div className="space-y-4">
              {stats.topEvents.map((event, index) => {
                const revenue = Number(event.ticketPrice || 0) * event.ticketsSold;
                const percentage = event.ticketLimit
                  ? (event.ticketsSold / event.ticketLimit) * 100
                  : 0;

                return (
                  <div key={event.id} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white">{event.title}</p>
                        <p className="text-gold-500 font-medium">
                          {formatCurrency(revenue)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-white/50">
                          {event.ticketsSold} / {event.ticketLimit || '∞'} tickets sold
                        </p>
                        <p className="text-sm text-white/50">
                          {formatDate(event.date)}
                        </p>
                      </div>
                      {event.ticketLimit && (
                        <div className="mt-2 w-full bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gold-500 h-2 rounded-full"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-white/50 text-center py-8">No ticketed events yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
