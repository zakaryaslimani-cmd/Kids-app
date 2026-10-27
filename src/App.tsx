/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { NumberSmashScene } from './game/threeScene';
import { audioService } from './services/audio';
import {
  storageService,
  GameDifficulty,
  GameTheme,
  ParentSettings,
  DailyUsage,
  GameStats,
  Badge,
} from './services/storage';
import {
  ContentType,
  AudioLanguage,
  AlphabetLanguage,
  SpotContentItem,
  ARABIC_ALPHABET,
  ARABIC_HARAKAT,
  FRENCH_ALPHABET,
  FRENCH_ACCENTS,
  ENGLISH_ALPHABET,
  getArabicNumberSpoken,
} from './services/learningData';
import { ScoreBoard } from './components/ScoreBoard';
import { ControlDock } from './components/ControlDock';
import { TitleScreen } from './components/TitleScreen';
import { BadgeModal } from './components/BadgeModal';
import { ParentalControlsModal } from './components/ParentalControlsModal';
import { BreakScreen } from './components/BreakScreen';

type ScreenState = 'title' | 'playing';

export default function App() {
  const [screenState, setScreenState] = useState<ScreenState>('title');
  const [theme, setTheme] = useState<GameTheme>('house');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('easy');
  const [contentType, setContentType] = useState<ContentType>('numbers');
  const [audioLanguage, setAudioLanguage] = useState<AudioLanguage>('en');
  const [alphabetLanguage, setAlphabetLanguage] = useState<AlphabetLanguage>('en');

  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [activeDisplay, setActiveDisplay] = useState<string>('1');
  const [activeSpoken, setActiveSpoken] = useState<string>('1');

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

  // Modals & Screens
  const [badgesModalOpen, setBadgesModalOpen] = useState<boolean>(false);
  const [parentsModalOpen, setParentsModalOpen] = useState<boolean>(false);
  const [isBreakTime, setIsBreakTime] = useState<boolean>(false);
  const [newBadgeToast, setNewBadgeToast] = useState<Badge | null>(null);

  // Persistent data
  const [badges, setBadges] = useState<Badge[]>(() => storageService.getBadges());
  const [settings, setSettings] = useState<ParentSettings>(() => storageService.getSettings());
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>(() => storageService.getDailyUsage());
  const [stats, setStats] = useState<GameStats>(() => storageService.getStats());

  const themesUsedRef = useRef<Set<string>>(new Set(['house']));
  const languagesUsedRef = useRef<Set<string>>(new Set(['en']));
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<NumberSmashScene | null>(null);

  // Synchronous refs to prevent race conditions & closures stale reads
  const difficultyRef = useRef<GameDifficulty>('easy');
  const contentTypeRef = useRef<ContentType>('numbers');
  const audioLanguageRef = useRef<AudioLanguage>('en');
  const alphabetLanguageRef = useRef<AlphabetLanguage>('en');
  const activeSpotRef = useRef<number>(-1);
  const activeItemRef = useRef<SpotContentItem>({ display: '1', spoken: '1' });
  const streakRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const spawnTimerRef = useRef<number | null>(null);

  // Keep refs in sync
  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);
  useEffect(() => {
    contentTypeRef.current = contentType;
  }, [contentType]);
  useEffect(() => {
    audioLanguageRef.current = audioLanguage;
    audioService.setLanguage(audioLanguage);
  }, [audioLanguage]);
  useEffect(() => {
    alphabetLanguageRef.current = alphabetLanguage;
  }, [alphabetLanguage]);
  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Generate curriculum item for a given spot
  const generateSpotItem = useCallback(
    (
      spotIndex: number,
      cType = contentTypeRef.current,
      aLang = audioLanguageRef.current,
      alphaLang = alphabetLanguageRef.current,
      diff = difficultyRef.current
    ): SpotContentItem => {
      if (cType === 'numbers') {
        let num: number;
        if (diff === 'easy') {
          num = spotIndex + 1; // 1 to 9
        } else if (diff === 'normal') {
          num = 10 + spotIndex * 9 + Math.floor(Math.random() * 8); // 10 to 99
        } else {
          num = 100 + spotIndex * 95 + Math.floor(Math.random() * 80); // 100 to 999
        }

        let spoken = String(num);
        if (aLang === 'ar') {
          spoken = getArabicNumberSpoken(num);
        }

        return {
          display: String(num),
          spoken,
        };
      } else {
        // Alphabets Mode
        if (alphaLang === 'ar') {
          if (diff === 'easy') {
            const item = ARABIC_ALPHABET[spotIndex % ARABIC_ALPHABET.length];
            return { display: item.char, spoken: item.name };
          } else if (diff === 'normal') {
            const idx = (spotIndex * 3 + Math.floor(Math.random() * 3)) % ARABIC_ALPHABET.length;
            const item = ARABIC_ALPHABET[idx];
            return { display: item.char, spoken: item.name };
          } else {
            const item = ARABIC_HARAKAT[spotIndex % ARABIC_HARAKAT.length];
            return { display: item.char, spoken: item.name };
          }
        } else if (alphaLang === 'fr') {
          if (diff === 'easy') {
            const item = FRENCH_ALPHABET[spotIndex % 9];
            return { display: item.char, spoken: item.name };
          } else if (diff === 'normal') {
            const idx = (spotIndex * 2 + Math.floor(Math.random() * 2)) % FRENCH_ALPHABET.length;
            const item = FRENCH_ALPHABET[idx];
            return { display: item.char, spoken: item.name };
          } else {
            const item = FRENCH_ACCENTS[spotIndex % FRENCH_ACCENTS.length];
            return { display: item.char, spoken: item.name };
          }
        } else {
          // English Alphabets
          if (diff === 'easy') {
            const char = ENGLISH_ALPHABET[spotIndex % 9];
            return { display: char, spoken: char };
          } else if (diff === 'normal') {
            const idx = (spotIndex * 2 + Math.floor(Math.random() * 2)) % ENGLISH_ALPHABET.length;
            const char = ENGLISH_ALPHABET[idx];
            return { display: char, spoken: char };
          } else {
            const pairs = ['Aa', 'Bb', 'Cc', 'Dd', 'Ee', 'Ff', 'Gg', 'Hh', 'Ii'];
            const char = ENGLISH_ALPHABET[spotIndex % 9];
            return { display: pairs[spotIndex % pairs.length], spoken: char };
          }
        }
      }
    },
    []
  );

  // Refresh all 9 spots on scene
  const refreshAllSpots = useCallback(
    (
      cType = contentTypeRef.current,
      aLang = audioLanguageRef.current,
      alphaLang = alphabetLanguageRef.current,
      diff = difficultyRef.current
    ) => {
      if (!sceneRef.current) return;
      for (let i = 0; i < 9; i++) {
        const item = generateSpotItem(i, cType, aLang, alphaLang, diff);
        sceneRef.current.updateSpotContent(i, item.display, item.spoken);
      }
    },
    [generateSpotItem]
  );

  // Spawn next random active spot
  const spawnNextSpot = useCallback(
    (
      cType = contentTypeRef.current,
      aLang = audioLanguageRef.current,
      alphaLang = alphabetLanguageRef.current,
      diff = difficultyRef.current
    ) => {
      if (!sceneRef.current) return;

      if (spawnTimerRef.current) {
        clearTimeout(spawnTimerRef.current);
        spawnTimerRef.current = null;
      }

      let nextSpot = Math.floor(Math.random() * 9);
      if (nextSpot === activeSpotRef.current) {
        nextSpot = (nextSpot + 1) % 9;
      }
      activeSpotRef.current = nextSpot;

      const item = generateSpotItem(nextSpot, cType, aLang, alphaLang, diff);
      activeItemRef.current = item;
      setActiveDisplay(item.display);
      setActiveSpoken(item.spoken);

      sceneRef.current.openSpot(nextSpot, item);
      audioService.speakText(item.spoken, aLang);
    },
    [generateSpotItem]
  );

  // Handler for successful smash
  const handleSpotSmash = useCallback(
    (spotIndex: number, display: string, spoken: string) => {
      audioService.playSmashPop();
      audioService.playCheerAndClap();

      const newScore = scoreRef.current + 1;
      const newStreak = streakRef.current + 1;
      scoreRef.current = newScore;
      streakRef.current = newStreak;
      setScore(newScore);
      setStreak(newStreak);

      // Record daily usage & stats
      const currentUsage = storageService.getDailyUsage();
      currentUsage.smashesToday += 1;
      storageService.saveDailyUsage(currentUsage);
      setDailyUsage({ ...currentUsage });

      const currentStats = storageService.getStats();
      currentStats.totalSmashes += 1;
      if (newStreak > currentStats.highestStreak) {
        currentStats.highestStreak = newStreak;
      }
      if (contentTypeRef.current === 'numbers') {
        currentStats.numbersPracticed[display] = (currentStats.numbersPracticed[display] || 0) + 1;
      } else {
        currentStats.lettersPracticed[display] = (currentStats.lettersPracticed[display] || 0) + 1;
      }
      storageService.saveStats(currentStats);
      setStats({ ...currentStats });

      // Check badges
      const newlyUnlocked = storageService.checkBadges(
        currentStats,
        newStreak,
        themesUsedRef.current,
        languagesUsedRef.current,
        contentTypeRef.current === 'alphabets'
      );
      if (newlyUnlocked.length > 0) {
        const latest = newlyUnlocked[0];
        setNewBadgeToast(latest);
        setBadges(storageService.getBadges());
        setTimeout(() => {
          setNewBadgeToast(null);
        }, 4000);
      }

      // Schedule next spot
      if (spawnTimerRef.current) {
        clearTimeout(spawnTimerRef.current);
      }
      spawnTimerRef.current = window.setTimeout(() => {
        spawnNextSpot();
      }, 850);
    },
    [spawnNextSpot]
  );

  // Handler when kid taps inactive spot
  const handleSpotTap = useCallback((spotIndex: number, display: string, spoken: string) => {
    audioService.playClick();
    audioService.speakText(spoken, audioLanguageRef.current);
  }, []);

  // Initialize Three.js scene once
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const scene = new NumberSmashScene(
      canvasMountRef.current,
      {
        onSpotSmash: handleSpotSmash,
        onSpotTap: handleSpotTap,
      },
      theme,
      difficulty
    );
    sceneRef.current = scene;

    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
      scene.dispose();
      sceneRef.current = null;
    };
  }, [handleSpotSmash, handleSpotTap]);

  // Screen time tracking
  useEffect(() => {
    const timer = setInterval(() => {
      if (screenState === 'playing' && !isBreakTime) {
        const usage = storageService.recordActiveSeconds(1);
        setDailyUsage({ ...usage });

        if (settings.dailyLimitMinutes > 0) {
          const minutesPlayed = usage.activeSeconds / 60;
          if (minutesPlayed >= settings.dailyLimitMinutes) {
            setIsBreakTime(true);
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [screenState, isBreakTime, settings.dailyLimitMinutes]);

  // Keyboard 1-9
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screenState !== 'playing' || isBreakTime) return;
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= 9) {
        e.preventDefault();
        sceneRef.current?.tapSpotDirectly(keyNum - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screenState, isBreakTime]);

  // Theme switch
  const handleThemeChange = (newTheme: GameTheme) => {
    setTheme(newTheme);
    themesUsedRef.current.add(newTheme);
    if (spawnTimerRef.current) {
      clearTimeout(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }
    sceneRef.current?.setTheme(newTheme);
    audioService.playClick();
    refreshAllSpots();
    spawnNextSpot();
  };

  // Difficulty switch
  const handleDifficultyChange = (newDiff: GameDifficulty) => {
    difficultyRef.current = newDiff;
    setDifficulty(newDiff);
    audioService.playClick();
    refreshAllSpots(contentTypeRef.current, audioLanguageRef.current, alphabetLanguageRef.current, newDiff);
    spawnNextSpot(contentTypeRef.current, audioLanguageRef.current, alphabetLanguageRef.current, newDiff);
  };

  // Content type switch (Numbers vs Alphabets)
  const handleContentTypeChange = (newType: ContentType) => {
    contentTypeRef.current = newType;
    setContentType(newType);
    audioService.playClick();
    refreshAllSpots(newType, audioLanguageRef.current, alphabetLanguageRef.current, difficultyRef.current);
    spawnNextSpot(newType, audioLanguageRef.current, alphabetLanguageRef.current, difficultyRef.current);
  };

  // Audio language switch (EN, FR, AR)
  const handleAudioLanguageChange = (newLang: AudioLanguage) => {
    audioLanguageRef.current = newLang;
    setAudioLanguage(newLang);
    languagesUsedRef.current.add(newLang);
    audioService.setLanguage(newLang);
    audioService.playClick();
    // Re-pronounce active item in the new language!
    const updatedItem = generateSpotItem(activeSpotRef.current >= 0 ? activeSpotRef.current : 0);
    setActiveSpoken(updatedItem.spoken);
    audioService.speakText(updatedItem.spoken, newLang);
  };

  // Alphabet language switch (EN, FR, AR)
  const handleAlphabetLanguageChange = (newAlphaLang: AlphabetLanguage) => {
    alphabetLanguageRef.current = newAlphaLang;
    setAlphabetLanguage(newAlphaLang);
    audioService.playClick();
    refreshAllSpots(contentTypeRef.current, audioLanguageRef.current, newAlphaLang, difficultyRef.current);
    spawnNextSpot(contentTypeRef.current, audioLanguageRef.current, newAlphaLang, difficultyRef.current);
  };

  const handleStartGame = () => {
    setScreenState('playing');
    audioService.playClick();
    setTimeout(() => {
      refreshAllSpots();
      spawnNextSpot();
    }, 250);
  };

  const handleRepeat = () => {
    audioService.speakText(activeItemRef.current.spoken, audioLanguageRef.current);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioService.setSoundEnabled(next);
    if (next) audioService.playClick();
  };

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    audioService.setVoiceEnabled(next);
    if (next) audioService.speakText(activeItemRef.current.spoken, audioLanguageRef.current);
  };

  const handleSaveSettings = (newSettings: ParentSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
    if (newSettings.audioLanguage !== audioLanguage) {
      handleAudioLanguageChange(newSettings.audioLanguage);
    }
  };

  const handleResetProgress = () => {
    storageService.resetAllProgress();
    setScore(0);
    setStreak(0);
    setBadges(storageService.getBadges());
    setDailyUsage(storageService.getDailyUsage());
    setStats(storageService.getStats());
  };

  const handleUnlockMoreTime = () => {
    const newSettings = {
      ...settings,
      dailyLimitMinutes: (settings.dailyLimitMinutes || 15) + 10,
    };
    handleSaveSettings(newSettings);
    setIsBreakTime(false);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 select-none">
      {/* 3D WebGL Canvas */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 z-0 touch-none w-full h-full cursor-pointer"
      />

      {/* Title Screen Overlay */}
      {screenState === 'title' && (
        <TitleScreen
          onStartGame={handleStartGame}
          selectedTheme={theme}
          selectedDifficulty={difficulty}
          contentType={contentType}
          audioLanguage={audioLanguage}
          alphabetLanguage={alphabetLanguage}
          onThemeSelect={handleThemeChange}
          onDifficultySelect={handleDifficultyChange}
          onContentTypeSelect={handleContentTypeChange}
          onAudioLanguageSelect={handleAudioLanguageChange}
          onAlphabetLanguageSelect={handleAlphabetLanguageChange}
          onOpenParents={() => setParentsModalOpen(true)}
          onOpenBadges={() => setBadgesModalOpen(true)}
        />
      )}

      {/* In-Game Active UI */}
      {screenState === 'playing' && (
        <>
          <ScoreBoard
            score={score}
            streak={streak}
            activeDisplay={activeDisplay}
            contentType={contentType}
            audioLanguage={audioLanguage}
            alphabetLanguage={alphabetLanguage}
            difficulty={difficulty}
            theme={theme}
            onRepeat={handleRepeat}
            onOpenBadges={() => setBadgesModalOpen(true)}
            onOpenParents={() => setParentsModalOpen(true)}
            unlockedBadgeCount={badges.filter((b) => b.unlockedAt).length}
            totalBadgeCount={badges.length}
          />

          {newBadgeToast && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 animate-bounce pointer-events-none">
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-300 border-3 border-amber-600 rounded-2xl px-5 py-2.5 shadow-2xl">
                <span className="text-3xl">{newBadgeToast.icon}</span>
                <div>
                  <div className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
                    Badge Unlocked! 🎉
                  </div>
                  <div className="text-sm font-black text-amber-950">
                    {newBadgeToast.name}
                  </div>
                </div>
              </div>
            </div>
          )}

          <ControlDock
            currentTheme={theme}
            currentDifficulty={difficulty}
            contentType={contentType}
            audioLanguage={audioLanguage}
            alphabetLanguage={alphabetLanguage}
            soundEnabled={soundEnabled}
            voiceEnabled={voiceEnabled}
            onThemeChange={handleThemeChange}
            onDifficultyChange={handleDifficultyChange}
            onContentTypeChange={handleContentTypeChange}
            onAudioLanguageChange={handleAudioLanguageChange}
            onAlphabetLanguageChange={handleAlphabetLanguageChange}
            onToggleSound={handleToggleSound}
            onToggleVoice={handleToggleVoice}
          />
        </>
      )}

      {/* Screen Break Modal */}
      {isBreakTime && <BreakScreen onUnlockMoreTime={handleUnlockMoreTime} />}

      {/* Badges Shelf Modal */}
      <BadgeModal
        isOpen={badgesModalOpen}
        onClose={() => setBadgesModalOpen(false)}
        badges={badges}
      />

      {/* Parental Controls Modal */}
      <ParentalControlsModal
        isOpen={parentsModalOpen}
        onClose={() => setParentsModalOpen(false)}
        settings={settings}
        dailyUsage={dailyUsage}
        stats={stats}
        onSaveSettings={handleSaveSettings}
        onResetProgress={handleResetProgress}
      />
    </div>
  );
}
