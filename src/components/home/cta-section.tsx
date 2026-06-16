"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { useI18n } from "@/lib/i18n";

export function CtaSection() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-navy via-[#0a1628] to-[#0d2b45] py-16 text-white">
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-pitch-green opacity-10 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-[1280px] px-4 text-center">
        <h2 className="mb-4 font-display text-2xl font-bold md:text-4xl">
          {t.home.ctaTitle}
        </h2>
        <p className="mx-auto mb-8 max-w-lg text-white/60">
          {t.home.ctaDesc}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/teams"
            className="group inline-flex items-center gap-2 rounded-xl bg-pitch-green px-8 py-4 text-sm font-bold text-white transition-all hover:brightness-110"
          >
            {t.home.ctaExplore}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/schedule"
            className="group inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-white/10"
          >
            {t.home.ctaSchedule}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
