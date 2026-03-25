import { Role } from "@prisma/client";

// Permission definitions by role
export const permissions = {
  // Site & API settings - Admin only
  "site.settings.view": [Role.ADMIN],
  "site.settings.edit": [Role.ADMIN],
  "site.content.view": [Role.ADMIN],
  "site.content.edit": [Role.ADMIN],
  "site.apikeys.view": [Role.ADMIN],
  "site.apikeys.edit": [Role.ADMIN],

  // Staff management - Admin and Manager
  "staff.view": [Role.ADMIN, Role.MANAGER],
  "staff.create": [Role.ADMIN, Role.MANAGER],
  "staff.edit": [Role.ADMIN, Role.MANAGER],
  "staff.delete": [Role.ADMIN], // Only admin can delete

  // Events - Admin and Manager
  "events.view": [Role.ADMIN, Role.MANAGER, Role.STAFF],
  "events.create": [Role.ADMIN, Role.MANAGER],
  "events.edit": [Role.ADMIN, Role.MANAGER],
  "events.delete": [Role.ADMIN, Role.MANAGER],

  // Reservations - All staff can view and manage
  "reservations.view": [Role.ADMIN, Role.MANAGER, Role.STAFF],
  "reservations.create": [Role.ADMIN, Role.MANAGER, Role.STAFF],
  "reservations.edit": [Role.ADMIN, Role.MANAGER, Role.STAFF],
  "reservations.delete": [Role.ADMIN, Role.MANAGER],

  // Tickets - Staff can scan/validate tickets
  "tickets.view": [Role.ADMIN, Role.MANAGER, Role.STAFF],
  "tickets.scan": [Role.ADMIN, Role.MANAGER, Role.STAFF],
  "tickets.validate": [Role.ADMIN, Role.MANAGER, Role.STAFF],

  // Tables - Admin and Manager
  "tables.view": [Role.ADMIN, Role.MANAGER, Role.STAFF],
  "tables.create": [Role.ADMIN, Role.MANAGER],
  "tables.edit": [Role.ADMIN, Role.MANAGER],
  "tables.delete": [Role.ADMIN, Role.MANAGER],

  // Bottles - Admin and Manager
  "bottles.view": [Role.ADMIN, Role.MANAGER, Role.STAFF],
  "bottles.create": [Role.ADMIN, Role.MANAGER],
  "bottles.edit": [Role.ADMIN, Role.MANAGER],
  "bottles.delete": [Role.ADMIN, Role.MANAGER],

  // Gallery - Admin and Manager
  "gallery.view": [Role.ADMIN, Role.MANAGER, Role.STAFF],
  "gallery.upload": [Role.ADMIN, Role.MANAGER],
  "gallery.delete": [Role.ADMIN, Role.MANAGER],

  // Sales/Revenue - Admin and Manager only (Staff cannot see)
  "sales.view": [Role.ADMIN, Role.MANAGER],
  "sales.tickets": [Role.ADMIN, Role.MANAGER],
  "sales.reservations": [Role.ADMIN, Role.MANAGER],
  "sales.export": [Role.ADMIN, Role.MANAGER],

  // Subscribers - Admin and Manager
  "subscribers.view": [Role.ADMIN, Role.MANAGER],
  "subscribers.export": [Role.ADMIN, Role.MANAGER],
} as const;

export type Permission = keyof typeof permissions;

export function hasPermission(role: Role, permission: Permission): boolean {
  const allowedRoles = permissions[permission] as readonly Role[];
  return allowedRoles?.includes(role) ?? false;
}

export function hasAnyPermission(role: Role, permissionList: Permission[]): boolean {
  return permissionList.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(role: Role, permissionList: Permission[]): boolean {
  return permissionList.every((permission) => hasPermission(role, permission));
}

// Role hierarchy
export function canManageRole(managerRole: Role, targetRole: Role): boolean {
  const hierarchy: Record<Role, number> = {
    ADMIN: 3,
    MANAGER: 2,
    STAFF: 1,
  };

  // Can only manage roles below your level
  // Managers can only create/edit STAFF
  return hierarchy[managerRole] > hierarchy[targetRole];
}

// Get allowed roles a user can create
export function getCreatableRoles(role: Role): Role[] {
  if (role === Role.ADMIN) {
    return [Role.ADMIN, Role.MANAGER, Role.STAFF];
  }
  if (role === Role.MANAGER) {
    return [Role.STAFF];
  }
  return [];
}
