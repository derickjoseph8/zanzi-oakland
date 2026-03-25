"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Table2,
  Wine,
  Image as ImageIcon,
  Settings,
  Users,
  Ticket,
  Menu,
  X,
  BarChart3,
  UserCog,
  ScanLine,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Permission, hasPermission } from "@/lib/permissions";
import { Role } from "@prisma/client";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  permission?: Permission;
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Reservations", href: "/admin/reservations", icon: Calendar, permission: "reservations.view" },
  { name: "Ticket Scanner", href: "/admin/tickets", icon: ScanLine, permission: "tickets.scan" },
  { name: "Events", href: "/admin/events", icon: Ticket, permission: "events.view" },
  { name: "Tables", href: "/admin/tables", icon: Table2, permission: "tables.view" },
  { name: "Bottle Menu", href: "/admin/bottles", icon: Wine, permission: "bottles.view" },
  { name: "Gallery", href: "/admin/gallery", icon: ImageIcon, permission: "gallery.view" },
  { name: "Sales", href: "/admin/sales", icon: BarChart3, permission: "sales.view" },
  { name: "Staff", href: "/admin/staff", icon: UserCog, permission: "staff.view" },
  { name: "Subscribers", href: "/admin/subscribers", icon: Users, permission: "subscribers.view" },
  { name: "Settings", href: "/admin/settings", icon: Settings, permission: "site.settings.view" },
];

interface AdminSidebarProps {
  userRole: Role;
}

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Filter navigation based on user permissions
  const filteredNav = navigation.filter((item) => {
    if (!item.permission) return true; // No permission required (e.g., Dashboard)
    return hasPermission(userRole, item.permission);
  });

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10">
        <div className="relative w-10 h-10">
          <Image
            src="/logo.png"
            alt="Zanzi Oakland"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        <div>
          <h1 className="font-semibold text-white">Zanzi Oakland</h1>
          <p className="text-xs text-white/50">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-gold-500/20 text-gold-500"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <Link
          href="/"
          className="text-sm text-white/50 hover:text-white transition-colors"
        >
          View Site &rarr;
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-navy-800 border border-white/10"
      >
        {isMobileOpen ? (
          <X className="h-5 w-5 text-white" />
        ) : (
          <Menu className="h-5 w-5 text-white" />
        )}
      </button>

      {/* Mobile sidebar */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-navy-800 border-r border-white/10 flex flex-col transition-transform lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent />
      </aside>
    </>
  );
}
