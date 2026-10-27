import React from 'react';
import { X, Trophy, CheckCircle, Lock } from 'lucide-react';
import { Badge } from '../services/storage';
import { audioService } from '../services/audio';

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: Badge[];
}

export const BadgeModal: React.FC<BadgeModalProps> = ({ isOpen, onClose, badges }) => {
  if (!isOpen) return null;

  const unlockedCount = badges.filter((b) => b.unlockedAt).length;

  const handleBadgeClick = (badge: Badge) => {
    if (badge.unlockedAt) {
      audioService.playBadgeFanfare();
      audioService.speakNumber(`${badge.name}! Fantastic job!`);
    } else {
      audioService.playClick();
      audioService.speakNumber(badge.description);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-none select-none">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border-4 border-amber-400 shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Trophy className="w-6 h-6 fill-amber-500" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                Reward Badges
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                You collected {unlockedCount} of {badges.length} badges!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Badges Grid */}
        <div className="overflow-y-auto flex-1 pr-1 grid grid-cols-2 gap-3 pb-2">
          {badges.map((b) => {
            const isUnlocked = !!b.unlockedAt;
            return (
              <button
                key={b.id}
                onClick={() => handleBadgeClick(b)}
                className={`flex flex-col items-center text-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-amber-50 to-orange-50 border-amber-300 shadow-md hover:scale-102 hover:border-amber-400'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                {isUnlocked && (
                  <span className="absolute top-2 right-2 text-emerald-600">
                    <CheckCircle className="w-4 h-4 fill-emerald-100" />
                  </span>
                )}
                {!isUnlocked && (
                  <span className="absolute top-2 right-2 text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                )}

                <div className="text-4xl my-1">{b.icon}</div>
                <div className="text-sm font-black text-slate-800 mt-1">
                  {b.name}
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-0.5 leading-snug">
                  {b.description}
                </div>

                {isUnlocked && (
                  <div className="mt-2 text-[10px] font-bold text-amber-700 bg-amber-200/70 px-2 py-0.5 rounded-full">
                    Unlocked! 🎉
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-3 pt-3 border-t border-slate-100 text-center">
          <p className="text-xs font-bold text-indigo-600">
            Keep smashing spots to unlock more shiny badges! ⭐
          </p>
        </div>
      </div>
    </div>
  );
};
