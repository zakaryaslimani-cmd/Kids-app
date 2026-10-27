import React, { useState } from 'react';
import { Moon, Sparkles, Shield, Heart } from 'lucide-react';
import { audioService } from '../services/audio';

interface BreakScreenProps {
  onUnlockMoreTime: () => void;
}

export const BreakScreen: React.FC<BreakScreenProps> = ({ onUnlockMoreTime }) => {
  const [showGate, setShowGate] = useState(false);
  const [answer, setAnswer] = useState('');
  const [numA] = useState(() => Math.floor(Math.random() * 5) + 4);
  const [numB] = useState(() => Math.floor(Math.random() * 4) + 3);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(answer.trim(), 10) === numA + numB) {
      audioService.playClick();
      onUnlockMoreTime();
    } else {
      audioService.playClick();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 text-white select-none">
      <div className="max-w-md w-full text-center p-6 sm:p-8 bg-indigo-900/60 border-2 border-indigo-400/40 rounded-3xl shadow-2xl flex flex-col items-center">
        {/* Cute Sleeping Icon */}
        <div className="w-24 h-24 rounded-full bg-amber-400/20 border-2 border-amber-300/40 flex items-center justify-center text-5xl mb-4 animate-bounce">
          😴
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-amber-300 mb-2">
          Time for a Screen Break!
        </h2>
        <p className="text-sm text-indigo-200 mb-6 leading-relaxed">
          You did amazing today! Look away from the screen, stretch your arms, and rest your eyes. 🌟
        </p>

        <div className="flex items-center gap-2 bg-indigo-950/80 px-4 py-2.5 rounded-2xl border border-indigo-700/50 mb-6 text-xs text-indigo-300">
          <Moon className="w-4 h-4 text-amber-300" />
          <span>Daily screen time limit reached</span>
        </div>

        {!showGate ? (
          <button
            onClick={() => setShowGate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-700/60 hover:bg-indigo-700 active:scale-95 text-indigo-200 text-xs font-bold rounded-xl border border-indigo-500/40 transition-all cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            <span>Parent: Grant 10 More Minutes</span>
          </button>
        ) : (
          <form onSubmit={handleVerify} className="w-full flex flex-col items-center">
            <p className="text-xs text-amber-200 mb-2 font-bold">
              Parent check: What is {numA} + {numB}?
            </p>
            <div className="flex gap-2 w-full max-w-xs">
              <input
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="?"
                className="w-20 px-3 py-2 bg-indigo-950 border border-indigo-500 rounded-xl text-center text-white font-bold"
                autoFocus
              />
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded-xl cursor-pointer"
              >
                +10 Min
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
