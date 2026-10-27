import React from 'react';
import { Volume2, Trophy, Shield, Flame, Globe } from 'lucide-react';
import { GameDifficulty, GameTheme } from '../services/storage';
import { AudioLanguage, ContentType, AlphabetLanguage } from '../services/learningData';

interface ScoreBoardProps {
  score: number;
  streak: number;
  activeDisplay: string;
  contentType: ContentType;
  audioLanguage: AudioLanguage;
  alphabetLanguage: AlphabetLanguage;
  difficulty: GameDifficulty;
  theme: GameTheme;
  onRepeat: () => void;
  onOpenBadges: () => void;
  onOpenParents: () => void;
  unlockedBadgeCount: number;
  totalBadgeCount: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  streak,
  activeDisplay,
  contentType,
  audioLanguage,
  onRepeat,
  onOpenBadges,
  onOpenParents,
  unlockedBadgeCount,
  totalBadgeCount,
}) => {
  const langFlags: Record<AudioLanguage, string> = {
    en: '🇬🇧 EN',
    fr: '🇫🇷 FR',
    ar: '🇸🇦 ع',
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-3 sm:p-4 flex items-center justify-between select-none">
      {/* Left: Star Score & Streak */}
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 bg-white/95 border-2 sm:border-3 border-amber-400 shadow-md rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2">
        <div className="flex items-center gap-1.5">
          <span className="text-2xl sm:text-3xl animate-bounce">⭐</span>
          <div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-800">
              Smashes
            </div>
            <div className="text-xl sm:text-2xl font-black tabular-nums text-slate-800 leading-none">
              {score}
            </div>
          </div>
        </div>

        {streak >= 3 && (
          <div className="flex items-center gap-1 bg-amber-100 border border-amber-300 rounded-xl px-2 py-0.5 ml-1">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-black text-orange-600 tabular-nums">
              {streak}x
            </span>
          </div>
        )}
      </div>

      {/* Center: Active Target Card (Tap to repeat sound!) */}
      <div className="pointer-events-auto flex items-center">
        <button
          onClick={onRepeat}
          title="Tap to hear pronunciation again!"
          className="group flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 hover:from-amber-300 hover:to-yellow-300 active:scale-95 transition-all text-slate-900 border-2 sm:border-3 border-amber-600 shadow-lg rounded-full px-4 sm:px-6 py-1.5 sm:py-2 cursor-pointer"
        >
          <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-900 group-hover:scale-110 transition-transform" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-amber-900">
              {contentType === 'numbers' ? 'Spot:' : 'Letter:'}
            </span>
            <span className="text-2xl sm:text-3xl font-black tabular-nums text-amber-950 font-['Fredoka','Noto_Sans_Arabic',sans-serif]">
              {activeDisplay}
            </span>
          </div>
          <span className="text-[11px] bg-white/80 text-amber-950 font-bold px-2 py-0.5 rounded-full hidden sm:inline-block">
            {langFlags[audioLanguage]}
          </span>
        </button>
      </div>

      {/* Right: Badges & Parent Controls */}
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenBadges}
          className="flex items-center gap-1.5 bg-white/95 border-2 sm:border-3 border-indigo-400 hover:bg-indigo-50 active:scale-95 transition-all shadow-md rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 text-indigo-900 cursor-pointer font-bold"
          title="View Badges & Rewards"
        >
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 fill-yellow-400" />
          <span className="text-xs sm:text-sm font-black tabular-nums">
            {unlockedBadgeCount}/{totalBadgeCount}
          </span>
        </button>

        <button
          onClick={onOpenParents}
          className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-white/95 border-2 sm:border-3 border-slate-300 hover:bg-slate-100 active:scale-95 transition-all shadow-md rounded-2xl text-slate-700 cursor-pointer"
          title="Parental Controls & Settings"
        >
          <Shield className="w-5 h-5 text-slate-700" />
        </button>
      </div>
    </header>
  );
};
