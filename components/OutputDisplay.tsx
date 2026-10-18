import React, { useState, useEffect } from 'react';
import type { GeneratedProblem, ProblemDetail, TeacherKeyDetail, RenderSettings } from '../types';
import { LEVEL_NAMES } from '../constants';
import { StudentSheetIcon } from './icons';
import { 
  ExternalLink, 
  Download, 
  Sliders, 
  Grid3X3, 
  Columns, 
  Square, 
  Printer, 
  Check, 
  ChevronDown, 
  Lightbulb,
  Sparkles
} from 'lucide-react';
import { generateWorksheetHtml, openPrintInNewTab, downloadWorksheetHtml } from '../services/printService';
import { RenderSettingsModal } from './RenderSettingsModal';
import { DEFAULT_RENDER_SETTINGS } from '../types';

type DifferentiationLevel = 'scaffolded' | 'onLevel' | 'challenge' | 'mix';

interface OutputDisplayProps {
  content: GeneratedProblem;
  activeView: 'student' | 'teacher';
  setActiveView: (view: 'student' | 'teacher') => void;
  printInfo: {
    mathConcept: string;
    gradeLevel: string;
    numberOfQuestions: number;
  };
  activeDifferentiationLevel: DifferentiationLevel | null;
  setActiveDifferentiationLevel: (level: DifferentiationLevel) => void;
  onPrint: (settings?: RenderSettings) => void;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ 
  content, 
  activeView, 
  setActiveView, 
  printInfo,
  activeDifferentiationLevel,
  setActiveDifferentiationLevel,
  onPrint
}) => {
  // Load saved render settings or fallback to default
  const [renderSettings, setRenderSettings] = useState<RenderSettings>(() => {
    try {
      const saved = localStorage.getItem('math_render_settings');
      if (saved) {
        return { ...DEFAULT_RENDER_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_RENDER_SETTINGS;
  });

  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);
  const [expandedHints, setExpandedHints] = useState<Record<string, boolean>>({});

  const toggleHints = (key: string) => {
    setExpandedHints(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleUpdateSettings = (newSettings: RenderSettings) => {
    setRenderSettings(newSettings);
    try {
      localStorage.setItem('math_render_settings', JSON.stringify(newSettings));
    } catch {
      // ignore
    }
  };

  const baseLevels = (Object.keys(content.studentWorksheet) as ('scaffolded' | 'onLevel' | 'challenge')[])
    .filter(level => content.studentWorksheet[level] && content.studentWorksheet[level]!.length > 0);

  const availableLevels: DifferentiationLevel[] = [...baseLevels];
  if (baseLevels.length > 1) {
    availableLevels.push('mix');
  }

  // Paper styling CSS
  const getPaperBgStyle = () => {
    switch (renderSettings.paperStyle) {
      case 'grid':
        return {
          backgroundImage: 'linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '18px 18px',
          backgroundColor: '#f8fafc'
        };
      case 'lined':
        return {
          backgroundImage: 'linear-gradient(to bottom, transparent 25px, #cbd5e1 26px)',
          backgroundSize: '100% 26px',
          backgroundColor: '#fafbfc'
        };
      case 'dots':
        return {
          backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)',
          backgroundSize: '18px 18px',
          backgroundColor: '#f8fafc'
        };
      case 'blank':
      default:
        return {
          backgroundColor: '#f8fafc'
        };
    }
  };

  // Workspace height
  const getWorkspaceMinHeight = () => {
    switch (renderSettings.workspaceHeight) {
      case 'compact':
        return 'min-h-[140px] md:min-h-[160px]';
      case 'spacious':
        return 'min-h-[280px] md:min-h-[330px]';
      case 'standard':
      default:
        return 'min-h-[190px] md:min-h-[230px]';
    }
  };

  // Typography font size
  const getFontSizeClasses = () => {
    switch (renderSettings.fontSize) {
      case 'compact':
        return 'text-sm leading-normal';
      case 'large':
        return 'text-lg md:text-xl leading-relaxed';
      case 'standard':
      default:
        return 'text-base md:text-lg leading-relaxed';
    }
  };

  // Theme color accents
  const getThemeClasses = () => {
    switch (renderSettings.themeColor) {
      case 'slate':
        return {
          title: 'text-slate-950',
          badge: 'bg-slate-100 text-slate-800 border-slate-300',
          numberBadge: 'bg-slate-100 text-slate-900 border-slate-300',
          boxBorder: 'border-slate-400 hover:border-slate-600',
          accentBorder: 'border-slate-900',
          accentText: 'text-slate-900'
        };
      case 'navy':
        return {
          title: 'text-blue-950',
          badge: 'bg-blue-50 text-blue-800 border-blue-200',
          numberBadge: 'bg-blue-50 text-blue-900 border-blue-200',
          boxBorder: 'border-blue-300 hover:border-blue-500',
          accentBorder: 'border-blue-900',
          accentText: 'text-blue-900'
        };
      case 'emerald':
        return {
          title: 'text-emerald-950',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          numberBadge: 'bg-emerald-50 text-emerald-900 border-emerald-200',
          boxBorder: 'border-emerald-300 hover:border-emerald-500',
          accentBorder: 'border-emerald-900',
          accentText: 'text-emerald-900'
        };
      case 'purple':
      default:
        return {
          title: 'text-purple-900',
          badge: 'bg-purple-50 text-purple-700 border-purple-200',
          numberBadge: 'bg-purple-50 text-purple-700 border-purple-200',
          boxBorder: 'border-slate-300 hover:border-purple-400',
          accentBorder: 'border-purple-700',
          accentText: 'text-purple-700'
        };
    }
  };

  const themeClasses = getThemeClasses();

  // Column width classes depending on layout
  const getColumnLayout = () => {
    switch (renderSettings.layout) {
      case 'stacked':
        return {
          container: 'flex flex-col gap-4',
          leftCol: 'w-full',
          rightCol: 'w-full'
        };
      case 'split-40-60':
        return {
          container: 'flex flex-col md:flex-row items-stretch gap-6',
          leftCol: 'w-full md:w-[40%] shrink-0 flex flex-col justify-start',
          rightCol: 'w-full md:w-[60%] flex flex-col'
        };
      case 'split-50-50':
        return {
          container: 'flex flex-col md:flex-row items-stretch gap-6',
          leftCol: 'w-full md:w-[50%] shrink-0 flex flex-col justify-start',
          rightCol: 'w-full md:w-[50%] flex flex-col'
        };
      case 'split-30-70':
      default:
        return {
          container: 'flex flex-col md:flex-row items-stretch gap-6',
          leftCol: 'w-full md:w-[30%] shrink-0 flex flex-col justify-start',
          rightCol: 'w-full md:w-[70%] flex flex-col'
        };
    }
  };

  const colLayout = getColumnLayout();

  const renderProblemList = (level: DifferentiationLevel, title: string) => {
    let problems: { problem: ProblemDetail; level: string }[] = [];
    
    if (level === 'mix') {
      const allProblems: { problem: ProblemDetail; level: string }[] = [];
      baseLevels.forEach(bl => {
        const blProblems = content.studentWorksheet[bl] || [];
        allProblems.push(...blProblems.map(p => ({ problem: p, level: LEVEL_NAMES[bl] })));
      });
      
      if (allProblems.length > 0) {
        const count = printInfo.numberOfQuestions;
        for (let i = 0; i < count; i++) {
          const levelIndex = i % baseLevels.length;
          const targetLevel = baseLevels[levelIndex];
          const levelProblems = allProblems.filter(p => p.level === LEVEL_NAMES[targetLevel]);
          const problemIndex = Math.floor(i / baseLevels.length) % (levelProblems.length || 1);
          if (levelProblems[problemIndex]) {
            problems.push(levelProblems[problemIndex]);
          } else if (allProblems[i]) {
            problems.push(allProblems[i]);
          }
        }
      }
    } else {
      const blProblems = content.studentWorksheet[level as keyof GeneratedProblem['studentWorksheet']] || [];
      problems = blProblems.map(p => ({ problem: p, level: LEVEL_NAMES[level as keyof typeof LEVEL_NAMES] }));
    }

    if (problems.length === 0) return null;

    return (
      <div key={level} className="mt-8 first:mt-0 break-inside-avoid">
        
        {/* On-Screen Student Header (Visible when showHeader is enabled) */}
        {renderSettings.showHeader && (
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold">Name:</span>
                <span className="border-b-2 border-slate-300 w-40 sm:w-56 inline-block"></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold">Date:</span>
                <span className="border-b-2 border-slate-300 w-28 sm:w-36 inline-block"></span>
              </div>
              {renderSettings.showClassField && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">Class:</span>
                  <span className="border-b-2 border-slate-300 w-24 sm:w-32 inline-block"></span>
                </div>
              )}
              {renderSettings.showScoreField && (
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-bold">Score:</span>
                  <span className="font-mono text-purple-700 font-extrabold">____ / {problems.length}</span>
                </div>
              )}
            </div>

            {(renderSettings.customTitle || renderSettings.customSubtitle) && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex items-center justify-between">
                {renderSettings.customTitle && (
                  <span className="text-xs font-black text-purple-950 uppercase tracking-wide">
                    {renderSettings.customTitle}
                  </span>
                )}
                {renderSettings.customSubtitle && (
                  <span className="text-xs text-slate-500 italic">
                    {renderSettings.customSubtitle}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <h3 className={`text-2xl font-black mb-6 pb-2 border-b no-print ${themeClasses.title} ${themeClasses.accentBorder}`}>
          {renderSettings.customTitle || title}
        </h3>

        <div className="space-y-8">
          {problems.map(({ problem, level: pLevel }, index) => {
            const hintKey = `${level}-${index}`;
            const isHintOpen = expandedHints[hintKey] || renderSettings.showHintsIfAvailable;

            return (
              <div 
                key={`${level}-${index}`} 
                className={`break-inside-avoid border-b border-slate-200/80 pb-8 last:border-0 ${colLayout.container}`}
              >
                {/* Left Column: Question text and details */}
                <div className={colLayout.leftCol}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center border ${themeClasses.numberBadge}`}>
                        {index + 1}
                      </span>
                      <p className="font-bold text-base md:text-lg text-slate-900">Problem {index + 1}</p>
                    </div>
                    {renderSettings.showDifficultyBadge && level === 'mix' && (
                       <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border whitespace-nowrap ${themeClasses.badge}`}>
                         {pLevel}
                       </span>
                    )}
                  </div>
                  <p className={`${getFontSizeClasses()} text-slate-800 whitespace-pre-wrap font-medium`}>
                    {problem.problemText}
                  </p>

                  {/* Optional Step-by-Step Hints if problem contains them */}
                  {problem.stepByStepHints && problem.stepByStepHints.length > 0 && (
                    <div className="mt-3.5 no-print">
                      <button
                        type="button"
                        onClick={() => toggleHints(hintKey)}
                        className="flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1.5 rounded-lg border border-amber-200 transition-colors cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        <span>{isHintOpen ? 'Hide Hints' : 'Show Scaffolding Hints'}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isHintOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isHintOpen && (
                        <div className="mt-2 p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1 animate-in fade-in">
                          <p className="font-black text-[11px] uppercase tracking-wider text-amber-950 mb-1">
                            Guided Steps:
                          </p>
                          <ul className="list-disc pl-4 space-y-1">
                            {problem.stepByStepHints.map((hint, hIdx) => (
                              <li key={hIdx} className="leading-relaxed">{hint}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column: Working space box with custom texture & height */}
                <div className={colLayout.rightCol}>
                  <div 
                    className={`w-full h-full ${getWorkspaceMinHeight()} rounded-2xl border-2 ${themeClasses.boxBorder} p-4 flex flex-col justify-between transition-all`}
                    style={getPaperBgStyle()}
                  >
                    {renderSettings.showWorkspacePrompt ? (
                      <p className="text-xs text-slate-500 italic select-none">
                        {problem.workspacePrompt || 'Show your mathematical thinking & working:'}
                      </p>
                    ) : <div />}
                    <div className="flex justify-end">
                      <span className="text-[11px] text-slate-400 font-semibold select-none uppercase tracking-wider">
                        Work Space
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const renderTeacherKeyList = (level: DifferentiationLevel, title: string) => {
    let keys: { key: TeacherKeyDetail; level: string }[] = [];

    if (level === 'mix') {
      const allKeys: { key: TeacherKeyDetail; level: string }[] = [];
      baseLevels.forEach(bl => {
        const blKeys = content.teacherKey[bl] || [];
        allKeys.push(...blKeys.map(k => ({ key: k, level: LEVEL_NAMES[bl] })));
      });

      if (allKeys.length > 0) {
        const count = printInfo.numberOfQuestions;
        for (let i = 0; i < count; i++) {
          const levelIndex = i % baseLevels.length;
          const targetLevel = baseLevels[levelIndex];
          const levelKeys = allKeys.filter(k => k.level === LEVEL_NAMES[targetLevel]);
          const keyIndex = Math.floor(i / baseLevels.length) % (levelKeys.length || 1);
          if (levelKeys[keyIndex]) {
            keys.push(levelKeys[keyIndex]);
          } else if (allKeys[i]) {
            keys.push(allKeys[i]);
          }
        }
      }
    } else {
      const blKeys = content.teacherKey[level as keyof GeneratedProblem['teacherKey']] || [];
      keys = blKeys.map(k => ({ key: k, level: LEVEL_NAMES[level as keyof typeof LEVEL_NAMES] }));
    }

    if (keys.length === 0) return null;

    return (
      <div key={level} className="mt-8 first:mt-0 break-inside-avoid">
        <h3 className={`text-2xl font-black mb-6 pb-2 border-b no-print ${themeClasses.title} ${themeClasses.accentBorder}`}>
          {renderSettings.customTitle ? `${renderSettings.customTitle} — Teacher Key` : title}
        </h3>
        <div className="space-y-10">
          {keys.map(({ key, level: kLevel }, index) => (
            <div key={`${level}-key-${index}`} className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm break-inside-avoid">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-black text-slate-800">Problem {index + 1} Answer Key</h4>
                {renderSettings.showDifficultyBadge && level === 'mix' && (
                   <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${themeClasses.badge}`}>
                     {kLevel}
                   </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-bold text-purple-800 uppercase tracking-wider mb-2">Complete Solution</h5>
                    <p className="text-slate-700 whitespace-pre-wrap bg-purple-50/40 p-3 rounded-lg border border-purple-100 border-l-4 border-l-[#7c3aed]">{key.completeSolution}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-teal-800 uppercase tracking-wider mb-2">Multiple Strategies</h5>
                    <ul className="space-y-1.5">
                      {key.multipleStrategies.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-600">
                          <span className="text-teal-500 mt-1">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-2">Common Misconceptions</h5>
                    <ul className="space-y-1.5">
                      {key.commonMisconceptions.map((m, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-600">
                          <span className="text-amber-500 mt-1">⚠️</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-2">Success Criteria</h5>
                    <ul className="space-y-1.5">
                      {key.successCriteria.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-600">
                          <span className="text-indigo-500 mt-1">✓</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="prose max-w-none">
      
      {activeDifferentiationLevel && (
        <div className="flex flex-col gap-3.5 mb-6 no-print">
          
          {/* Main Controls Row */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            
            {/* View Switcher: Student vs Teacher */}
            <div className="bg-slate-100 p-1 rounded-xl flex space-x-1 shrink-0">
              <button 
                onClick={() => setActiveView('student')} 
                className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  activeView === 'student' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Student Worksheet
              </button>
              <button 
                onClick={() => setActiveView('teacher')} 
                className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  activeView === 'teacher' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Teacher Key
              </button>
            </div>
            
            {/* Action Buttons: Print, Open Tab, Save, Render Settings */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* RENDER SETTINGS BUTTON */}
              <button
                type="button"
                onClick={() => setIsRenderModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold bg-white text-slate-800 border border-slate-300 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-900 transition-all cursor-pointer shadow-2xs group"
                title="Configure worksheet rendering layout, graph grid, font sizes, ink-saver and student headers"
              >
                <Sliders className="w-4 h-4 text-purple-600 group-hover:rotate-45 transition-transform" />
                <span>Render Settings</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800">
                  {renderSettings.layout === 'stacked' ? 'Stacked' : renderSettings.layout.replace('split-', '')} • {renderSettings.paperStyle}
                </span>
              </button>

              <button 
                onClick={() => onPrint(renderSettings)} 
                className="flex items-center space-x-2 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] hover:from-[#6d28d9] hover:to-[#4338ca] text-white px-3.5 py-2 rounded-xl transition-all font-bold text-xs sm:text-sm shadow-sm hover:shadow cursor-pointer"
                title="Print worksheet using system dialog"
              >
                <StudentSheetIcon />
                <span>Print {LEVEL_NAMES[activeDifferentiationLevel]} {activeView === 'student' ? 'Worksheet' : 'Key'}</span>
              </button>

              <button 
                onClick={() => {
                  const html = generateWorksheetHtml(
                    content, 
                    activeDifferentiationLevel, 
                    activeView, 
                    {
                      mathConcept: printInfo.mathConcept,
                      gradeLevel: printInfo.gradeLevel,
                      numberOfQuestions: printInfo.numberOfQuestions
                    },
                    renderSettings
                  );
                  openPrintInNewTab(html);
                }}
                className="flex items-center space-x-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-xl transition-all font-semibold text-xs sm:text-sm border border-indigo-200 cursor-pointer"
                title="Open clean printable worksheet in a dedicated tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Tab</span>
              </button>

              <button 
                onClick={() => {
                  downloadWorksheetHtml(
                    content, 
                    activeDifferentiationLevel, 
                    activeView, 
                    {
                      mathConcept: printInfo.mathConcept,
                      gradeLevel: printInfo.gradeLevel,
                      numberOfQuestions: printInfo.numberOfQuestions
                    },
                    renderSettings
                  );
                }}
                className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl transition-all font-semibold text-xs sm:text-sm border border-slate-200 cursor-pointer"
                title="Download standalone printable HTML file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Quick Render Customization Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white rounded-2xl border border-slate-200 text-xs shadow-2xs">
            
            {/* Quick Layout & Paper Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-500 mr-1 text-[11px] uppercase tracking-wider">
                Quick Render:
              </span>
              
              {/* Layout Shortcuts */}
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => handleUpdateSettings({ ...renderSettings, layout: 'split-30-70' })}
                  className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                    renderSettings.layout === 'split-30-70' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="30% Question / 70% Workspace horizontal"
                >
                  30/70
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateSettings({ ...renderSettings, layout: 'split-40-60' })}
                  className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                    renderSettings.layout === 'split-40-60' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="40% Question / 60% Workspace horizontal"
                >
                  40/60
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateSettings({ ...renderSettings, layout: 'stacked' })}
                  className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                    renderSettings.layout === 'stacked' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Question top, full-width work box underneath"
                >
                  Stacked
                </button>
              </div>

              {/* Paper Texture Shortcuts */}
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 ml-1">
                <button
                  type="button"
                  onClick={() => handleUpdateSettings({ ...renderSettings, paperStyle: 'blank' })}
                  className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                    renderSettings.paperStyle === 'blank' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Smooth clean workspace"
                >
                  Blank
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateSettings({ ...renderSettings, paperStyle: 'grid' })}
                  className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                    renderSettings.paperStyle === 'grid' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Math Quad Graph Paper grid"
                >
                  Grid 📐
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateSettings({ ...renderSettings, paperStyle: 'lined' })}
                  className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                    renderSettings.paperStyle === 'lined' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Lined notebook paper"
                >
                  Lined ✏️
                </button>
              </div>

              {/* Ink-saver shortcut */}
              <button
                type="button"
                onClick={() => handleUpdateSettings({ 
                  ...renderSettings, 
                  themeColor: renderSettings.themeColor === 'slate' ? 'purple' : 'slate' 
                })}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer border transition-all ${
                  renderSettings.themeColor === 'slate'
                    ? 'bg-slate-800 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                title="Toggle Ink-Saver monochrome mode"
              >
                🖨️ {renderSettings.themeColor === 'slate' ? 'Ink-Saver: ON' : 'Ink-Saver'}
              </button>
            </div>

            {/* Customize More trigger */}
            <button
              type="button"
              onClick={() => setIsRenderModalOpen(true)}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Render Customizer & Header Options &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {availableLevels.length > 1 && (
        <div className="flex justify-center mb-6 border-b border-slate-200 no-print">
          <div className="flex space-x-1">
            {availableLevels.map(level => (
              <button
                key={level}
                onClick={() => setActiveDifferentiationLevel(level)}
                className={`px-4 py-2 font-bold text-sm rounded-t-xl transition-colors border-b-2 cursor-pointer ${
                  activeDifferentiationLevel === level
                    ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                    : 'border-transparent text-slate-500 hover:text-purple-600 hover:border-slate-300'
                }`}
              >
                {LEVEL_NAMES[level]}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div id="printable-area">
        <div className="print-only hidden print:block mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {renderSettings.customTitle || `Math Word Problems: ${printInfo.mathConcept}`}
          </h1>
          <h2 className="text-xl text-gray-600">
            {renderSettings.customSubtitle || `Grade ${printInfo.gradeLevel} &ndash; ${activeDifferentiationLevel ? LEVEL_NAMES[activeDifferentiationLevel] : ''} &ndash; ${activeView === 'teacher' ? 'Teacher Answer Key' : 'Student Worksheet'}`}
          </h2>
        </div>

        {activeDifferentiationLevel && (
          <>
            {activeView === 'student' && (
              <div id="student-worksheet">
                {renderProblemList(activeDifferentiationLevel, `${LEVEL_NAMES[activeDifferentiationLevel]} Problems`)}
              </div>
            )}

            {activeView === 'teacher' && (
              <div id="teacher-key">
                {renderTeacherKeyList(activeDifferentiationLevel, `${LEVEL_NAMES[activeDifferentiationLevel]} Problem Keys`)}
              </div>
            )}
          </>
        )}
      </div>

      {/* RENDER SETTINGS MODAL */}
      <RenderSettingsModal
        isOpen={isRenderModalOpen}
        onClose={() => setIsRenderModalOpen(false)}
        settings={renderSettings}
        onSave={handleUpdateSettings}
        conceptTitle={printInfo.mathConcept}
        gradeLevel={printInfo.gradeLevel}
      />
    </div>
  );
};
