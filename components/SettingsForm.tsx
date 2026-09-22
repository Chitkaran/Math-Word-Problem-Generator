import React from 'react';
import type { FormState, UserProfile } from '../types';
import { GRADE_LEVELS } from '../constants';
import { 
  Lightbulb, 
  Compass,
  Users, 
  GraduationCap, 
  BarChart2, 
  FileText, 
  Home, 
  Trophy, 
  School, 
  Dices, 
  Sparkles, 
  ArrowRight, 
  ChevronDown,
  Zap,
  Target,
  Heart
} from 'lucide-react';
import heroMathIllustration from '../src/assets/images/hero_math_illustration_1790106347195.jpg';

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
  // 5 Genres matching screenshot: Real Life, Sports, School, Friends n Family, Random
  const genres = [
    { id: 'Real Life', label: 'Real Life', icon: Home },
    { id: 'Sports', label: 'Sports', icon: Trophy },
    { id: 'School', label: 'School', icon: School },
    { id: 'Friends n Family', label: 'Friends n Family', icon: Users },
    { id: 'Random', label: 'Random', icon: Dices },
  ];

  // Derive current difficulty string
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
    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 xl:p-10 shadow-sm border border-slate-100 flex flex-col justify-between">
      {/* 1. Hero Section (Header + 3D Illustration) */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 lg:pb-8 border-b border-slate-100/80">
        
        {/* Left Hero Content */}
        <div className="flex-1 max-w-xl text-left">
          {/* Create Badge */}
          <div className="inline-block px-3.5 py-1 rounded-full border border-slate-300 bg-white text-slate-800 text-xs font-bold mb-3 shadow-2xs">
            Create
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1e293b] tracking-tight leading-[1.12] mb-3">
            Math Word Problem<br />
            <span className="bg-gradient-to-r from-[#818cf8] via-[#60a5fa] to-[#38bdf8] bg-clip-text text-transparent">
              Generator
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Create engaging, curriculum-aligned math word problems in seconds. Save time, spark curiosity, and bring real-world math to your classroom!
          </p>
        </div>

        {/* Right Hero 3D Graphic */}
        <div className="w-full sm:w-auto flex justify-center lg:justify-end shrink-0">
          <div className="relative group max-w-[280px] sm:max-w-[320px] lg:max-w-[340px]">
            <img 
              src={heroMathIllustration} 
              alt="Math Word Problem Generator 3D Art" 
              className="w-full h-auto rounded-2xl object-contain drop-shadow-md hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
        </div>

      </div>

      {/* 2. Form Inputs Section */}
      <div className="space-y-6 pt-6 sm:pt-8">
        
        {/* Topic Input */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <label htmlFor="mathConcept" className="font-extrabold text-slate-900 text-base">
              Topic
            </label>
          </div>

          <div className="relative">
            <input
              type="text"
              id="mathConcept"
              name="mathConcept"
              value={formState.mathConcept}
              onChange={handleInputChange}
              placeholder="e.g., Fractions, Area and Perimeter, Decimals, Technology, etc."
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 pr-12 text-slate-800 placeholder-slate-400 font-medium text-sm sm:text-base shadow-2xs focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
            />
            <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none" />
          </div>
        </div>

        {/* Genre / Context Selection */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-900 text-base">
              Genre
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {genres.map(genre => {
              const Icon = genre.icon;
              const isActive = formState.context === genre.id;
              return (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => handleGenreSelect(genre.id)}
                  className={`
                    flex items-center justify-center gap-2 px-3 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#9333ea] via-[#7c3aed] to-[#6366f1] text-white shadow-md shadow-purple-500/20 scale-[1.02]' 
                      : 'bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:border-slate-300 shadow-2xs'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                  <span className="truncate">{genre.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Dropdown Columns: Grade Level, Difficulty, Number of Questions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 pt-1">
          
          {/* Grade Level */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <label htmlFor="gradeLevel" className="font-extrabold text-slate-900 text-sm">
                Grade Level
              </label>
            </div>

            <div className="relative">
              <select
                id="gradeLevel"
                name="gradeLevel"
                value={formState.gradeLevel}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 font-semibold text-sm shadow-2xs appearance-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all cursor-pointer"
              >
                {GRADE_LEVELS.map(g => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600 pointer-events-none" />
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <BarChart2 className="w-4 h-4" />
              </div>
              <label htmlFor="difficulty" className="font-extrabold text-slate-900 text-sm">
                Difficulty
              </label>
            </div>

            <div className="relative">
              <select
                id="difficulty"
                value={getDifficulty()}
                onChange={handleDifficultyChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 font-semibold text-sm shadow-2xs appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all cursor-pointer"
              >
                <option value="Medium">Medium (On-Level)</option>
                <option value="Easy">Easy (Scaffolded)</option>
                <option value="Hard">Hard (Challenge)</option>
                <option value="All Levels">Mix of All Levels</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 pointer-events-none" />
            </div>
          </div>

          {/* Number of Questions */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <label htmlFor="numberOfQuestions" className="font-extrabold text-slate-900 text-sm">
                Number of Questions
              </label>
            </div>

            <div className="relative">
              <select
                id="numberOfQuestions"
                name="numberOfQuestions"
                value={formState.numberOfQuestions}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 font-semibold text-sm shadow-2xs appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all cursor-pointer"
              >
                {[3, 5, 8, 10, 15, 20].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* 4. Generate Questions Button */}
        <div className="flex flex-col items-center justify-center pt-3 sm:pt-4">
          <button
            type="button"
            onClick={onGenerate}
            disabled={isLoading || !formState.mathConcept.trim()}
            className="bg-gradient-to-r from-[#9333ea] via-[#7c3aed] to-[#3b82f6] hover:from-[#8b2cf0] hover:to-[#2563eb] text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold text-base shadow-lg shadow-purple-500/25 flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span>Generate Questions</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* 5. Bottom Feature Capsule Bar */}
        <div className="bg-[#f0f7ff] rounded-full py-3 px-4 sm:px-6 flex flex-wrap items-center justify-around gap-2 text-xs font-bold text-slate-600 border border-blue-100/70 select-none mt-2 shadow-2xs">
          <div className="flex items-center gap-1.5 text-indigo-700">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span>Save Time</span>
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5 text-indigo-700">
            <Target className="w-4 h-4 text-purple-600" />
            <span>Curriculum Aligned</span>
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5 text-indigo-700">
            <Heart className="w-4 h-4 text-purple-600 fill-purple-200" />
            <span>Engage Students</span>
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5 text-indigo-700">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>Real-World Context</span>
          </div>
        </div>

      </div>
    </div>
  );
};
