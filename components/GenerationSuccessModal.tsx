import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  RefreshCw, 
  X, 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  FileSpreadsheet,
  ExternalLink,
  Download
} from 'lucide-react';
import type { GeneratedProblem, FormState, ProblemDetail, TeacherKeyDetail } from '../types';
import { LEVEL_NAMES } from '../constants';
import { 
  printWorksheetDocument, 
  generateWorksheetHtml, 
  openPrintInNewTab, 
  downloadWorksheetHtml 
} from '../services/printService';
import { motion, AnimatePresence } from 'motion/react';

type DifferentiationLevel = 'scaffolded' | 'onLevel' | 'challenge' | 'mix';

interface GenerationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint?: () => void;
  onGenerateAgain: () => void;
  content: GeneratedProblem | null;
  formState: FormState;
  onOpenUserArea?: () => void;
}

export const GenerationSuccessModal: React.FC<GenerationSuccessModalProps> = ({
  isOpen,
  onClose,
  onGenerateAgain,
  content,
  formState
}) => {
  if (!isOpen || !content) return null;

  // Determine available differentiation levels in the generated content
  const baseLevels = useMemo(() => {
    return (Object.keys(content.studentWorksheet) as ('scaffolded' | 'onLevel' | 'challenge')[])
      .filter(lvl => content.studentWorksheet[lvl] && content.studentWorksheet[lvl]!.length > 0);
  }, [content]);

  const availableLevels: DifferentiationLevel[] = useMemo(() => {
    const list: DifferentiationLevel[] = [...baseLevels];
    if (baseLevels.length > 1) {
      list.push('mix');
    }
    return list;
  }, [baseLevels]);

  const initialLevel: DifferentiationLevel = availableLevels.includes('mix') 
    ? 'mix' 
    : (availableLevels[0] || 'onLevel');

  const [activeLevel, setActiveLevel] = useState<DifferentiationLevel>(initialLevel);
  const [activeView, setActiveView] = useState<'student' | 'teacher'>('student');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Handle direct in-DOM print action with automatic new-tab fallback
  const handlePrint = () => {
    setStatusMessage('Preparing print dialog...');
    const result = printWorksheetDocument(content, activeLevel, activeView, {
      mathConcept: formState.mathConcept,
      gradeLevel: formState.gradeLevel,
      numberOfQuestions: formState.numberOfQuestions,
      context: formState.context
    });

    if (result.fallbackUsed) {
      setStatusMessage('Direct print blocked by preview frame. Opened printable worksheet in a new tab!');
    } else {
      setStatusMessage('Print dialog opened.');
    }
    setTimeout(() => setStatusMessage(null), 4500);
  };

  // Open clean printable document in dedicated top-level window
  const handleOpenTab = () => {
    const html = generateWorksheetHtml(content, activeLevel, activeView, {
      mathConcept: formState.mathConcept,
      gradeLevel: formState.gradeLevel,
      numberOfQuestions: formState.numberOfQuestions,
      context: formState.context
    });
    openPrintInNewTab(html);
    setStatusMessage('Opened worksheet in a dedicated tab.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Download standalone printable HTML file
  const handleDownload = () => {
    downloadWorksheetHtml(content, activeLevel, activeView, {
      mathConcept: formState.mathConcept,
      gradeLevel: formState.gradeLevel,
      numberOfQuestions: formState.numberOfQuestions,
      context: formState.context
    });
    setStatusMessage('Downloaded printable worksheet file.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleGenerateAgainClick = () => {
    onClose();
    onGenerateAgain();
  };

  // Extract problems for the current view and level
  const displayedProblems = useMemo(() => {
    if (activeLevel === 'mix') {
      const all: { problem: ProblemDetail; levelLabel: string }[] = [];
      baseLevels.forEach(bl => {
        const items = content.studentWorksheet[bl] || [];
        all.push(...items.map(p => ({ problem: p, levelLabel: LEVEL_NAMES[bl] })));
      });
      const targetCount = formState.numberOfQuestions || all.length;
      const result: { problem: ProblemDetail; levelLabel: string }[] = [];
      for (let i = 0; i < targetCount; i++) {
        const bl = baseLevels[i % baseLevels.length];
        const blProblems = all.filter(item => item.levelLabel === LEVEL_NAMES[bl]);
        const idx = Math.floor(i / baseLevels.length) % (blProblems.length || 1);
        if (blProblems[idx]) {
          result.push(blProblems[idx]);
        } else if (all[i]) {
          result.push(all[i]);
        }
      }
      return result;
    } else {
      const items = content.studentWorksheet[activeLevel as keyof GeneratedProblem['studentWorksheet']] || [];
      return items.map(p => ({ problem: p, levelLabel: LEVEL_NAMES[activeLevel] }));
    }
  }, [content, activeLevel, baseLevels, formState.numberOfQuestions]);

  const displayedKeys = useMemo(() => {
    if (activeLevel === 'mix') {
      const all: { key: TeacherKeyDetail; levelLabel: string }[] = [];
      baseLevels.forEach(bl => {
        const items = content.teacherKey[bl] || [];
        all.push(...items.map(k => ({ key: k, levelLabel: LEVEL_NAMES[bl] })));
      });
      const targetCount = formState.numberOfQuestions || all.length;
      const result: { key: TeacherKeyDetail; levelLabel: string }[] = [];
      for (let i = 0; i < targetCount; i++) {
        const bl = baseLevels[i % baseLevels.length];
        const blKeys = all.filter(item => item.levelLabel === LEVEL_NAMES[bl]);
        const idx = Math.floor(i / baseLevels.length) % (blKeys.length || 1);
        if (blKeys[idx]) {
          result.push(blKeys[idx]);
        } else if (all[i]) {
          result.push(all[i]);
        }
      }
      return result;
    } else {
      const items = content.teacherKey[activeLevel as keyof GeneratedProblem['teacherKey']] || [];
      return items.map(k => ({ key: k, levelLabel: LEVEL_NAMES[activeLevel] }));
    }
  }, [content, activeLevel, baseLevels, formState.numberOfQuestions]);

  return (
    <AnimatePresence>
      <div 
        id="generation-popup-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 relative"
          role="dialog"
          aria-modal="true"
        >
          {/* ======================================================== */}
          {/* TOP ACTION TOOLBAR & HEADER (Print, Generate Again, Cancel) */}
          {/* ======================================================== */}
          <div className="bg-white border-b border-slate-200 px-5 py-4 shrink-0 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Left: Worksheet Info */}
              <div className="flex items-center gap-3">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="w-10 h-10 rounded-xl object-contain border border-purple-200 bg-white p-0.5 shrink-0 shadow-sm" 
                  referrerPolicy="no-referrer" 
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">
                      {formState.mathConcept || 'Math Word Problems'}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      Ready to Print
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                      Grade {formState.gradeLevel}
                    </span>
                    <span>•</span>
                    <span>{formState.numberOfQuestions} Questions</span>
                    {formState.context && (
                      <>
                        <span>•</span>
                        <span className="text-purple-700 font-semibold">{formState.context}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: ACTION BUTTONS AT THE TOP (Print, Open Tab, Download, Generate Again, Cancel) */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* 1. Print Button */}
                <button
                  id="popup-print-button"
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#4f46e5] hover:from-[#6d28d9] hover:to-[#4338ca] text-white font-bold rounded-xl shadow-md shadow-purple-500/20 hover:shadow-lg transition-all text-xs sm:text-sm cursor-pointer group"
                  title="Print this worksheet using system print dialog"
                >
                  <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Print</span>
                </button>

                {/* 1b. Open in New Tab Button (Guaranteed reliable print preview) */}
                <button
                  id="popup-open-tab-button"
                  type="button"
                  onClick={handleOpenTab}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl border border-indigo-200 transition-all text-xs sm:text-sm cursor-pointer"
                  title="Open clean printable document in a dedicated browser tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open Tab</span>
                </button>

                {/* 1c. Download HTML File */}
                <button
                  id="popup-download-button"
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 transition-all text-xs sm:text-sm cursor-pointer"
                  title="Download standalone printable HTML file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Save</span>
                </button>

                {/* 2. Generate Again Button */}
                <button
                  id="popup-generate-again-button"
                  type="button"
                  onClick={handleGenerateAgainClick}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-xs sm:text-sm cursor-pointer group"
                  title="Generate another set of problems"
                >
                  <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Generate Again</span>
                </button>

                {/* 3. Cancel / Close Button */}
                <button
                  id="popup-cancel-button"
                  type="button"
                  onClick={onClose}
                  className="flex items-center justify-center gap-1 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold rounded-xl border border-slate-300/80 transition-all text-xs sm:text-sm cursor-pointer"
                  title="Cancel & Close popup"
                >
                  <X className="w-4 h-4 text-slate-600" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>

            {/* Status Message Notification Banner */}
            {statusMessage && (
              <div className="mt-3 px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                  <span>{statusMessage}</span>
                </div>
                <button 
                  onClick={() => setStatusMessage(null)}
                  className="text-purple-500 hover:text-purple-800 font-bold ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Sub-bar: View Selector & Level Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
              {/* Student vs Teacher Tabs */}
              <div className="bg-slate-100/90 p-1 rounded-xl flex items-center gap-1 shrink-0 self-start">
                <button
                  id="popup-view-student-tab"
                  type="button"
                  onClick={() => setActiveView('student')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeView === 'student'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Student Worksheet</span>
                </button>
                <button
                  id="popup-view-teacher-tab"
                  type="button"
                  onClick={() => setActiveView('teacher')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeView === 'teacher'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Teacher Key</span>
                </button>
              </div>

              {/* Differentiation Level Selector */}
              {availableLevels.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">Level:</span>
                  {availableLevels.map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setActiveLevel(lvl)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeLevel === lvl
                          ? 'bg-purple-50 border border-purple-300 text-purple-700 shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {LEVEL_NAMES[lvl]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* MODAL BODY: FULL WORKSHEET DISPLAY                      */}
          {/* ======================================================== */}
          <div className="flex-1 overflow-y-auto p-5 md:p-8 bg-slate-50/50 space-y-6">
            
            {/* STUDENT WORKSHEET VIEW */}
            {activeView === 'student' && (
              <div className="space-y-6">
                {displayedProblems.map(({ problem, levelLabel }, index) => (
                  <div 
                    key={`modal-prob-${index}`}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-stretch gap-6"
                  >
                    {/* Left Column: 30% Question text and number */}
                    <div className="w-full md:w-[30%] shrink-0 flex flex-col justify-start">
                      {/* Problem Header */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 font-black text-xs flex items-center justify-center border border-purple-200">
                            {index + 1}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm md:text-base">
                            Problem {index + 1}
                          </h4>
                        </div>
                        {activeLevel === 'mix' && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full border border-purple-200 whitespace-nowrap">
                            {levelLabel}
                          </span>
                        )}
                      </div>

                      {/* Problem Text */}
                      <p className="text-slate-800 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                        {problem.problemText}
                      </p>
                    </div>

                    {/* Right Column: 70% Working space box with curved edges */}
                    <div className="w-full md:w-[70%] flex flex-col">
                      <div className="w-full h-full min-h-[180px] md:min-h-[220px] rounded-2xl border-2 border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between hover:border-purple-300 transition-colors">
                        <span className="text-xs text-slate-500 italic">
                          {problem.workspacePrompt || 'Show your mathematical thinking & working:'}
                        </span>
                        <div className="flex justify-end">
                          <span className="text-[11px] text-slate-400 font-medium select-none uppercase tracking-wider">
                            Work Space
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TEACHER KEY VIEW */}
            {activeView === 'teacher' && (
              <div className="space-y-6">
                {displayedKeys.map(({ key, levelLabel }, index) => (
                  <div 
                    key={`modal-key-${index}`}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-sm space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 font-black text-xs flex items-center justify-center border border-purple-200">
                          {index + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm md:text-base">
                          Problem {index + 1} Answer Key
                        </h4>
                      </div>
                      {activeLevel === 'mix' && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                          {levelLabel}
                        </span>
                      )}
                    </div>

                    {/* Complete Solution */}
                    <div className="bg-purple-50/40 p-4 rounded-xl border border-purple-200/70 border-l-4 border-l-[#7c3aed]">
                      <h5 className="text-xs font-bold text-purple-800 uppercase tracking-wide mb-1.5">
                        Complete Solution
                      </h5>
                      <p className="text-slate-800 text-sm whitespace-pre-wrap font-medium leading-relaxed">
                        {key.completeSolution}
                      </p>
                    </div>

                    {/* Strategies & Misconceptions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Multiple Strategies */}
                      <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/70">
                        <h5 className="text-xs font-bold text-teal-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                          <span>Multiple Strategies</span>
                        </h5>
                        <ul className="text-xs md:text-sm text-slate-700 space-y-1.5 pl-1">
                          {key.multipleStrategies.map((s, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-2">
                              <span className="text-teal-500 font-bold">•</span>
                              <span className="leading-normal">{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Common Misconceptions */}
                      <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70">
                        <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Common Misconceptions</span>
                        </h5>
                        <ul className="text-xs md:text-sm text-slate-700 space-y-1.5 pl-1">
                          {key.commonMisconceptions.map((m, mIdx) => (
                            <li key={mIdx} className="flex items-start gap-2">
                              <span className="text-amber-500 font-bold">⚠️</span>
                              <span className="leading-normal">{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Success Criteria */}
                    <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/70">
                      <h5 className="text-xs font-bold text-indigo-900 uppercase tracking-wide mb-2">
                        Success Criteria
                      </h5>
                      <ul className="text-xs md:text-sm text-slate-700 space-y-1.5 pl-1">
                        {key.successCriteria.map((c, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-2">
                            <span className="text-indigo-500 font-bold">✓</span>
                            <span className="leading-normal">{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* ======================================================== */}
          {/* MODAL FOOTER                                            */}
          {/* ======================================================== */}
          <div className="bg-white border-t border-slate-200 px-6 py-3 shrink-0 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Showing {activeView === 'student' ? 'Student Worksheet' : 'Teacher Key'} &bull; {LEVEL_NAMES[activeLevel]}
            </span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handlePrint}
                className="text-purple-700 hover:text-purple-900 font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
              <button
                type="button"
                onClick={handleOpenTab}
                className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Tab</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="text-slate-600 hover:text-slate-800 font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save File</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
