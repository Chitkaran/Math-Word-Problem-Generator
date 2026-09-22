import React, { useState, useEffect } from 'react';
import { Users, Sparkles, Lightbulb, Heart } from 'lucide-react';

export const TopTicker: React.FC = () => {
  // Start with values matching screenshot (482 teachers, 12,486 problems)
  const [teachersCount, setTeachersCount] = useState(482);
  const [problemsCount, setProblemsCount] = useState(12486);

  // Periodic random fluctuations for the ticker as requested
  useEffect(() => {
    // Small realistic fluctuation for online teachers every 4-8 seconds
    const teachersInterval = setInterval(() => {
      setTeachersCount(prev => {
        const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
        const next = prev + delta;
        return Math.max(460, Math.min(520, next));
      });
    }, 5000);

    // Increment problems generated count periodically
    const problemsInterval = setInterval(() => {
      setProblemsCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 7000);

    return () => {
      clearInterval(teachersInterval);
      clearInterval(problemsInterval);
    };
  }, []);

  return (
    <div className="w-full bg-slate-50/90 border-b border-slate-200/80 px-4 py-2.5 text-xs text-slate-600 no-print">
      <div className="container mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
        {/* Left Stats Section */}
        <div className="flex items-center flex-wrap gap-3 sm:gap-4">
          {/* Pulsing Green Dot + Teachers Online */}
          <div className="flex items-center gap-2 font-medium text-slate-800">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <Users className="h-4 w-4 text-indigo-600" />
            <span className="font-bold text-slate-900 tracking-tight">
              {teachersCount.toLocaleString()}
            </span>
            <span className="text-slate-700 font-semibold">teachers online</span>
          </div>

          <span className="text-slate-300 font-light hidden sm:inline">|</span>

          {/* Sparkle + Problems Generated Today + Sun Rays */}
          <div className="flex items-center gap-1.5 font-medium text-slate-800">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span className="font-bold text-slate-900 tracking-tight">
              {problemsCount.toLocaleString()}
            </span>
            <span className="text-slate-700 font-semibold">
              word problems generated today
            </span>
            {/* Cute mini sunburst rays */}
            <span className="text-amber-500 font-black text-xs tracking-tighter select-none ml-0.5">
              \ | /
            </span>
          </div>
        </div>

        {/* Right Tagline & Heart Section */}
        <div className="hidden md:flex items-center gap-4 text-slate-600">
          <div className="flex items-center gap-1.5 font-medium">
            <div className="p-0.5 text-slate-700">
              <Lightbulb className="h-4 w-4 text-amber-500" />
            </div>
            <span className="font-semibold text-slate-800 tracking-tight">
              Better questions. Brighter minds.
            </span>
          </div>

          <Heart className="h-4 w-4 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer" />
        </div>
      </div>
    </div>
  );
};
