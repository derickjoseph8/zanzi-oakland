import type {
  User,
  Section,
  Table,
  Reservation,
  Bottle,
  BottleCategory,
  Event,
  Ticket,
  GalleryImage,
  MenuItem,
  MenuCategory,
  Subscriber,
  Setting,
  BottlePackage,
  ReservationBottle,
} from "@prisma/client";

// Extended types with relations
export type TableWithSection = Table & {
  section: Section;
};

export type SectionWithTables = Section & {
  tables: Table[];
};

export type ReservationWithRelations = Reservation & {
  table: TableWithSection;
  event: Event | null;
  bottles: (ReservationBottle & { bottle: Bottle })[];
};

export type BottleWithCategory = Bottle & {
  category: BottleCategory;
};

export type BottleCategoryWithBottles = BottleCategory & {
  bottles: Bottle[];
};

export type EventWithRelations = Event & {
  reservations: Reservation[];
  tickets: Ticket[];
};

export type TicketWithEvent = Ticket & {
  event: Event;
};

export type MenuItemWithCategory = MenuItem & {
  category: MenuCategory;
};

export type MenuCategoryWithItems = MenuCategory & {
  items: MenuItem[];
};

// Floor plan position type
export interface TablePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Payment types
export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

// Settings types
export interface BusinessHours {
  [key: string]: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
}

// Re-export Prisma types for convenience
export type {
  User,
  Section,
  Table,
  Reservation,
  Bottle,
  BottleCategory,
  Event,
  Ticket,
  GalleryImage,
  MenuItem,
  MenuCategory,
  Subscriber,
  Setting,
  BottlePackage,
  ReservationBottle,
};

// Enums
export { Role, TableShape, ReservationStatus, TicketStatus, MenuType } from "@prisma/client";
