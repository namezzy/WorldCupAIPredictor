"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Trophy, Menu, Sun, Moon, Globe } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useI18n, type Locale } from "@/lib/i18n";

const navKeys = [
  { key: "home" as const, href: "/" },
  { key: "schedule" as const, href: "/schedule" },
  { key: "matches" as const, href: "/matches" },
  { key: "teams" as const, href: "/teams" },
  { key: "live" as const, href: "/live" },
  { key: "leaderboard" as const, href: "/leaderboard" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { locale, t, setLocale } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const toggleLocale = () =>
    setLocale(locale === "en" ? "zh" : ("en" as Locale));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2">
          <Trophy className="h-6 w-6 text-brand-gold transition-transform group-hover:scale-110" />
          <span className="font-display text-xl font-bold">
            <span className="text-gradient">WorldCup</span>
            <span className="text-foreground"> AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navKeys.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-brand-gold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="relative z-10">{t.nav[item.key]}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-lg border border-brand-gold/20 bg-brand-gold/10"
                    transition={{
                      type: "spring",
                      bounce: 0.2,
                      duration: 0.6,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-1 md:flex">
          {mounted && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="h-9 w-9"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLocale}
                className="gap-1 text-xs"
                aria-label="Switch language"
              >
                <Globe className="h-3.5 w-3.5" />
                {locale === "en" ? "中" : "EN"}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            className="ml-1 border-brand-gold/30 text-brand-gold hover:bg-brand-gold/10"
          >
            {t.nav.signIn}
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="md:hidden"
            render={
              <Button variant="ghost" size="icon" aria-label="Open navigation menu" />
            }
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72 border-border bg-background">
            <nav className="mt-8 flex flex-col gap-2">
              {navKeys.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "border border-brand-gold/20 bg-brand-gold/10 text-brand-gold"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    {t.nav[item.key]}
                  </Link>
                );
              })}
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                {mounted && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      className="h-9 w-9"
                    >
                      {theme === "dark" ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleLocale}
                      className="gap-1 text-xs"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {locale === "en" ? "中文" : "EN"}
                    </Button>
                  </>
                )}
              </div>
              <Button className="mt-2 w-full bg-brand-gold text-background hover:bg-brand-gold/90">
                {t.nav.signIn}
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
