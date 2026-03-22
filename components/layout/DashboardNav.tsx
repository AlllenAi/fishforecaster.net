"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Forecasts" },
  { href: "/dashboard/map", label: "Map" },
  { href: "/dashboard/catches", label: "Catches" },
  { href: "/dashboard/account", label: "Account" },
];

interface DashboardNavProps {
  isAdmin?: boolean;
}

export function DashboardNav({ isAdmin }: DashboardNavProps) {
  const pathname = usePathname();

  const items = isAdmin
    ? [...navItems, { href: "/dashboard/admin", label: "Admin" }]
    : navItems;

  return (
    <nav className="flex items-center gap-1">
      {items.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
