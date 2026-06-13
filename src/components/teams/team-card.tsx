"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getFlagUrl } from "@/lib/utils";
import { Team } from "@/types";

interface TeamCardProps {
  team: Team;
  index?: number;
}

export function TeamCard({ team, index = 0 }: TeamCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <Link href={`/team/${team.slug}`}>
        <Card className="hover-glow cursor-pointer border-border bg-card p-4 text-center">
          <div className="relative mx-auto mb-3 h-12 w-16">
            <Image
              src={getFlagUrl(team.code)}
              alt={team.name}
              fill
              className="rounded-sm object-cover"
              unoptimized
            />
          </div>
          <h3 className="mb-1 text-sm font-semibold transition-colors group-hover/card:text-brand-gold">
            {team.name}
          </h3>
          <div className="mb-2 flex items-center justify-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {team.confederation}
            </Badge>
          </div>
          <div className="space-y-0.5 text-xs text-muted-foreground">
            {team.fifa_ranking && <p>FIFA Rank: #{team.fifa_ranking}</p>}
            <p>Elo: {team.elo_rating}</p>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
