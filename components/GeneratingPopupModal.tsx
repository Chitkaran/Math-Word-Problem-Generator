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
          {/* Ambient Glows */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-indigo-100/70 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-teal-100/70 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span>Generating Worksheets</span>
            </div>

            {/* Title */}
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Creating Differentiated Problems
            </h3>

            {/* Concept / Grade tag */}
            {formState.mathConcept && (
              <p className="mt-1.5 text-xs md:text-sm text-slate-500 font-medium px-4 py-1 bg-slate-50 rounded-full border border-slate-200/60 inline-block max-w-sm truncate">
                Grade {formState.gradeLevel} • <span className="text-indigo-600 font-bold">{formState.mathConcept}</span>
              </p>
            )}

            {/* Embedded Math Facts & Progress Dial Loader */}
            <div className="w-full mt-2">
              <MathFactsLoader progress={progress} />
            </div>

            {/* Helpful footer reassurance */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium mt-2">
              <Brain className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tailoring student scaffolds & teacher keys in real-time</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
