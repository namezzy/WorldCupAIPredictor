"use client";

import Image from "next/image";
import Link from "next/link";
import { BrainCircuit, ChevronRight } from "lucide-react";

import { getFlagUrl } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { getTeamName } from "@/lib/i18n/teams";
import { MatchWithDetails } from "@/types";

interface FeaturedMatchProps {
  match: MatchWithDetails;
}

export function FeaturedMatch({ match }: FeaturedMatchProps) {
  const { locale, t } = useI18n();

  const matchDate = new Date(match.match_date).toLocaleDateString(
    locale === "zh" ? "zh-CN" : "en-US",
    { year: "numeric", month: "2-digit", day: "2-digit" }
  );

  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-12">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left: AI Prediction Showcase */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy via-[#0a1628] to-[#0d2b45] p-8 text-white md:p-10">
          <div className="absolute -top-12 right-4 h-52 w-52 rounded-full bg-brand-gold opacity-20 blur-[90px]" />
          <div className="absolute bottom-0 left-10 h-56 w-56 rounded-full bg-pitch-green opacity-20 blur-[110px]" />

          <div className="relative z-10">
            <div className="mb-3 flex flex-wrap gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                <BrainCircuit className="h-3.5 w-3.5 text-brand-gold" />
                {t.home.aiPrediction}
              </span>
            </div>

            <h2 className="mb-3 font-display text-2xl font-bold md:text-3xl">
              {locale === "zh"
                ? "AI 如何预判 2022 世界杯决赛"
                : "How AI Predicted the 2022 WC Final"}
            </h2>
            <p className="mb-6 max-w-xl text-base leading-7 text-white/70">
              {locale === "zh"
                ? "阿根廷 vs 法国 · 赛前信息、胜率变化、关键对位与赛果对照"
                : "Argentina vs France · Pre-match data, win probability shifts, key matchups & result comparison"}
            </p>

            {/* Mini match result display */}
            <div className="mb-6 flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <span className="text-sm font-medium text-white/60">2022 World Cup Final</span>
              <div className="flex items-center gap-3">
                <span className="font-bold">🇦🇷</span>
                <span className="font-display text-xl font-bold">3-3</span>
                <span className="font-bold">🇫🇷</span>
              </div>
              <span className="text-xs text-brand-gold">
                {locale === "zh" ? "点球 4-2" : "Pen. 4-2"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { value: "6", label: locale === "zh" ? "判断步骤" : "Analysis Steps" },
                { value: "3", label: locale === "zh" ? "参考信息" : "References" },
                { value: "4", label: locale === "zh" ? "胜率层级" : "Win Tiers" },
                { value: "✓", label: locale === "zh" ? "可查看" : "Viewable" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center"
                >
                  <div className="font-display text-xl font-bold text-brand-gold">
                    {item.value}
                  </div>
                  <div className="mt-1 text-xs text-white/60">{item.label}</div>
                </div>
              ))}
            </div>

            <Link
              href="/live"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-pitch-green transition-colors hover:text-pitch-light"
            >
              {locale === "zh" ? "查看预测回放" : "View Prediction Replay"}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Right: Featured Match Preview */}
        <Link href={`/match/${match.id}`} className="block">
          <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-8 transition-all hover:border-brand-gold/30 hover:shadow-lg hover:shadow-brand-gold/5 md:p-10">
            <div>
              <h3 className="mb-1 font-display text-lg font-bold">
                {t.home.featured.replace("⚡ ", "")}
              </h3>
              <p className="mb-2 text-xs font-semibold text-pitch-green">
                {t.home.featuredBadge}
              </p>
              <p className="mb-6 text-sm text-muted-foreground">
                {t.home.featuredDesc}
              </p>
            </div>

            {/* VS display */}
            <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-2 h-12 w-16 overflow-hidden rounded-sm">
                  <Image
                    src={getFlagUrl(match.home_team.code)}
                    alt={getTeamName(match.home_team.name, locale)}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <p className="text-sm font-bold">
                  {getTeamName(match.home_team.name, locale)}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <span className="font-display text-2xl font-bold text-brand-gold">
                  {t.home.vs}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">{matchDate}</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-2 h-12 w-16 overflow-hidden rounded-sm">
                  <Image
                    src={getFlagUrl(match.away_team.code)}
                    alt={getTeamName(match.away_team.name, locale)}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <p className="text-sm font-bold">
                  {getTeamName(match.away_team.name, locale)}
                </p>
              </div>
            </div>

            {/* Probability bar */}
            {match.prediction && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t.home.home} {match.prediction.home_win_prob}%</span>
                  <span>{t.home.draw} {match.prediction.draw_prob}%</span>
                  <span>{t.home.away} {match.prediction.away_win_prob}%</span>
                </div>
                <div className="flex h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="bg-green-500" style={{ width: `${match.prediction.home_win_prob}%` }} />
                  <div className="bg-yellow-500" style={{ width: `${match.prediction.draw_prob}%` }} />
                  <div className="bg-red-500" style={{ width: `${match.prediction.away_win_prob}%` }} />
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>
    </section>
  );
}
