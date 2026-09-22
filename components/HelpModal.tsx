import React from 'react';
import { X, Lightbulb, Sparkles, BookOpen, Printer, CheckCircle2 } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Teacher Guide & Tips</h3>
            <p className="text-xs text-slate-500">Creating high-engagement math word problems</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-600">
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100">
            <h4 className="font-bold text-purple-900 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Prompting Best Practices</span>
            </h4>
            <p className="leading-relaxed">
              Enter any curriculum topic (e.g. <em>"Fractions"</em>, <em>"Area & Perimeter"</em>, <em>"Multi-step Equations"</em>) and choose a theme (like <em>Real Life</em> or <em>Sports</em>) to automatically root the problems in relatable student scenarios.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100">
            <h4 className="font-bold text-sky-900 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-sky-600" />
              <span>Differentiated Learning</span>
            </h4>
            <p className="leading-relaxed">
              Choose <strong>Scaffolded</strong> for extra support, <strong>On-Level</strong> for standard grade expectations, <strong>Challenge</strong> for higher-order thinking, or <strong>Mix of All Levels</strong> for tiered small groups.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <h4 className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-emerald-600" />
              <span>Print-Ready & 30/70 Horizontal Workspace</span>
            </h4>
            <p className="leading-relaxed">
              Every worksheet is generated with questions on the left (30%) and curved working space boxes on the right (70%), accompanied by comprehensive teacher answer keys.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-sm transition-all"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
