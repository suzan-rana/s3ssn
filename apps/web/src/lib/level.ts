/**
 * Coding "RPG": level = floor(sqrt(hours/2)) + 1. Rank names for flavor.
 * Pure functions so server + client can share.
 */
const RANKS = [
  'BOOTSTRAP',
  'COMMITTER',
  'REFACTORER',
  'ARCHITECT',
  'SHIPWRIGHT',
  'KEEPER',
  'LOREMASTER',
  'GRANDMASTER',
  'MYTHIC',
  'LEGEND',
] as const;

export function levelFromSeconds(totalSeconds: number): {
  level: number;
  rank: string;
  currentXp: number;
  nextThresholdXp: number;
  progress: number;
} {
  const xp = totalSeconds; // 1 XP = 1 second
  const level = Math.max(1, Math.floor(Math.sqrt(xp / 7200)) + 1);
  const base = (level - 1) ** 2 * 7200;
  const next = level ** 2 * 7200;
  const progress = Math.min(1, (xp - base) / (next - base || 1));
  return {
    level,
    rank: RANKS[Math.min(level - 1, RANKS.length - 1)] ?? 'LEGEND',
    currentXp: xp - base,
    nextThresholdXp: next - base,
    progress,
  };
}

export function comboFromSessions(sessions: Array<{ activeSeconds: number }>): number {
  // Combo = number of recent sessions >= 15 min back-to-back.
  let combo = 0;
  for (const s of sessions) {
    if (s.activeSeconds >= 15 * 60) combo += 1;
    else break;
  }
  return combo;
}
