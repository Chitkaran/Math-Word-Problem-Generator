import React from 'react';
import { 
  Printer, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  FolderCheck, 
  GraduationCap, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  FileText
} from 'lucide-react';
import type { GeneratedProblem, FormState } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface GenerationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  onGenerateAgain: () => void;
  content: GeneratedProblem | null;
  formState: FormState;
  onOpenUserArea?: () => void;
}

export const GenerationSuccessModal: React.FC<GenerationSuccessModalProps> = ({
  isOpen,
  onClose,
  onPrint,
  onGenerateAgain,
  content,
  formState,
  onOpenUserArea
}) => {
  if (!isOpen || !content) return null;

  // Extract first problem preview
  const firstProblem = 
    content.studentWorksheet.onLevel?.[0]?.problemText ||
    content.studentWorksheet.scaffolded?.[0]?.problemText ||
    content.studentWorksheet.challenge?.[0]?.problemText ||
    '';

  const scaffoldedCount = content.studentWorksheet.scaffolded?.length || 0;
  const onLevelCount = content.studentWorksheet.onLevel?.length || 0;
  const challengeCount = content.studentWorksheet.challenge?.length || 0;

  const handlePrintClick = () => {
    onPrint();
  };

  const handleGenerateAgainClick = () => {
    onClose();
    onGenerateAgain();
  };

  return (
    <AnimatePresence>
      <div 
        id="generation-success-popup"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-xl overflow-hidden text-slate-800"
          role="dialog"
          aria-modal="true"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white px-6 py-5 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-emerald-300 border border-white/20 shadow-inner">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-white">
                      Word Problems Ready!
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      <Sparkles className="w-3 h-3" />
                      Generated
                    </span>
                  </div>
                  <p className="text-indigo-100/80 text-xs mt-0.5">
                    Curriculum-aligned math problems tailored to your classroom settings.
                  </p>
                </div>
              </div>

              <button
                id="generation-popup-close-btn"
                onClick={onClose}
                className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5">
            {/* Storage Guarantees (Admin Archive & User Area Sync) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900">
                <FolderCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-xs leading-tight">
                  <p className="font-bold text-emerald-950">Saved in User Area</p>
                  <p className="text-emerald-700 text-[11px]">Ready in My Past Generations</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-indigo-900">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="text-xs leading-tight">
                  <p className="font-bold text-indigo-950">Archived for Admin</p>
                  <p className="text-indigo-700 text-[11px]">Stored in global teacher records</p>
                </div>
              </div>
            </div>

            {/* Overview Meta Tags */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-slate-900 font-bold">{formState.mathConcept}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formState.gradeLevel}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">
                  {formState.numberOfQuestions} Questions
                </span>
                {formState.context && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[11px] font-medium">
                      {formState.context}
                    </span>
                  </>
                )}
              </div>

              {/* Differentiation Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/60 text-[11px]">
                <span className="text-slate-500 font-medium">Levels created:</span>
                {scaffoldedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 font-semibold">
                    Scaffolded ({scaffoldedCount})
                  </span>
                )}
                {onLevelCount > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100/80 text-indigo-800 font-semibold">
                    On-Level ({onLevelCount})
                  </span>
                )}
                {challengeCount > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-100/80 text-purple-800 font-semibold">
                    Challenge ({challengeCount})
                  </span>
                )}
              </div>
            </div>

            {/* Quick Preview of Question #1 */}
            {firstProblem && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sample Question Preview:</span>
                </span>
                <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 line-clamp-2 italic leading-relaxed shadow-sm">
                  "{firstProblem}"
                </div>
              </div>
            )}

            {/* ACTION BUTTONS (Print, Generate Again, Cancel) */}
            <div className="pt-2 border-t border-slate-200/80 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Print Button */}
                <button
                  id="generation-popup-print-btn"
                  type="button"
                  onClick={handlePrintClick}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-xs cursor-pointer group"
                >
                  <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Print</span>
                </button>

                {/* 2. Generate Again Button */}
                <button
                  id="generation-popup-generate-again-btn"
                  type="button"
                  onClick={handleGenerateAgainClick}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-xs cursor-pointer group"
                >
                  <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Generate Again</span>
                </button>

                {/* 3. Cancel Button */}
                <button
                  id="generation-popup-cancel-btn"
                  type="button"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold rounded-xl border border-slate-300/80 transition-all text-xs cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-500" />
                  <span>Cancel</span>
                </button>
              </div>

              {/* Bottom Quick-Link to User Area */}
              {onOpenUserArea && (
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                  <span>Want to review older problem sets?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenUserArea();
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open User Area</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
