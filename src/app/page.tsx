import Link from "next/link";

import { HeroSection } from "@/components/home/hero-section";
import { HotMatches } from "@/components/home/hot-matches";
import { getHotMatches } from "@/lib/data/matches";

export default async function HomePage() {
  const hotMatches = await getHotMatches();

  return (
    <div className="space-y-16 pb-16">
      <HeroSection />
      <section className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h2 className="font-display text-3xl font-bold">🔥 Hot Matches</h2>
          <Link
            href="/matches"
            className="text-sm text-brand-gold transition-colors hover:text-brand-gold/80 hover:underline"
          >
            View all →
          </Link>
        </div>
        <HotMatches matches={hotMatches} />
      </section>
    </div>
  );
}
