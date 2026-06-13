"use client";

import Link from "next/link";
import { animate, motion, type Variants } from "framer-motion";
import { Calendar, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const stats = [
  { icon: Users, value: 48, label: "Teams" },
  { icon: Calendar, value: 104, label: "Matches" },
  { icon: Trophy, value: 12, label: "Groups" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

function CountUp({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.4,
      delay: 0.3,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [value]);

  return <>{displayValue}</>;
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/20 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-gold/5 via-transparent to-transparent" />

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.h1
            variants={itemVariants}
            className="mb-6 font-display text-4xl font-bold md:text-6xl lg:text-7xl"
          >
            <span className="text-gradient">AI Predicts</span>
            <br />
            <span className="text-foreground">World Cup 2026</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Advanced AI models analyze team data, historical performance, and
            real-time factors to predict every match of the FIFA World Cup 2026.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mb-16 flex flex-wrap justify-center gap-4"
          >
            <Button
              size="lg"
              className="bg-brand-gold font-semibold text-background hover:bg-brand-gold/90"
              render={<Link href="/predictions" />}
            >
              View Predictions
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-border hover:bg-secondary"
              render={<Link href="/matches" />}
            >
              Browse Matches
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="mx-auto grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3 md:gap-8"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="glass-card hover-glow p-4 text-center md:p-6"
            >
              <stat.icon className="mx-auto mb-2 h-6 w-6 text-brand-gold md:h-8 md:w-8" />
              <div className="font-display text-2xl font-bold text-foreground md:text-4xl">
                <CountUp value={stat.value} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground md:text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
