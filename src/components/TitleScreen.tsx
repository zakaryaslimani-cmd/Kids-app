import React, { useEffect } from 'react';
import { Play, Sparkles, Trophy, Shield, Volume2 } from 'lucide-react';
import { GameDifficulty, GameTheme } from '../services/storage';
import { ContentType, AudioLanguage, AlphabetLanguage } from '../services/learningData';
import { audioService } from '../services/audio';

interface TitleScreenProps {
  onStartGame: () => void;
  selectedTheme: GameTheme;
  selectedDifficulty: GameDifficulty;
  contentType: ContentType;
  audioLanguage: AudioLanguage;
  alphabetLanguage: AlphabetLanguage;
  onThemeSelect: (theme: GameTheme) => void;
  onDifficultySelect: (diff: GameDifficulty) => void;
  onContentTypeSelect: (type: ContentType) => void;
  onAudioLanguageSelect: (lang: AudioLanguage) => void;
  onAlphabetLanguageSelect: (lang: AlphabetLanguage) => void;
  onOpenParents: () => void;
  onOpenBadges: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  selectedTheme,
  selectedDifficulty,
  contentType,
  audioLanguage,
  alphabetLanguage,
  onThemeSelect,
  onDifficultySelect,
  onContentTypeSelect,
  onAudioLanguageSelect,
  onAlphabetLanguageSelect,
  onOpenParents,
  onOpenBadges,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  const themes: Array<{ id: GameTheme; name: string; icon: string }> = [
    { id: 'house', name: 'Window Cottage', icon: '🏠' },
    { id: 'burrow', name: 'Meadow Burrow', icon: '🥕' },
    { id: 'tree', name: 'Fruit Garden', icon: '🍎' },
    { id: 'ocean', name: 'Coral Cove', icon: '🐢' },
  ];

  const audioLanguages: Array<{ id: AudioLanguage; label: string; flag: string }> = [
    { id: 'en', label: 'English', flag: '🇬🇧' },
    { id: 'fr', label: 'Français', flag: '🇫🇷' },
    { id: 'ar', label: 'العربية', flag: '🇸🇦' },
  ];

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-between items-center bg-gradient-to-b from-sky-400 via-indigo-400 to-purple-500 text-slate-800 p-4 sm:p-6 select-none overflow-y-auto">
      {/* Top Bar with Badges and Parent Control */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10">
        <button
          onClick={onOpenBadges}
          className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/95 hover:bg-white text-indigo-900 font-bold rounded-2xl shadow-md border-2 border-indigo-200 transition-all cursor-pointer"
        >
          <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" />
          <span className="text-xs sm:text-sm">Rewards</span>
        </button>

        <button
          onClick={onOpenParents}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/95 hover:bg-white text-slate-700 font-bold rounded-2xl shadow-md border-2 border-slate-200 transition-all cursor-pointer"
        >
          <Shield className="w-4 h-4 text-slate-600" />
          <span className="text-xs sm:text-sm">Parent Hub</span>
        </button>
      </div>

      {/* Centerpiece: Title Lockup & Config Options */}
      <div className="flex flex-col items-center text-center my-auto z-10 max-w-xl w-full py-2">
        <div className="relative mb-2">
          {/* Animated cute floating characters */}
          <div className="flex justify-center items-center gap-4 sm:gap-6 mb-2">
            <span className="text-3xl sm:text-4xl animate-bounce" style={{ animationDelay: '0ms' }}>
              🏠
            </span>
            <span className="text-3xl sm:text-4xl animate-bounce" style={{ animationDelay: '150ms' }}>
              🥕
            </span>
            <span className="text-3xl sm:text-4xl animate-bounce" style={{ animationDelay: '300ms' }}>
              🍎
            </span>
            <span className="text-3xl sm:text-4xl animate-bounce" style={{ animationDelay: '450ms' }}>
              🐢
            </span>
          </div>

          {/* Bespoke inline SVG Title Lockup */}
          <svg
            className="w-[280px] sm:w-[420px] md:w-[480px] h-auto drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]"
            viewBox="0 0 520 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <text
              x="50%"
              y="54"
              textAnchor="middle"
              fill="#FFD166"
              stroke="#2B2D42"
              strokeWidth="9"
              paintOrder="stroke fill"
              fontSize="50"
              fontWeight="900"
              fontFamily="Fredoka, Quicksand, sans-serif"
            >
              POP &amp; LEARN 3D
            </text>
            <text
              x="50%"
              y="104"
              textAnchor="middle"
              fill="#06D6A0"
              stroke="#2B2D42"
              strokeWidth="8"
              paintOrder="stroke fill"
              fontSize="38"
              fontWeight="900"
              fontFamily="Fredoka, Quicksand, sans-serif"
            >
              NUMBERS &amp; ALPHABETS
            </text>
          </svg>
        </div>

        {/* Big Juicy Start Button */}
        <button
          onClick={onStartGame}
          className="group relative flex items-center justify-center gap-3 px-8 sm:px-12 py-3.5 sm:py-4 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 hover:from-emerald-300 hover:to-green-400 active:scale-95 text-slate-900 font-black text-xl sm:text-2xl rounded-3xl border-4 border-emerald-700 shadow-[0_12px_24px_rgba(5,150,105,0.4)] transition-all cursor-pointer my-3"
        >
          <Play className="w-7 h-7 fill-slate-900 group-hover:scale-110 transition-transform" />
          <span>START PLAYING!</span>
          <Sparkles className="w-6 h-6 text-yellow-300 fill-yellow-300 animate-spin" />
        </button>

        {/* Quick Setup Card */}
        <div className="bg-white/95 border-2 border-white/80 rounded-3xl p-3.5 shadow-xl w-full max-w-md space-y-3 text-left">
          {/* 1. What to Learn: Numbers or Alphabets */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-1">
              1. Learning Focus:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onContentTypeSelect('numbers');
                  audioService.playClick();
                }}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                  contentType === 'numbers'
                    ? 'bg-amber-400 border-amber-600 text-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-base">🔢</span>
                <span>Numbers (1 - 999)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onContentTypeSelect('alphabets');
                  audioService.playClick();
                }}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                  contentType === 'alphabets'
                    ? 'bg-indigo-600 border-indigo-800 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-base">🔤</span>
                <span>Alphabets (A - Z)</span>
              </button>
            </div>
          </div>

          {/* 2. Audio Voice Language */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-1">
              2. Audio Voice:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {audioLanguages.map((l) => {
                const active = audioLanguage === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      onAudioLanguageSelect(l.id);
                      audioService.playClick();
                    }}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                      active
                        ? 'bg-blue-600 border-blue-800 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Alphabet Language (if alphabets selected) */}
          {contentType === 'alphabets' && (
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-indigo-700 block mb-1">
                3. Alphabet Language:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'en' as AlphabetLanguage, label: 'English', sample: 'A B C' },
                  { id: 'fr' as AlphabetLanguage, label: 'Français', sample: 'A B C' },
                  { id: 'ar' as AlphabetLanguage, label: 'العربية', sample: 'أ ب ت' },
                ].map((al) => {
                  const active = alphabetLanguage === al.id;
                  return (
                    <button
                      key={al.id}
                      type="button"
                      onClick={() => {
                        onAlphabetLanguageSelect(al.id);
                        audioService.playClick();
                      }}
                      className={`flex flex-col items-center py-1.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                        active
                          ? 'bg-indigo-700 border-indigo-900 text-white shadow-sm'
                          : 'bg-indigo-50/50 border-indigo-200 text-indigo-900 hover:bg-indigo-100'
                      }`}
                    >
                      <span>{al.label}</span>
                      <span className="text-[10px] opacity-80">{al.sample}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Theme Selection */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-1">
              4. World:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {themes.map((t) => {
                const active = selectedTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onThemeSelect(t.id);
                      audioService.playClick();
                    }}
                    className={`flex flex-col items-center p-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                      active
                        ? 'bg-amber-300 border-amber-500 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xl">{t.icon}</span>
                    <span className="text-[9px] font-bold text-slate-800 line-clamp-1">
                      {t.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Control Hint Line */}
      <div className="z-10 text-center py-1">
        <p className="text-xs sm:text-sm font-bold text-white/90 drop-shadow">
          Tap character to Smash · 1-9 Keys to Pop · Space / Enter to Start
        </p>
      </div>
    </div>
  );
};
