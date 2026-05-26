export type ScoreTier = "strong" | "good" | "fair" | "weak";

export function getScoreTier(score: number): ScoreTier {
  if (score >= 80) return "strong";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "weak";
}

export function getScoreTierLabel(score: number): string {
  const tier = getScoreTier(score);
  if (tier === "strong") return "Strong";
  if (tier === "good") return "Good";
  if (tier === "fair") return "Fair";
  return "Needs work";
}

export function getScoreDescription(score: number): string {
  const tier = getScoreTier(score);
  if (tier === "strong") return "High-priority match";
  if (tier === "good") return "Worth reviewing";
  if (tier === "fair") return "Check skill gaps";
  return "Lower alignment";
}

export function getScoreBadgeClass(score: number): string {
  const tier = getScoreTier(score);
  if (tier === "strong") {
    return "border-score-strong/30 bg-score-strong/10 text-score-strong";
  }
  if (tier === "good") {
    return "border-score-good/30 bg-score-good/10 text-score-good";
  }
  if (tier === "fair") {
    return "border-score-fair/30 bg-score-fair/10 text-score-fair";
  }
  return "border-score-weak/30 bg-score-weak/10 text-score-weak";
}

export function getScoreBarClass(score: number): string {
  const tier = getScoreTier(score);
  if (tier === "strong") return "bg-score-strong";
  if (tier === "good") return "bg-score-good";
  if (tier === "fair") return "bg-score-fair";
  return "bg-score-weak";
}
