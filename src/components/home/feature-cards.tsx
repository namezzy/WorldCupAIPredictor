"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BrainCircuit, CalendarPlus, Trophy, ChevronRight } from "lucide-react";

import { useI18n } from "@/lib/i18n";

export function FeatureCards() {
  const { t } = useI18n();
  const f = t.home.features;

  const cards = [
    {
      key: "predict",
      icon: BrainCircuit,
      href: "/live",
      accent: "text-brand-gold",
      ...f.predict,
    },
    {
      key: "calendar",
      icon: CalendarPlus,
      href: "/schedule",
      accent: "text-pitch-green",
      ...f.calendar,
    },
    {
      key: "community",
      icon: Trophy,
      href: "/leaderboard",
      accent: "text-brand-gold",
      ...f.community,
    },
  ];

  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-12">
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold">{f.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{f.hint}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Link href={card.href} className="group block h-full">
                <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-pitch-green/40 hover:shadow-lg">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pitch-green to-brand-gold opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
                    <Icon className={`h-5 w-5 ${card.accent}`} />
                  </div>

                  <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    {card.tag}
                  </p>
                  <h3 className="mb-2 font-display text-lg font-bold">
                    {card.title}
                  </h3>
                  <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {card.desc}
                  </p>

                  <span className="inline-flex items-center gap-1 text-sm font-bold text-pitch-green">
                    {card.action}
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
