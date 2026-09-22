import React, { useState } from 'react';
import type { FormState, UserProfile } from '../types';
import { GRADE_LEVELS, QUESTION_COUNT_OPTIONS } from '../constants';
import { 
  Lightbulb, 
  Users, 
  GraduationCap, 
  Signal, 
  FileText, 
  Home, 
  Trophy, 
  School, 
  Dices, 
  Sparkles, 
  ArrowRight, 
  ChevronDown,
  Zap,
  Crown
} from 'lucide-react';

interface SettingsFormProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  onGenerate: () => void;
  isLoading: boolean;
  userProfile?: UserProfile | null;
  onOpenUserArea?: () => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ 
  formState, 
  setFormState, 
  onGenerate, 
  isLoading,
  userProfile,
  onOpenUserArea
}) => {
  // Map genre options matching screenshot: Real Life, Sports, School, Friends n Family, Random
  const genres = [
    { id: 'Real Life', label: 'Real Life', icon: Home },
    { id: 'Sports', label: 'Sports', icon: Trophy },
    { id: 'School', label: 'School', icon: School },
    { id: 'Friends n Family', label: 'Friends n Family', icon: Users },
    { id: 'Random', label: 'Random', icon: Dices },
  ];

  // Derive current difficulty string from differentiation object
  const getDifficulty = (): string => {
    const { scaffolded, onLevel, challenge } = formState.differentiation;
    if (scaffolded && onLevel && challenge) return 'All Levels';
    if (scaffolded && !onLevel && !challenge) return 'Easy';
    if (!scaffolded && !onLevel && challenge) return 'Hard';
    return 'Medium'; // default
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'Easy') {
      setFormState(prev => ({
        ...prev,
        differentiation: { scaffolded: true, onLevel: false, challenge: false }
      }));
    } else if (val === 'Hard') {
      setFormState(prev => ({
        ...prev,
        differentiation: { scaffolded: false, onLevel: false, challenge: true }
      }));
    } else if (val === 'All Levels') {
      setFormState(prev => ({
        ...prev,
        differentiation: { scaffolded: true, onLevel: true, challenge: true }
      }));
    } else {
      // Medium / On-Level
      setFormState(prev => ({
        ...prev,
        differentiation: { scaffolded: false, onLevel: true, challenge: false }
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumeric = name === 'numberOfQuestions';
    setFormState(prev => ({
      ...prev,
      [name]: isNumeric ? parseInt(value, 10) : value
    }));
  };

  const handleGenreSelect = (genreId: string) => {
    setFormState(prev => ({ ...prev, context: genreId }));
  };

  return (
    <div className="relative z-20 px-4 py-4 md:py-6">
      <div className="container mx-auto max-w-6xl">
        
        {/* Main Generator Card matching exact design in screenshot */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(30,58,138,0.06)] border border-slate-100 p-6 md:p-12 relative overflow-hidden">
          
          {/* Top Section: Header Title + Illustration */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-10">
            
            {/* Left Header Title & Subtitle */}
            <div className="flex items-start gap-4 md:gap-5 max-w-2xl">
              {/* Blue Math Operators Tile with Ray Accents */}
              <div className="relative flex-shrink-0 mt-1">
                {/* 3 Radiating accent strokes on top-left */}
                <div className="absolute -top-3 -left-3 flex gap-1 pointer-events-none select-none">
                  <span className="w-1.5 h-3 bg-indigo-500 rounded-full -rotate-45 block" />
                  <span className="w-1.5 h-3.5 bg-indigo-400 rounded-full -rotate-15 block -mt-1" />
                  <span className="w-1.5 h-3 bg-indigo-400 rounded-full rotate-25 block" />
                </div>
                <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 pointer-events-none select-none">
                  <span className="w-2.5 h-1 bg-indigo-400 rounded-full block" />
                </div>

                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 text-white flex flex-col items-center justify-center shadow-lg shadow-indigo-300/50 select-none">
                  <div className="flex items-center justify-center gap-2 font-bold text-lg md:text-xl leading-none">
                    <span>+</span>
                    <span>−</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 font-bold text-lg md:text-xl leading-none mt-1">
                    <span>×</span>
                    <span>÷</span>
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  Math <span className="text-indigo-600">Word Problem</span> Generator
                </h2>
                <div className="text-slate-500 text-sm md:text-base font-normal leading-relaxed space-y-0.5">
                  <p>Create engaging, curriculum-aligned math word problems in seconds.</p>
                  <p>Save time, spark curiosity, and bring real-world math to your classroom!</p>
                </div>
              </div>
            </div>

            {/* Right Side Notepad & Pencil Illustration */}
            <div className="hidden lg:flex items-center justify-center relative flex-shrink-0 w-52 h-44 select-none pointer-events-none">
              {/* Pastel Background Blobs */}
              <div className="absolute top-2 left-2 w-36 h-36 bg-amber-100/70 rounded-full blur-xl" />
              <div className="absolute bottom-1 right-2 w-36 h-36 bg-teal-100/70 rounded-full blur-xl" />

              {/* Notebook + Pencil SVG Graphic */}
              <svg className="w-48 h-40 relative z-10 filter drop-shadow-md" viewBox="0 0 200 160" fill="none">
                {/* Spiral notebook rotated slightly */}
                <g transform="rotate(8 100 80)">
                  {/* Notebook Base Sheet */}
                  <rect x="55" y="20" width="90" height="110" rx="10" fill="#FFFFFF" stroke="#60A5FA" strokeWidth="2.5" />
                  
                  {/* Inner Page lines */}
                  <line x1="75" y1="52" x2="135" y2="52" stroke="#E2E8F0" strokeWidth="1.5" />
                  <line x1="75" y1="72" x2="135" y2="72" stroke="#E2E8F0" strokeWidth="1.5" />
                  <line x1="75" y1="92" x2="135" y2="92" stroke="#E2E8F0" strokeWidth="1.5" />
                  
                  {/* Spiral rings on left */}
                  {[28, 40, 52, 64, 76, 88, 100, 112].map((y, idx) => (
                    <g key={idx}>
                      <ellipse cx="55" cy={y} rx="4" ry="2.5" fill="#1E40AF" />
                      <circle cx="53" cy={y} r="1.5" fill="#93C5FD" />
                    </g>
                  ))}

                  {/* Math Operators drawn on notebook */}
                  <text x="82" y="66" fontFamily="sans-serif" fontSize="18" fontWeight="bold" fill="#3B82F6">+</text>
                  <text x="112" y="66" fontFamily="sans-serif" fontSize="18" fontWeight="bold" fill="#3B82F6">−</text>
                  <text x="82" y="96" fontFamily="sans-serif" fontSize="18" fontWeight="bold" fill="#6366F1">×</text>
                  <text x="112" y="96" fontFamily="sans-serif" fontSize="18" fontWeight="bold" fill="#6366F1">÷</text>
                </g>

                {/* Yellow Pencil leaning against notebook */}
                <g transform="rotate(-36 140 100)">
                  {/* Pencil Wood Body */}
                  <rect x="110" y="20" width="14" height="85" rx="3" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
                  {/* Pencil Strips */}
                  <line x1="115" y1="20" x2="115" y2="105" stroke="#F59E0B" strokeWidth="1.5" />
                  {/* Metal band */}
                  <rect x="110" y="15" width="14" height="7" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1" />
                  {/* Pink Eraser */}
                  <rect x="110" y="7" width="14" height="9" rx="3" fill="#F472B6" />
                  {/* Sharpened tip */}
                  <polygon points="110,105 124,105 117,125" fill="#FDE68A" stroke="#D97706" strokeWidth="1" />
                  {/* Graphite point */}
                  <polygon points="114,118 120,118 117,125" fill="#1E293B" />
                </g>

                {/* Playful Confetti / Sparkle Rays */}
                <path d="M165 30L172 26" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
                <path d="M175 40L182 44" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
                <circle cx="178" cy="30" r="2" fill="#F59E0B" />
              </svg>
            </div>

          </div>

          {/* Form Inputs Container */}
          <div className="space-y-6 md:space-y-8">
            
            {/* 1. TOPIC FIELD */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-100/90 text-indigo-600 flex items-center justify-center">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <label htmlFor="mathConcept" className="font-bold text-slate-900 text-base tracking-tight">
                  Topic
                </label>
              </div>

              <div className="relative group">
                <input
                  type="text"
                  id="mathConcept"
                  name="mathConcept"
                  value={formState.mathConcept}
                  onChange={handleInputChange}
                  placeholder="e.g., Fractions, Area and Perimeter, Decimals, etc."
                  className="w-full bg-white border border-blue-200/80 rounded-2xl py-3.5 px-5 pr-12 text-slate-800 placeholder-slate-400 font-medium text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500 pointer-events-none" />
              </div>
            </div>

            {/* 2. GENRE (CONTEXT) FIELD */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-100/90 text-indigo-600 flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
                <label className="font-bold text-slate-900 text-base tracking-tight">
                  Genre
                </label>
              </div>

              {/* 5 Genre Pill Buttons in single row matching design */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {genres.map(genre => {
                  const Icon = genre.icon;
                  const isActive = formState.context === genre.id;
                  return (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => handleGenreSelect(genre.id)}
                      className={`
                        flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-600 text-white shadow-md shadow-indigo-200/60 scale-[1.02]' 
                          : 'bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 hover:border-slate-300'
                        }
                      `}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                      <span className="whitespace-nowrap">{genre.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. ROW OF 3 SELECTS: Grade Level, Difficulty, Number of Questions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              
              {/* Grade Level */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-100/90 text-indigo-600 flex items-center justify-center">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <label htmlFor="gradeLevel" className="font-bold text-slate-900 text-base tracking-tight">
                    Grade Level
                  </label>
                </div>

                <div className="relative">
                  <select
                    id="gradeLevel"
                    name="gradeLevel"
                    value={formState.gradeLevel}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-blue-200/80 rounded-2xl py-3.5 px-5 text-slate-700 font-medium text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    {GRADE_LEVELS.map(g => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500 pointer-events-none" />
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-100/90 text-indigo-600 flex items-center justify-center">
                    <Signal className="h-4 w-4" />
                  </div>
                  <label htmlFor="difficulty" className="font-bold text-slate-900 text-base tracking-tight">
                    Difficulty
                  </label>
                </div>

                <div className="relative">
                  <select
                    id="difficulty"
                    value={getDifficulty()}
                    onChange={handleDifficultyChange}
                    className="w-full bg-white border border-blue-200/80 rounded-2xl py-3.5 px-5 text-slate-700 font-medium text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Medium">Medium</option>
                    <option value="Easy">Easy (Scaffolded)</option>
                    <option value="Hard">Hard (Challenge)</option>
                    <option value="All Levels">All Levels (Mixed)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500 pointer-events-none" />
                </div>
              </div>

              {/* Number of Questions */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-100/90 text-indigo-600 flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                  <label htmlFor="numberOfQuestions" className="font-bold text-slate-900 text-base tracking-tight">
                    Number of Questions
                  </label>
                </div>

                <div className="relative">
                  <select
                    id="numberOfQuestions"
                    name="numberOfQuestions"
                    value={formState.numberOfQuestions}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-blue-200/80 rounded-2xl py-3.5 px-5 text-slate-700 font-medium text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    {[3, 5, 8, 10, 15, 20].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500 pointer-events-none" />
                </div>
              </div>

            </div>

            {/* 4. GENERATE QUESTIONS BUTTON (Centered Pill) */}
            <div className="flex flex-col items-center justify-center pt-4 md:pt-6 space-y-2.5">
              <button
                type="button"
                onClick={onGenerate}
                disabled={isLoading || !formState.mathConcept.trim()}
                className={`
                  flex items-center justify-center gap-3 px-10 py-4 
                  bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 
                  hover:from-blue-700 hover:to-purple-700 
                  text-white font-bold text-base md:text-lg 
                  rounded-full shadow-lg shadow-indigo-300/40 
                  transition-all duration-200 transform hover:scale-105 active:scale-95 
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                  cursor-pointer
                `}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span>Generate Questions</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              {/* Quota Indicator */}
              {userProfile && (
                <div>
                  {userProfile.plan === 'unlimited' ? (
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-800 bg-indigo-50/70 px-3 py-1 rounded-full border border-indigo-100">
                      <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
                      <span>Unlimited Pro Active: Unrestricted Generations</span>
                    </div>
                  ) : (
                    (() => {
                      const limit = userProfile.quotaLimit || 30;
                      const used = userProfile.generationsUsedThisMonth || 0;
                      const remaining = Math.max(0, limit - used);
                      if (remaining === 0) {
                        return (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
                            <span>Monthly free quota used (30/30).</span>
                            <button
                              type="button"
                              onClick={onOpenUserArea}
                              className="font-bold underline text-indigo-700 hover:text-indigo-900 cursor-pointer"
                            >
                              Upgrade to Unlimited to keep generating →
                            </button>
                          </div>
                        );
                      }
                      return (
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1 text-slate-600">
                            <Zap className="h-3 w-3 text-indigo-500" />
                            <span>Monthly Free Quota: <strong className="text-indigo-700 font-bold">{remaining} of {limit}</strong> left</span>
                          </span>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={onOpenUserArea}
                            className="text-amber-600 hover:text-amber-700 font-bold hover:underline cursor-pointer"
                          >
                            Upgrade for Unlimited
                          </button>
                        </div>
                      );
                    })()
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
