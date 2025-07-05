export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  check: (logStats: LogStats) => boolean;
};

export type LogStats = {
  totalHoursToday: number;
  totalHoursThisWeek: number;
  totalHoursThisMonth: number;
  lateNightSessions: number;
  earlyMorningSessions: number;
  longestStreak: number;
  totalTasks: number;
  avgDurationPerTask: number;
  topRankMonth: boolean;
  topRankWeek: boolean;
  completedAllTasks: boolean;
  largeTaskCount: number;
  missedDeadlineCount: number;
  afkCount: number;
  multitasking: boolean;
};

export const achievements: Achievement[] = [
  {
    id: "night-owl",
    name: "🌙 Night Owl",
    description: "Works late into the night frequently.",
    icon: "🌙",
    check: (s) => s.lateNightSessions >= 5,
  },
  {
    id: "early-bird",
    name: "☀️ Early Bird",
    description: "Consistently starts early before 7AM.",
    icon: "☀️",
    check: (s) => s.earlyMorningSessions >= 5,
  },
  {
    id: "time-keeper",
    name: "🕒 Time Keeper",
    description: "Logs time daily for a full week.",
    icon: "🕒",
    check: (s) => s.longestStreak >= 7,
  },
  {
    id: "tiger-getter",
    name: "🐅 Tiger Getter",
    description: "Completed multiple tasks over 5 hours.",
    icon: "🐅",
    check: (s) => s.largeTaskCount >= 3,
  },
  {
    id: "finisher",
    name: "🚀 The Finisher",
    description: "All tasks completed this week.",
    icon: "🚀",
    check: (s) => s.completedAllTasks,
  },
  {
    id: "peak-performer",
    name: "⛰️ Peak Performer",
    description: "Top contributor this month.",
    icon: "⛰️",
    check: (s) => s.topRankMonth,
  },
  {
    id: "streak-master",
    name: "🔥 Streak Master",
    description: "Logged time for 14 days in a row.",
    icon: "🔥",
    check: (s) => s.longestStreak >= 14,
  },
  {
    id: "task-ninja",
    name: "🧩 Task Ninja",
    description: "Efficiently finishes lots of small tasks.",
    icon: "🧩",
    check: (s) => s.avgDurationPerTask <= 1 && s.totalTasks >= 20,
  },
  {
    id: "zen-logger",
    name: "🧘 Zen Logger",
    description: "Logs consistently with zero force stops.",
    icon: "🧘",
    check: (s) => s.afkCount === 0,
  },
  {
    id: "slow-steady",
    name: "🐢 Slow But Steady",
    description: "Logs <2h per day consistently, but never misses a day.",
    icon: "🐢",
    check: (s) => s.totalHoursToday <= 2 && s.longestStreak >= 10,
  },
  {
    id: "focus-sniper",
    name: "🎯 Focus Sniper",
    description: "No multitasking, one task at a time.",
    icon: "🎯",
    check: (s) => !s.multitasking,
  },
  {
    id: "deadline-warrior",
    name: "📅 Mr./Ms. Deadline",
    description: "Logs time close to project deadlines.",
    icon: "📅",
    check: (s) => s.missedDeadlineCount >= 3,
  },
  {
    id: "afk-lord",
    name: "💻 AFK Lord",
    description: "Long active timer with very short task output.",
    icon: "💻",
    check: (s) => s.afkCount >= 2,
  },
  {
    id: "task-magician",
    name: "🎩 Task Magician",
    description: "Huge task completed in surprisingly short time.",
    icon: "🎩",
    check: (s) => s.largeTaskCount > 0 && s.avgDurationPerTask <= 1.5,
  },
  {
    id: "charged-up",
    name: "🔋 Full Charged",
    description: "Logs 8h+ on a Monday. Ready to grind!",
    icon: "🔋",
    check: (s) => s.totalHoursToday >= 8,
  },
];
