"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
  Wine,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FloorPlan } from "@/components/floor-plan/floor-plan";
import { reservationSchema, type ReservationFormData } from "@/lib/validations";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { Table, Section, Event } from "@prisma/client";

interface ReservationFlowProps {
  sections: (Section & { tables: Table[] })[];
  events: Event[];
}

type Step = "date" | "table" | "details" | "review";

const steps: { id: Step; title: string }[] = [
  { id: "date", title: "Select Date" },
  { id: "table", title: "Choose Table" },
  { id: "details", title: "Guest Details" },
  { id: "review", title: "Review" },
];

export function ReservationFlow({ sections, events }: ReservationFlowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedEventId = searchParams.get("event");

  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [reservedTableIds, setReservedTableIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      partySize: 2,
    },
  });

  const watchedPartySize = watch("partySize");

  // Handle preselected event
  useEffect(() => {
    if (preselectedEventId) {
      const event = events.find((e) => e.id === preselectedEventId);
      if (event) {
        setSelectedEvent(event);
        setSelectedDate(new Date(event.date));
      }
    }
  }, [preselectedEventId, events]);

  // Fetch reserved tables when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchReservedTables(selectedDate);
    }
  }, [selectedDate]);

  const fetchReservedTables = async (date: Date) => {
    try {
      const response = await fetch(
        `/api/reservations/availability?date=${date.toISOString()}`
      );
      const data = await response.json();
      setReservedTableIds(data.reservedTableIds || []);
    } catch (error) {
      console.error("Failed to fetch availability:", error);
    }
  };

  // Get events for selected date
  const eventsForDate = selectedDate
    ? events.filter((e) => {
        const eventDate = startOfDay(new Date(e.date));
        const selected = startOfDay(selectedDate);
        return eventDate.getTime() === selected.getTime();
      })
    : [];

  const goToStep = (newStep: Step) => {
    const stepIndex = steps.findIndex((s) => s.id === newStep);
    const currentIndex = steps.findIndex((s) => s.id === step);
    if (stepIndex <= currentIndex || canProceed()) {
      setStep(newStep);
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case "date":
        return !!selectedDate;
      case "table":
        return !!selectedTable;
      case "details":
        return true; // Form validation handles this
      default:
        return true;
    }
  };

  const nextStep = () => {
    const currentIndex = steps.findIndex((s) => s.id === step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.findIndex((s) => s.id === step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1].id);
    }
  };

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
    setValue("tableId", table.id);
  };

  const onSubmit = async (data: ReservationFormData) => {
    if (!selectedDate || !selectedTable) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          date: selectedDate.toISOString(),
          eventId: selectedEvent?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create reservation");
      }

      const reservation = await response.json();

      // Redirect to checkout if deposit required
      if (selectedTable.depositRequired) {
        router.push(`/checkout/reservation/${reservation.id}`);
      } else {
        router.push(`/confirmation/reservation/${reservation.id}`);
      }
    } catch (error) {
      console.error("Failed to submit reservation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSection = selectedTable
    ? sections.find((s) => s.tables.some((t) => t.id === selectedTable.id))
    : null;

  return (
    <Card glass className="overflow-hidden">
      {/* Progress Steps */}
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {steps.map((s, index) => {
            const isActive = s.id === step;
            const isCompleted = steps.findIndex((st) => st.id === step) > index;

            return (
              <button
                key={s.id}
                onClick={() => goToStep(s.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                  isActive && "bg-gold-500/20",
                  !isActive && !isCompleted && "opacity-50"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    isActive && "bg-gold-500 text-navy-900",
                    isCompleted && "bg-green-500 text-white",
                    !isActive && !isCompleted && "bg-white/10 text-white/50"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "hidden sm:inline text-sm",
                    isActive ? "text-gold-500" : "text-white/60"
                  )}
                >
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Date Selection */}
          {step === "date" && (
            <motion.div
              key="date"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-serif font-bold text-white mb-2">
                  When would you like to visit?
                </h2>
                <p className="text-white/60">
                  Select a date to see available tables and events
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-8 justify-center">
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      // Check if there's an event on this date
                      const event = events.find(
                        (e) =>
                          startOfDay(new Date(e.date)).getTime() ===
                          startOfDay(date || new Date()).getTime()
                      );
                      setSelectedEvent(event || null);
                    }}
                    disabled={(date) => isBefore(date, startOfDay(new Date()))}
                    className="rounded-lg border border-white/10"
                  />
                </div>

                {selectedDate && eventsForDate.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">Events on this date:</h3>
                    {eventsForDate.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={cn(
                          "w-full text-left p-4 rounded-lg border transition-colors",
                          selectedEvent?.id === event.id
                            ? "border-gold-500 bg-gold-500/10"
                            : "border-white/10 hover:border-white/20"
                        )}
                      >
                        <h4 className="font-semibold text-white">{event.title}</h4>
                        <p className="text-sm text-white/60">{event.doors}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={nextStep} disabled={!selectedDate}>
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Table Selection */}
          {step === "table" && (
            <motion.div
              key="table"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-serif font-bold text-white mb-2">
                  Choose Your Table
                </h2>
                <p className="text-white/60">
                  {formatDate(selectedDate!)}
                  {selectedEvent && ` - ${selectedEvent.title}`}
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <FloorPlan
                    sections={sections}
                    selectedTable={selectedTable}
                    onTableSelect={handleTableSelect}
                    reservedTableIds={reservedTableIds}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-white">Available Tables</h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {sections.map((section) =>
                      section.tables
                        .filter((t) => !reservedTableIds.includes(t.id))
                        .map((table) => (
                          <button
                            key={table.id}
                            onClick={() => handleTableSelect(table)}
                            className={cn(
                              "w-full text-left p-3 rounded-lg border transition-colors",
                              selectedTable?.id === table.id
                                ? "border-gold-500 bg-gold-500/10"
                                : "border-white/10 hover:border-white/20"
                            )}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-white">{table.name}</h4>
                                <p className="text-sm text-white/50">{section.name}</p>
                              </div>
                              <Badge variant="outline">
                                <Users className="h-3 w-3 mr-1" />
                                {table.capacity}
                              </Badge>
                            </div>
                            {table.minimumSpend && (
                              <p className="text-sm text-gold-500 mt-1">
                                Min spend: {formatCurrency(Number(table.minimumSpend))}
                              </p>
                            )}
                          </button>
                        ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={nextStep} disabled={!selectedTable}>
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Guest Details */}
          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-serif font-bold text-white mb-2">
                  Your Details
                </h2>
                <p className="text-white/60">
                  Tell us about yourself and your party
                </p>
              </div>

              <form className="max-w-xl mx-auto space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guestName">Full Name *</Label>
                    <Input
                      id="guestName"
                      placeholder="John Doe"
                      {...register("guestName")}
                    />
                    {errors.guestName && (
                      <p className="text-sm text-red-500">{errors.guestName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="partySize">Party Size *</Label>
                    <Select
                      defaultValue="2"
                      onValueChange={(value) => setValue("partySize", parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select party size" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: selectedTable?.capacity || 10 },
                          (_, i) => i + 1
                        ).map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? "guest" : "guests"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.partySize && (
                      <p className="text-sm text-red-500">{errors.partySize.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestEmail">Email *</Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    placeholder="john@example.com"
                    {...register("guestEmail")}
                  />
                  {errors.guestEmail && (
                    <p className="text-sm text-red-500">{errors.guestEmail.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestPhone">Phone Number *</Label>
                  <Input
                    id="guestPhone"
                    type="tel"
                    placeholder="(510) 555-0123"
                    {...register("guestPhone")}
                  />
                  {errors.guestPhone && (
                    <p className="text-sm text-red-500">{errors.guestPhone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occasion">Occasion (Optional)</Label>
                  <Select onValueChange={(value) => setValue("occasion", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select occasion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="birthday">Birthday</SelectItem>
                      <SelectItem value="anniversary">Anniversary</SelectItem>
                      <SelectItem value="celebration">Celebration</SelectItem>
                      <SelectItem value="corporate">Corporate Event</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                  <Textarea
                    id="specialRequests"
                    placeholder="Any special requests or accommodations..."
                    rows={3}
                    {...register("specialRequests")}
                  />
                </div>
              </form>

              <div className="flex justify-between max-w-xl mx-auto">
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={nextStep}>
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {step === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-serif font-bold text-white mb-2">
                  Review Your Reservation
                </h2>
                <p className="text-white/60">
                  Please confirm the details below
                </p>
              </div>

              <div className="max-w-xl mx-auto space-y-6">
                <Card glass className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-white/60">Date</span>
                      <span className="text-white font-medium">
                        {selectedDate && formatDate(selectedDate)}
                      </span>
                    </div>
                    {selectedEvent && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Event</span>
                        <span className="text-white font-medium">{selectedEvent.title}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-white/60">Table</span>
                      <span className="text-white font-medium">{selectedTable?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Section</span>
                      <span className="text-white font-medium">{selectedSection?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Capacity</span>
                      <span className="text-white font-medium">
                        Up to {selectedTable?.capacity} guests
                      </span>
                    </div>
                    {selectedTable?.minimumSpend && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Minimum Spend</span>
                        <span className="text-gold-500 font-medium">
                          {formatCurrency(Number(selectedTable.minimumSpend))}
                        </span>
                      </div>
                    )}
                    {selectedTable?.depositRequired && (
                      <>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-white/60">Deposit Required</span>
                          <span className="text-gold-500 font-bold">
                            {formatCurrency(Number(selectedTable.depositRequired))}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="min-w-[150px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : selectedTable?.depositRequired ? (
                      "Continue to Payment"
                    ) : (
                      "Confirm Reservation"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
