/**
 * LocalStorage Offline Persistence & Progress Tracker
 * Keeps track of badges, daily usage, milestones, and parental settings.
 */

import { ContentType, AudioLanguage, AlphabetLanguage } from './learningData';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  targetCount: number;
  category: 'smash' | 'streak' | 'explore' | 'math' | 'alphabet';
}

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  activeSeconds: number;
  smashesToday: number;
}

export interface ParentSettings {
  dailyLimitMinutes: number; // 0 = unlimited, 5, 10, 15, 20, 30
  parentPin: string; // e.g. "7"
  speechRate: number; // 0.85
  kidLock: boolean;
  hapticFeedback: boolean;
  audioLanguage: AudioLanguage;
  contentType: ContentType;
  alphabetLanguage: AlphabetLanguage;
}

export type GameDifficulty = 'easy' | 'normal' | 'hard';
export type GameTheme = 'house' | 'burrow' | 'tree' | 'ocean';

export interface GameStats {
  totalSmashes: number;
  highestStreak: number;
  sessionsCount: number;
  favoriteTheme: GameTheme;
  numbersPracticed: Record<string, number>;
  lettersPracticed: Record<string, number>;
}

const DEFAULT_BADGES: Badge[] = [
  {
    id: 'first_smash',
    name: 'First Pop!',
    description: 'Smashed your very first spot!',
    icon: '🐣',
    unlockedAt: null,
    targetCount: 1,
    category: 'smash',
  },
  {
    id: 'high_five',
    name: 'High Five!',
    description: 'Smashed 5 happy spots!',
    icon: '🖐️',
    unlockedAt: null,
    targetCount: 5,
    category: 'smash',
  },
  {
    id: 'super_popper',
    name: 'Super Popper',
    description: 'Reached 15 total smashes!',
    icon: '⭐',
    unlockedAt: null,
    targetCount: 15,
    category: 'smash',
  },
  {
    id: 'number_wizard',
    name: 'Number Wizard',
    description: 'Smashed 30 spots like a math champ!',
    icon: '🧙‍♂️',
    unlockedAt: null,
    targetCount: 30,
    category: 'math',
  },
  {
    id: 'alphabet_ace',
    name: 'Alphabet Star',
    description: 'Smashed 20 alphabet letters!',
    icon: '🔤',
    unlockedAt: null,
    targetCount: 20,
    category: 'alphabet',
  },
  {
    id: 'grand_champion',
    name: 'Mega Champion',
    description: 'Reached 60 smashes!',
    icon: '🏆',
    unlockedAt: null,
    targetCount: 60,
    category: 'smash',
  },
  {
    id: 'century_star',
    name: 'Century Star',
    description: 'Incredible! 100 spots smashed!',
    icon: '👑',
    unlockedAt: null,
    targetCount: 100,
    category: 'smash',
  },
  {
    id: 'streak_five',
    name: 'Quick Reflexes',
    description: 'Got a 5-smash winning streak!',
    icon: '⚡',
    unlockedAt: null,
    targetCount: 5,
    category: 'streak',
  },
  {
    id: 'all_themes',
    name: 'World Explorer',
    description: 'Played in all magical worlds!',
    icon: '🌍',
    unlockedAt: null,
    targetCount: 4,
    category: 'explore',
  },
  {
    id: 'polyglot',
    name: 'Language Explorer',
    description: 'Tried Arabic, French or English audio!',
    icon: '🌐',
    unlockedAt: null,
    targetCount: 1,
    category: 'explore',
  },
];

const DEFAULT_SETTINGS: ParentSettings = {
  dailyLimitMinutes: 15,
  parentPin: '7',
  speechRate: 0.85,
  kidLock: false,
  hapticFeedback: true,
  audioLanguage: 'en',
  contentType: 'numbers',
  alphabetLanguage: 'en',
};

const DEFAULT_STATS: GameStats = {
  totalSmashes: 0,
  highestStreak: 0,
  sessionsCount: 1,
  favoriteTheme: 'house',
  numbersPracticed: {},
  lettersPracticed: {},
};

export class StorageService {
  private getTodayKey(): string {
    const today = new Date().toISOString().slice(0, 10);
    return `ns3d_daily_${today}`;
  }

  public getDailyUsage(): DailyUsage {
    const key = this.getTodayKey();
    const today = new Date().toISOString().slice(0, 10);
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignored
    }
    return {
      date: today,
      activeSeconds: 0,
      smashesToday: 0,
    };
  }

  public saveDailyUsage(usage: DailyUsage) {
    try {
      const key = this.getTodayKey();
      localStorage.setItem(key, JSON.stringify(usage));
    } catch {
      // Ignored
    }
  }

  public recordActiveSeconds(seconds: number): DailyUsage {
    const usage = this.getDailyUsage();
    usage.activeSeconds += seconds;
    this.saveDailyUsage(usage);
    return usage;
  }

  public getStats(): GameStats {
    try {
      const saved = localStorage.getItem('ns3d_stats');
      if (saved) {
        return { ...DEFAULT_STATS, ...JSON.parse(saved) };
      }
    } catch {
      // Ignored
    }
    return { ...DEFAULT_STATS };
  }

  public saveStats(stats: GameStats) {
    try {
      localStorage.setItem('ns3d_stats', JSON.stringify(stats));
    } catch {
      // Ignored
    }
  }

  public getSettings(): ParentSettings {
    try {
      const saved = localStorage.getItem('ns3d_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Ignored
    }
    return { ...DEFAULT_SETTINGS };
  }

  public saveSettings(settings: ParentSettings) {
    try {
      localStorage.setItem('ns3d_settings', JSON.stringify(settings));
    } catch {
      // Ignored
    }
  }

  public getBadges(): Badge[] {
    try {
      const saved = localStorage.getItem('ns3d_badges');
      if (saved) {
        const parsed = JSON.parse(saved) as Badge[];
        return DEFAULT_BADGES.map((def) => {
          const found = parsed.find((b) => b.id === def.id);
          return found ? { ...def, unlockedAt: found.unlockedAt } : def;
        });
      }
    } catch {
      // Ignored
    }
    return [...DEFAULT_BADGES];
  }

  public saveBadges(badges: Badge[]) {
    try {
      localStorage.setItem('ns3d_badges', JSON.stringify(badges));
    } catch {
      // Ignored
    }
  }

  public checkBadges(
    stats: GameStats,
    currentStreak: number,
    themesUsed: Set<string>,
    languagesUsed: Set<string>,
    isAlphabetMode: boolean
  ): Badge[] {
    const badges = this.getBadges();
    const newlyUnlocked: Badge[] = [];
    const now = new Date().toISOString();

    badges.forEach((b) => {
      if (b.unlockedAt) return;

      let shouldUnlock = false;
      if (b.category === 'smash' && stats.totalSmashes >= b.targetCount) {
        shouldUnlock = true;
      } else if (b.category === 'streak' && currentStreak >= b.targetCount) {
        shouldUnlock = true;
      } else if (b.id === 'all_themes' && themesUsed.size >= 4) {
        shouldUnlock = true;
      } else if (b.id === 'polyglot' && languagesUsed.size >= 2) {
        shouldUnlock = true;
      } else if (b.id === 'alphabet_ace' && isAlphabetMode && stats.totalSmashes >= b.targetCount) {
        shouldUnlock = true;
      } else if (b.id === 'number_wizard' && !isAlphabetMode && stats.totalSmashes >= b.targetCount) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        b.unlockedAt = now;
        newlyUnlocked.push(b);
      }
    });

    if (newlyUnlocked.length > 0) {
      this.saveBadges(badges);
    }

    return newlyUnlocked;
  }

  public resetAllProgress() {
    try {
      localStorage.removeItem('ns3d_stats');
      localStorage.removeItem('ns3d_badges');
      const key = this.getTodayKey();
      localStorage.removeItem(key);
    } catch {
      // Ignored
    }
  }
}

export const storageService = new StorageService();
