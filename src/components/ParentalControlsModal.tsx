import React, { useState } from 'react';
import { X, Shield, Clock, BarChart3, RotateCcw, Volume2, Check, Globe } from 'lucide-react';
import { DailyUsage, GameStats, ParentSettings } from '../services/storage';
import { audioService } from '../services/audio';
import { AudioLanguage, ContentType, AlphabetLanguage } from '../services/learningData';

interface ParentalControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ParentSettings;
  dailyUsage: DailyUsage;
  stats: GameStats;
  onSaveSettings: (newSettings: ParentSettings) => void;
  onResetProgress: () => void;
}

export const ParentalControlsModal: React.FC<ParentalControlsModalProps> = ({
  isOpen,
  onClose,
  settings,
  dailyUsage,
  stats,
  onSaveSettings,
  onResetProgress,
}) => {
  const [numA] = useState(() => Math.floor(Math.random() * 5) + 3);
  const [numB] = useState(() => Math.floor(Math.random() * 4) + 2);
  const [gateInput, setGateInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [localSettings, setLocalSettings] = useState<ParentSettings>(settings);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleVerifyGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(gateInput.trim(), 10) === numA + numB) {
      setIsUnlocked(true);
      setErrorMsg('');
      audioService.playClick();
    } else {
      setErrorMsg('Incorrect answer. Please try again.');
      audioService.playClick();
    }
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    audioService.setSpeechRate(localSettings.speechRate);
    audioService.setLanguage(localSettings.audioLanguage);
    audioService.playClick();
    onClose();
  };

  const minutesToday = Math.floor(dailyUsage.activeSeconds / 60);

  const testPronunciation = () => {
    audioService.setSpeechRate(localSettings.speechRate);
    audioService.setLanguage(localSettings.audioLanguage);
    if (localSettings.audioLanguage === 'ar') {
      audioService.speakText('رائع! حرف الباء! أحسنت يا بطل!');
    } else if (localSettings.audioLanguage === 'fr') {
      audioService.speakText('Bravo ! Lettre B ! Super travail !');
    } else {
      audioService.speakText('Awesome! Number five! Great job!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 select-none">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border-4 border-slate-300 shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                Parental Controls
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                Language, screen time & milestones
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

        {/* Parent Gate Lock */}
        {!isUnlocked ? (
          <form onSubmit={handleVerifyGate} className="py-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-2xl mb-3">
              🔒
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Parents Only
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mb-4">
              Please answer the question below to access language settings and limits:
            </p>

            <div className="text-2xl font-black text-indigo-700 bg-indigo-50 border-2 border-indigo-200 rounded-2xl px-6 py-2.5 mb-3">
              {numA} + {numB} = ?
            </div>

            <div className="flex items-center gap-2 w-full max-w-xs">
              <input
                type="number"
                value={gateInput}
                onChange={(e) => setGateInput(e.target.value)}
                placeholder="Answer"
                className="flex-1 px-4 py-2.5 border-2 border-slate-300 rounded-xl text-center font-bold text-lg focus:border-indigo-500 outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl shadow cursor-pointer"
              >
                Enter
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-500 mt-2">{errorMsg}</p>
            )}
          </form>
        ) : (
          /* Unlocked Controls */
          <div className="overflow-y-auto flex-1 pr-1 space-y-4">
            {/* Audio Voice Language */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>Speech Audio Language</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'en' as AudioLanguage, label: 'English', flag: '🇬🇧' },
                  { id: 'fr' as AudioLanguage, label: 'Français', flag: '🇫🇷' },
                  { id: 'ar' as AudioLanguage, label: 'العربية', flag: '🇸🇦' },
                ].map((l) => {
                  const active = localSettings.audioLanguage === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() =>
                        setLocalSettings({ ...localSettings, audioLanguage: l.id })
                      }
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        active
                          ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Daily Usage Monitor */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Daily Usage Limit</span>
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {minutesToday} min played today
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 5, label: '5 min' },
                  { value: 10, label: '10 min' },
                  { value: 15, label: '15 min' },
                  { value: 20, label: '20 min' },
                  { value: 30, label: '30 min' },
                  { value: 0, label: 'Unlimited' },
                ].map((opt) => {
                  const active = localSettings.dailyLimitMinutes === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setLocalSettings({ ...localSettings, dailyLimitMinutes: opt.value })
                      }
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        active
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pronunciation & Audio Speed */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                  <span>Speech Rate</span>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                  {localSettings.speechRate}x
                </span>
              </div>

              <input
                type="range"
                min="0.6"
                max="1.2"
                step="0.05"
                value={localSettings.speechRate}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    speechRate: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-indigo-600 cursor-pointer mb-2"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Slower</span>
                <button
                  type="button"
                  onClick={testPronunciation}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Test Voice
                </button>
                <span className="text-[11px] text-slate-500">Normal</span>
              </div>
            </div>

            {/* Learning Milestones & Stats */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm mb-3">
                <BarChart3 className="w-4 h-4 text-amber-600" />
                <span>Learning Milestones</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">
                    Total Smashes
                  </div>
                  <div className="text-xl font-black text-slate-800 tabular-nums">
                    {stats.totalSmashes}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">
                    Today&apos;s Smashes
                  </div>
                  <div className="text-xl font-black text-emerald-600 tabular-nums">
                    {dailyUsage.smashesToday}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">
                    Highest Streak
                  </div>
                  <div className="text-xl font-black text-amber-600 tabular-nums">
                    {stats.highestStreak}x
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">
                    Sessions
                  </div>
                  <div className="text-xl font-black text-indigo-600 tabular-nums">
                    {stats.sessionsCount}
                  </div>
                </div>
              </div>
            </div>

            {/* Reset Progress */}
            <div>
              {!showConfirmReset ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(true)}
                  className="w-full py-2 px-3 border border-rose-300 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Learning Progress & Badges
                </button>
              ) : (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-center space-y-2">
                  <p className="text-xs font-bold text-rose-800">
                    Are you sure? This will reset all badges and records.
                  </p>
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowConfirmReset(false)}
                      className="px-3 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onResetProgress();
                        setShowConfirmReset(false);
                        onClose();
                      }}
                      className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer"
                    >
                      Yes, Reset
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Save & Return to Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
