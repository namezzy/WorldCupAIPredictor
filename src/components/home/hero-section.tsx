"use client";

import Link from "next/link";
import { animate, motion, type Variants } from "framer-motion";
import { Trophy, Users, Calendar, BrainCircuit, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { useI18n } from "@/lib/i18n";

const statKeys = [
  { value: 48, suffix: "", key: "teams" as const },
  { value: 104, suffix: "", key: "matches" as const },
  { value: 12, suffix: "", key: "groups" as const },
  { value: 3, suffix: "+", key: "dataSources" as const },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const c = animate(0, value, {
      duration: 1.2,
      delay: 0.3,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => c.stop();
  }, [value]);
  return <>{display}</>;
}

export function HeroSection() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-navy via-[#0a1628] to-[#0d2b45] text-white">
      {/* Decorative blurs */}
      <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-pitch-green blur-[150px] opacity-15" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-brand-gold blur-[150px] opacity-10" />
      <div className="absolute left-10 top-20 h-2 w-2 animate-pulse rounded-full bg-white/20" />
      <div className="absolute right-20 top-40 h-1.5 w-1.5 animate-pulse rounded-full bg-pitch-green/30" />

      <div className="relative z-10 mx-auto max-w-[1280px] px-4 py-16 md:py-24">
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="text-center"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur-sm">
              {t.hero.badge}
            </span>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-10 flex justify-center md:mb-12">
            <div className="relative">
              <div className="absolute inset-0 scale-150 rounded-full bg-brand-gold opacity-30 blur-xl" />
              <Trophy className="relative h-16 w-16 text-brand-gold drop-shadow-lg md:h-20 md:w-20" />
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mb-4 font-display text-4xl font-bold md:text-6xl lg:text-7xl"
          >
            <span className="text-brand-gold">WorldCup AI</span>{" "}
            <span className="text-white">{t.hero.title}</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mb-4 text-lg text-white/80 md:text-xl"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg"
          >
            {t.hero.description}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mb-14 flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/teams"
              className="group inline-flex items-center gap-2 rounded-xl bg-pitch-green px-8 py-4 text-sm font-bold text-white shadow-[0_20px_40px_-15px_rgba(26,71,42,0.5)] transition-all hover:brightness-110"
            >
              <Users className="h-4 w-4" />
              {t.hero.browseTeams}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/schedule"
              className="group inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-white/10"
            >
              <Calendar className="h-4 w-4" />
              {t.hero.viewSchedule}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/live"
              className="group inline-flex items-center gap-2 rounded-xl border border-brand-gold/40 bg-brand-gold/10 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-brand-gold/20"
            >
              <BrainCircuit className="h-4 w-4 text-brand-gold" />
              {t.hero.aiPredictions}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mx-auto grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4"
          >
            {statKeys.map((stat) => (
              <div
                key={stat.key}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm transition-all hover:bg-white/10"
              >
                <div className="font-display text-3xl font-bold text-white md:text-4xl">
                  <CountUp value={stat.value} />
                  {stat.suffix}
                </div>
                <div className="mt-1 text-xs text-white/60">
                  {t.hero.stats[stat.key]}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
