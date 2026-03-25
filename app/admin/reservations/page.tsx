"use client";

import { useState, useEffect } from "react";
import { format, startOfDay, addDays } from "date-fns";
import {
  Calendar,
  Search,
  Filter,
  Check,
  X,
  Clock,
  Users,
  Phone,
  Mail,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { formatCurrency, formatDate, getReservationStatusColor, cn } from "@/lib/utils";

interface Reservation {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  partySize: number;
  date: string;
  status: string;
  specialRequests: string | null;
  occasion: string | null;
  depositAmount: string | null;
  depositPaid: boolean;
  notes: string | null;
  table: {
    name: string;
    section: { name: string };
  };
  event: { title: string } | null;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, [selectedDate, statusFilter]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDate) {
        params.set("date", selectedDate.toISOString());
      }
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const response = await fetch(`/api/reservations?${params.toString()}`);
      const data = await response.json();
      setReservations(data.reservations || []);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update");

      toast({
        title: "Status Updated",
        description: `Reservation marked as ${status.toLowerCase()}`,
        variant: "success",
      });

      fetchReservations();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reservation status",
        variant: "destructive",
      });
    }
  };

  const filteredReservations = reservations.filter((r) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.guestName.toLowerCase().includes(query) ||
      r.guestEmail.toLowerCase().includes(query) ||
      r.guestPhone.includes(query)
    );
  });

  const stats = {
    total: reservations.length,
    pending: reservations.filter((r) => r.status === "PENDING").length,
    confirmed: reservations.filter((r) => r.status === "CONFIRMED").length,
    completed: reservations.filter((r) => r.status === "COMPLETED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Reservations</h1>
          <p className="text-white/60 mt-1">Manage table reservations</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card glass className="p-4">
          <p className="text-sm text-white/60">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </Card>
        <Card glass className="p-4">
          <p className="text-sm text-yellow-500">Pending</p>
          <p className="text-2xl font-bold text-white">{stats.pending}</p>
        </Card>
        <Card glass className="p-4">
          <p className="text-sm text-green-500">Confirmed</p>
          <p className="text-2xl font-bold text-white">{stats.confirmed}</p>
        </Card>
        <Card glass className="p-4">
          <p className="text-sm text-blue-500">Completed</p>
          <p className="text-2xl font-bold text-white">{stats.completed}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="NO_SHOW">No Show</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Reservations List */}
      <Card glass>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-white/60">Loading...</div>
          ) : filteredReservations.length > 0 ? (
            <div className="divide-y divide-white/10">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center shrink-0">
                        <Users className="h-6 w-6 text-gold-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">
                            {reservation.guestName}
                          </h3>
                          <Badge
                            variant="outline"
                            className={getReservationStatusColor(reservation.status)}
                          >
                            {reservation.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-white/60">
                          {reservation.table.name} ({reservation.table.section.name}) •{" "}
                          {reservation.partySize} guests
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-white/50">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(reservation.date)}
                          </span>
                          {reservation.event && (
                            <span>{reservation.event.title}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {reservation.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateStatus(reservation.id, "CONFIRMED")}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(reservation.id, "CANCELLED")}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {reservation.status === "CONFIRMED" && (
                        <Button
                          size="sm"
                          onClick={() => updateStatus(reservation.id, "COMPLETED")}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Mark Arrived
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setDetailsOpen(true);
                            }}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => updateStatus(reservation.id, "NO_SHOW")}
                            className="text-red-400"
                          >
                            Mark No Show
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-white/60">
              No reservations found for the selected criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reservation Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          {selectedReservation && (
            <>
              <DialogHeader>
                <DialogTitle>Reservation Details</DialogTitle>
                <DialogDescription>
                  {selectedReservation.table.name} • {formatDate(selectedReservation.date)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white/60">Guest Name</p>
                    <p className="text-white">{selectedReservation.guestName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Party Size</p>
                    <p className="text-white">{selectedReservation.partySize} guests</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Email</p>
                    <a
                      href={`mailto:${selectedReservation.guestEmail}`}
                      className="text-gold-500 hover:underline"
                    >
                      {selectedReservation.guestEmail}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Phone</p>
                    <a
                      href={`tel:${selectedReservation.guestPhone}`}
                      className="text-gold-500 hover:underline"
                    >
                      {selectedReservation.guestPhone}
                    </a>
                  </div>
                </div>

                {selectedReservation.occasion && (
                  <div>
                    <p className="text-sm text-white/60">Occasion</p>
                    <p className="text-white capitalize">{selectedReservation.occasion}</p>
                  </div>
                )}

                {selectedReservation.specialRequests && (
                  <div>
                    <p className="text-sm text-white/60">Special Requests</p>
                    <p className="text-white">{selectedReservation.specialRequests}</p>
                  </div>
                )}

                {selectedReservation.depositAmount && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <div>
                      <p className="text-sm text-white/60">Deposit</p>
                      <p className="text-white font-semibold">
                        {formatCurrency(Number(selectedReservation.depositAmount))}
                      </p>
                    </div>
                    <Badge
                      variant={selectedReservation.depositPaid ? "success" : "warning"}
                    >
                      {selectedReservation.depositPaid ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
