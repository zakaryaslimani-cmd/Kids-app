import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Sparkles,
  Globe,
  BookOpen,
} from 'lucide-react';
import { GameDifficulty, GameTheme } from '../services/storage';
import { ContentType, AudioLanguage, AlphabetLanguage } from '../services/learningData';

interface ControlDockProps {
  currentTheme: GameTheme;
  currentDifficulty: GameDifficulty;
  contentType: ContentType;
  audioLanguage: AudioLanguage;
  alphabetLanguage: AlphabetLanguage;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  onThemeChange: (theme: GameTheme) => void;
  onDifficultyChange: (diff: GameDifficulty) => void;
  onContentTypeChange: (type: ContentType) => void;
  onAudioLanguageChange: (lang: AudioLanguage) => void;
  onAlphabetLanguageChange: (lang: AlphabetLanguage) => void;
  onToggleSound: () => void;
  onToggleVoice: () => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  currentTheme,
  currentDifficulty,
  contentType,
  audioLanguage,
  alphabetLanguage,
  soundEnabled,
  voiceEnabled,
  onThemeChange,
  onDifficultyChange,
  onContentTypeChange,
  onAudioLanguageChange,
  onAlphabetLanguageChange,
  onToggleSound,
  onToggleVoice,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const themes: Array<{ id: GameTheme; label: string; icon: string; charName: string }> = [
    { id: 'house', label: 'Window Cottage', icon: '🏠', charName: 'Boy' },
    { id: 'burrow', label: 'Meadow Burrow', icon: '🥕', charName: 'Bunny' },
    { id: 'tree', label: 'Fruit Garden', icon: '🍎', charName: 'Fruit' },
    { id: 'ocean', label: 'Coral Cove', icon: '🐢', charName: 'Turtle' },
  ];

  const difficulties: Array<{ id: GameDifficulty; label: string; color: string }> = [
    { id: 'easy', label: 'Easy', color: 'bg-emerald-500 text-white border-emerald-600' },
    { id: 'normal', label: 'Normal', color: 'bg-amber-500 text-white border-amber-600' },
    { id: 'hard', label: 'Hard', color: 'bg-rose-500 text-white border-rose-600' },
  ];

  const audioLanguages: Array<{ id: AudioLanguage; label: string; flag: string }> = [
    { id: 'en', label: 'English', flag: '🇬🇧' },
    { id: 'fr', label: 'Français', flag: '🇫🇷' },
    { id: 'ar', label: 'العربية', flag: '🇸🇦' },
  ];

  const alphabetLanguages: Array<{ id: AlphabetLanguage; label: string; sample: string }> = [
    { id: 'en', label: 'English', sample: 'A-Z' },
    { id: 'fr', label: 'Français', sample: 'A-Z' },
    { id: 'ar', label: 'العربية', sample: 'أ-ي' },
  ];

  return (
    <div
      className={`fixed bottom-3 left-1/2 -translate-x-1/2 z-20 transition-transform duration-300 w-full max-w-[960px] px-3 pointer-events-none ${
        collapsed ? 'translate-y-[calc(100%-38px)]' : 'translate-y-0'
      }`}
    >
      {/* Collapse/Expand Toggle Tab */}
      <div className="flex justify-center mb-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-1 bg-white/95 border-2 border-slate-300 rounded-full shadow-md text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
        >
          {collapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Show Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Hide Controls</span>
            </>
          )}
        </button>
      </div>

      {/* Main Dock Container */}
      <div className="pointer-events-auto bg-white/95 border-2 sm:border-3 border-slate-300 shadow-xl rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2 select-none">
        {/* 1. Learning Content: Numbers vs Alphabets */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => onContentTypeChange('numbers')}
            className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              contentType === 'numbers'
                ? 'bg-amber-400 text-slate-900 shadow-sm border border-amber-500 scale-102'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🔢</span>
            <span>Numbers</span>
          </button>
          <button
            onClick={() => onContentTypeChange('alphabets')}
            className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              contentType === 'alphabets'
                ? 'bg-indigo-600 text-white shadow-sm border border-indigo-700 scale-102'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🔤</span>
            <span>Alphabets</span>
          </button>
        </div>

        {/* 2. Audio Language Selector (EN, FR, AR) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1 hidden md:inline">
            Voice:
          </span>
          {audioLanguages.map((l) => {
            const active = audioLanguage === l.id;
            return (
              <button
                key={l.id}
                onClick={() => onAudioLanguageChange(l.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm scale-102'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={`Speech Language: ${l.label}`}
              >
                <span>{l.flag}</span>
                <span className="hidden sm:inline">{l.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Alphabet Language (Only shown if Alphabets is active) */}
        {contentType === 'alphabets' && (
          <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 p-1 rounded-xl">
            <span className="text-[10px] font-bold text-indigo-700 px-1 hidden md:inline">
              Letters:
            </span>
            {alphabetLanguages.map((al) => {
              const active = alphabetLanguage === al.id;
              return (
                <button
                  key={al.id}
                  onClick={() => onAlphabetLanguageChange(al.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-indigo-700 text-white shadow-sm scale-102'
                      : 'text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  <span>{al.sample}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 4. Difficulty Mode */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {difficulties.map((d) => {
            const active = currentDifficulty === d.id;
            return (
              <button
                key={d.id}
                onClick={() => onDifficultyChange(d.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  active ? `${d.color} shadow-sm border scale-105` : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>

        {/* 5. World / Theme */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {themes.map((t) => {
            const active = currentTheme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onThemeChange(t.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-white text-indigo-950 shadow-sm border border-slate-200 scale-105'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={t.label}
              >
                <span className="text-base">{t.icon}</span>
              </button>
            );
          })}
        </div>

        {/* 6. Sound Toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleVoice}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
              voiceEnabled ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-slate-100 border-slate-300 text-slate-400'
            }`}
            title="Toggle Voice"
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onToggleSound}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
              soundEnabled ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-slate-100 border-slate-300 text-slate-400'
            }`}
            title="Toggle Sound Effects"
          >
            {soundEnabled ? <Sparkles className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
