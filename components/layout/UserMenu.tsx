"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, User, CreditCard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlanBadge } from "@/modules/subscription/ui/PlanBadge";

interface UserMenuProps {
  name: string;
  email: string;
  subscriptionTier?: "FREE" | "FRESHWATER" | "SALTWATER" | "ALL_ACCESS";
  isAdmin?: boolean;
}

export function UserMenu({ name, email, subscriptionTier = "FREE", isAdmin }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{name}</span>
          <PlanBadge tier={subscriptionTier} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{name}</span>
            <span className="text-xs text-muted-foreground">{email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/account">
            <CreditCard className="mr-2 h-4 w-4" />
            Account & Billing
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/dashboard/admin">
              <Shield className="mr-2 h-4 w-4" />
              Admin Dashboard
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
