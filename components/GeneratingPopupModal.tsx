import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain } from 'lucide-react';
import { MathFactsLoader } from './MathFactsLoader';
import type { FormState } from '../types';

interface GeneratingPopupModalProps {
  isOpen: boolean;
  progress: number;
  formState: FormState;
}

export const GeneratingPopupModal: React.FC<GeneratingPopupModalProps> = ({
  isOpen,
  progress,
  formState
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.22)] border border-slate-100 p-6 md:p-8 relative overflow-hidden text-center"
        >
          {/* Ambient Glows matching logo colors */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-purple-100/70 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-teal-100/70 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Logo Image */}
            <img 
              src="/logo.png" 
              alt="Math Word Problem Generator" 
              className="w-16 h-16 rounded-2xl object-contain shadow-md shadow-purple-900/10 mb-3 border-2 border-white/90 bg-white/80 p-0.5" 
              referrerPolicy="no-referrer" 
            />

            {/* Header Badge with active percentage in brand violet */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold tracking-wide uppercase mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-spin" />
              <span>Generating Worksheets • {Math.round(progress)}%</span>
            </div>

            {/* Title */}
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Creating Differentiated Problems
            </h3>

            {/* Concept / Grade tag */}
            {formState.mathConcept && (
              <p className="mt-1.5 text-xs md:text-sm text-slate-500 font-medium px-4 py-1 bg-slate-50 rounded-full border border-purple-100/80 inline-block max-w-sm truncate">
                Grade {formState.gradeLevel} • <span className="text-[#6366f1] font-bold">{formState.mathConcept}</span>
              </p>
            )}

            {/* Embedded Math Facts & Progress Dial Loader */}
            <div className="w-full mt-2">
              <MathFactsLoader progress={progress} />
            </div>

            {/* Helpful footer reassurance */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium mt-2">
              <Brain className="w-3.5 h-3.5 text-purple-500" />
              <span>Tailoring student scaffolds & teacher keys in real-time</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
