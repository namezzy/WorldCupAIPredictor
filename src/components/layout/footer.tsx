"use client";

import Link from "next/link";
import { Trophy, Globe, MessageCircle } from "lucide-react";

import { useI18n } from "@/lib/i18n";

const footerNavKeys = [
  { key: "teams" as const, href: "/teams" },
  { key: "bracket" as const, href: "/bracket" },
  { key: "schedule" as const, href: "/schedule" },
  { key: "live" as const, href: "/live" },
  { key: "leaderboard" as const, href: "/leaderboard" },
];

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border/40 bg-background/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-brand-gold" />
              <span className="font-display text-lg font-bold">WorldCup AI</span>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              {t.footer.description}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">{t.footer.navigation}</h3>
            <ul className="space-y-2">
              {footerNavKeys.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t.nav[link.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">{t.footer.connect}</h3>
            <div className="flex gap-3">
              <a
                href="https://github.com/namezzy"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="GitHub"
              >
                <Globe className="h-5 w-5" />
              </a>
              <a
                href="mailto:xmj@linux.do"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Email"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
