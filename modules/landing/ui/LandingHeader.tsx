"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all",
        scrolled
          ? "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-24 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.jpg"
            alt="fishforecaster.net"
            width={360}
            height={108}
            className="h-20 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-3 sm:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Sign Up Free</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 sm:hidden text-muted-foreground hover:text-foreground"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t bg-background p-4 sm:hidden">
          <div className="flex flex-col gap-2">
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/register">Sign Up Free</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
