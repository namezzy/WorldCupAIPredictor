"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Users, CalendarDays, Radio, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const mobileNavItems: {
  key: "home" | "teams" | "schedule" | "live" | "bracket";
  href: string;
  icon: LucideIcon;
}[] = [
  { key: "home", href: "/", icon: Home },
  { key: "teams", href: "/teams", icon: Users },
  { key: "schedule", href: "/schedule", icon: CalendarDays },
  { key: "live", href: "/live", icon: Radio },
  { key: "bracket", href: "/bracket", icon: Trophy },
];

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/40 bg-background/90 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {mobileNavItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors",
                  isActive
                    ? "text-brand-gold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="mobileNavActive"
                    className="absolute -top-px h-0.5 w-8 rounded-full bg-brand-gold"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Icon className="h-5 w-5" />
                <span className="leading-none">{t.nav[item.key]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
