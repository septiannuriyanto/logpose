import { achievements, LogStats } from "@/types/achievement";

export function getUserAchievements(stats: LogStats) {
  return achievements.filter((achievement) => achievement.check(stats));
}
