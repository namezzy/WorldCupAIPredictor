import Link from "next/link";
import { Trophy, Globe, MessageCircle } from "lucide-react";

const footerLinks = [
  { label: "Schedule", href: "/schedule" },
  { label: "Matches", href: "/matches" },
  { label: "Teams", href: "/teams" },
  { label: "Groups", href: "/groups" },
  { label: "Predictions", href: "/predictions" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Community", href: "/community" },
];

export function Footer() {
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
              AI-powered World Cup 2026 predictions. Analyze matches, compete
              with friends, and climb the leaderboard.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Navigation</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Connect</h3>
            <div className="flex gap-3">
              <a
                href="#"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Community site"
              >
                <Globe className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Social updates"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 WorldCup AI Predictor. Built with AI. Not affiliated with
            FIFA.
          </p>
        </div>
      </div>
    </footer>
  );
}
