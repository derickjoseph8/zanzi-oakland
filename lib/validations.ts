import { z } from "zod";

export const reservationSchema = z.object({
  tableId: z.string().min(1, "Please select a table"),
  eventId: z.string().optional(),
  date: z.coerce.date({
    required_error: "Please select a date",
    invalid_type_error: "Invalid date",
  }),
  guestName: z.string().min(2, "Name must be at least 2 characters"),
  guestEmail: z.string().email("Invalid email address"),
  guestPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  partySize: z.coerce.number().min(1, "Party size must be at least 1").max(20, "Maximum party size is 20"),
  specialRequests: z.string().optional(),
  occasion: z.string().optional(),
  bottles: z.array(z.object({
    bottleId: z.string(),
    quantity: z.number().min(1),
  })).optional(),
});

export type ReservationFormData = z.infer<typeof reservationSchema>;

export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDesc: z.string().max(160, "Short description must be under 160 characters").optional(),
  date: z.coerce.date({
    required_error: "Please select a date",
  }),
  endDate: z.coerce.date().optional(),
  doors: z.string().optional(),
  poster: z.string().url().optional().or(z.literal("")),
  isTicketed: z.boolean().default(false),
  ticketPrice: z.coerce.number().min(0).optional(),
  ticketLimit: z.coerce.number().min(1).optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  dressCode: z.string().optional(),
  ageLimit: z.coerce.number().min(18).max(21).default(21),
  artists: z.array(z.string()).optional(),
  genre: z.string().optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;

export const tableSchema = z.object({
  name: z.string().min(1, "Table name is required"),
  sectionId: z.string().min(1, "Please select a section"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1").max(20, "Maximum capacity is 20"),
  minimumSpend: z.coerce.number().min(0).optional(),
  depositRequired: z.coerce.number().min(0).optional(),
  requiresBottle: z.boolean().default(false),
  shape: z.enum(["CIRCLE", "RECTANGLE", "SQUARE", "BOOTH"]).default("CIRCLE"),
  position: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    rotation: z.number().optional(),
  }),
  isActive: z.boolean().default(true),
});

export type TableFormData = z.infer<typeof tableSchema>;

export const bottleSchema = z.object({
  name: z.string().min(1, "Bottle name is required"),
  categoryId: z.string().min(1, "Please select a category"),
  description: z.string().optional(),
  size: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be at least 0"),
  image: z.string().url().optional().or(z.literal("")),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export type BottleFormData = z.infer<typeof bottleSchema>;

export const ticketPurchaseSchema = z.object({
  eventId: z.string().min(1, "Event is required"),
  buyerName: z.string().min(2, "Name must be at least 2 characters"),
  buyerEmail: z.string().email("Invalid email address"),
  buyerPhone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  quantity: z.coerce.number().min(1, "Must purchase at least 1 ticket").max(10, "Maximum 10 tickets per purchase"),
  ticketType: z.string().default("General Admission"),
});

export type TicketPurchaseFormData = z.infer<typeof ticketPurchaseSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  source: z.string().optional(),
});

export type SubscribeFormData = z.infer<typeof subscribeSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
