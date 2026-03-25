import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { Role } from "@prisma/client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect to login if not authenticated (except for login page)
  if (!session?.user) {
    return <>{children}</>;
  }

  const userRole = (session.user.role as Role) || Role.STAFF;

  return (
    <div className="min-h-screen bg-navy-900">
      <AdminSidebar userRole={userRole} />
      <div className="lg:pl-64">
        <AdminHeader user={session.user} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
