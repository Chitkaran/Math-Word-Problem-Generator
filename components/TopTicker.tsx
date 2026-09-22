import React, { useState, useEffect } from 'react';
import { Users, Sparkles, Lightbulb, Heart, User, LogOut, ShieldCheck, Zap, Crown } from 'lucide-react';
import type { UserProfile } from '../types';
import type { User as FirebaseUser } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface TopTickerProps {
  user?: FirebaseUser | null;
  onOpenSignIn?: () => void;
  userProfile?: UserProfile | null;
  onOpenUserArea?: () => void;
  isAdmin?: boolean;
  onOpenAdminArchive?: () => void;
}

export const TopTicker: React.FC<TopTickerProps> = ({
  user,
  onOpenSignIn,
  userProfile,
  onOpenUserArea,
  isAdmin,
  onOpenAdminArchive
}) => {
  // Start with values matching screenshot (481 teachers, 12,493 problems)
  const [teachersCount, setTeachersCount] = useState(481);
  const [problemsCount, setProblemsCount] = useState(12493);
  const [isLiked, setIsLiked] = useState(false);

  // Periodic random fluctuations for the ticker as requested
  useEffect(() => {
    const teachersInterval = setInterval(() => {
      setTeachersCount(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(460, Math.min(520, prev + delta));
      });
    }, 6000);

    const problemsInterval = setInterval(() => {
      setProblemsCount(prev => prev + Math.floor(Math.random() * 2) + 1);
    }, 8000);

    return () => {
      clearInterval(teachersInterval);
      clearInterval(problemsInterval);
    };
  }, []);

  return (
    <div className="w-full bg-transparent px-4 sm:px-6 py-2.5 text-xs text-slate-600 no-print select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Stats Section */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-4">
          {/* Pulsing Green Dot + Teachers Online */}
          <div className="flex items-center gap-1.5 font-medium text-slate-800">
            <span className="relative flex h-2 w-2 mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Users className="h-3.5 w-3.5 text-purple-600" />
            <span className="font-bold text-slate-900 tracking-tight">
              {teachersCount.toLocaleString()}
            </span>
            <span className="text-slate-600 font-medium">teachers online</span>
          </div>

          <span className="text-slate-300 font-light hidden sm:inline">|</span>

          {/* Sparkle + Problems Generated Today + Sun Rays */}
          <div className="flex items-center gap-1.5 font-medium text-slate-800">
            <Sparkles className="h-3.5 w-3.5 text-teal-500" />
            <span className="font-bold text-slate-900 tracking-tight">
              {problemsCount.toLocaleString()}
            </span>
            <span className="text-slate-600 font-medium">
              word problems generated today
            </span>
            {/* Cute mini sunburst rays */}
            <span className="text-amber-500 font-black text-xs tracking-tighter select-none ml-0.5">
              \!/
            </span>
          </div>
        </div>

        {/* Right Tagline, Heart, and Teacher Account Access */}
        <div className="flex items-center gap-3 sm:gap-4 text-slate-600">
          <div className="hidden md:flex items-center gap-1.5 font-medium">
            <Lightbulb className="h-3.5 w-3.5 text-indigo-500" />
            <span className="font-medium text-slate-700 tracking-tight">
              Better questions. Brighter minds.
            </span>
          </div>

          {/* Heart Icon */}
          <button 
            type="button" 
            onClick={() => setIsLiked(!isLiked)}
            className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            title="Loving this generator!"
          >
            <Heart className={`h-4 w-4 transition-colors ${isLiked ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-rose-500'}`} />
          </button>

          {/* Teacher Account / Sign In */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              {isAdmin && onOpenAdminArchive && (
                <button
                  type="button"
                  onClick={onOpenAdminArchive}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer"
                  title="Admin Vault"
                >
                  <ShieldCheck className="h-3 w-3 text-amber-600" />
                  <span className="hidden sm:inline">Admin Vault</span>
                </button>
              )}

              <button
                type="button"
                onClick={onOpenUserArea}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all cursor-pointer shadow-2xs"
                title="Open Account & Quota"
              >
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'Teacher'} 
                    className="w-4 h-4 rounded-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="h-3 w-3 text-indigo-600" />
                )}
                <span className="text-[11px] font-bold max-w-[90px] truncate">
                  {user.displayName?.split(' ')[0] || 'Teacher'}
                </span>
                {userProfile?.plan === 'unlimited' ? (
                  <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 text-[9px] font-black uppercase">PRO</span>
                ) : (
                  <span className="text-[10px] text-indigo-600 font-bold">
                    {Math.max(0, (userProfile?.quotaLimit ?? 30) - (userProfile?.generationsUsedThisMonth ?? 0))}/30
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => signOut(auth)}
                className="p-1 text-slate-400 hover:text-rose-500 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            onOpenSignIn && (
              <button
                type="button"
                onClick={onOpenSignIn}
                className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
              >
                Sign In
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

