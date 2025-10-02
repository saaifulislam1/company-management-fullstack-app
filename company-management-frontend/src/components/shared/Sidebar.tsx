"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarCheck2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Define which specific roles can see each link
  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/attendance", label: "Attendance", icon: ClipboardList },
    { href: "/leave", label: "Leave", icon: CalendarCheck2 },
    {
      href: "/team-requests",
      label: "Team Requests",
      icon: Users,
      showForRoles: ["MANAGER", "ADMIN", "HR"],
    },
    {
      href: "/employees",
      label: "All Employees",
      icon: Users,
      showForRoles: ["ADMIN", "HR"],
    },
    {
      href: "/manage-leave",
      label: "Manage Leave",
      icon: ShieldCheck,
      showForRoles: ["ADMIN", "HR"],
    },
  ];

  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-slate-100 p-4 dark:bg-slate-900 md:flex">
      <div className="mb-8 text-2xl font-bold">
        <Link href="/dashboard">CMS</Link>
      </div>
      <nav className="flex flex-col space-y-2">
        {navLinks.map((link) => {
          // --- UPDATED LOGIC ---
          // If the link has role restrictions and the user's role is not in the list, skip rendering it.
          if (
            link.showForRoles &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            !link.showForRoles.includes(user?.role as any)
          ) {
            return null;
          }

          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                isActive
                  ? "bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900"
                  : "text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800"
              )}
            >
              <link.icon className="mr-3 h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
