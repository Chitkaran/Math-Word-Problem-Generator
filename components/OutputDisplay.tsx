
import React from 'react';
import type { GeneratedProblem, ProblemDetail, TeacherKeyDetail } from '../types';
import { LEVEL_NAMES } from '../constants';
import { GoogleDocsIcon, StudentSheetIcon } from './icons';
import { ExternalLink, Download } from 'lucide-react';
import { generateWorksheetHtml, openPrintInNewTab, downloadWorksheetHtml } from '../services/printService';

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
  onPrint: () => void;
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

  const baseLevels = (Object.keys(content.studentWorksheet) as ('scaffolded' | 'onLevel' | 'challenge')[])
    .filter(level => content.studentWorksheet[level] && content.studentWorksheet[level]!.length > 0);

  const availableLevels: DifferentiationLevel[] = [...baseLevels];
  if (baseLevels.length > 1) {
    availableLevels.push('mix');
  }

  const renderProblemList = (level: DifferentiationLevel, title: string) => {
    let problems: { problem: ProblemDetail; level: string }[] = [];
    
    if (level === 'mix') {
      const allProblems: { problem: ProblemDetail; level: string }[] = [];
      baseLevels.forEach(bl => {
        const blProblems = content.studentWorksheet[bl] || [];
        allProblems.push(...blProblems.map(p => ({ problem: p, level: LEVEL_NAMES[bl] })));
      });
      
      // Sample exactly printInfo.numberOfQuestions from allProblems, balanced if possible
      if (allProblems.length > 0) {
        const count = printInfo.numberOfQuestions;
        // Simple balanced sampling
        for (let i = 0; i < count; i++) {
            const levelIndex = i % baseLevels.length;
            const targetLevel = baseLevels[levelIndex];
            const levelProblems = allProblems.filter(p => p.level === LEVEL_NAMES[targetLevel]);
            const problemIndex = Math.floor(i / baseLevels.length) % levelProblems.length;
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
        <h3 className="text-2xl font-black text-purple-800 mb-6 pb-2 border-b border-purple-200 no-print">
          {title}
        </h3>
        <div className="space-y-12">
          {problems.map(({ problem, level: pLevel }, index) => (
            <div key={`${level}-${index}`} className="break-inside-avoid border-b border-slate-100 pb-8 last:border-0">
              <div className="flex justify-between items-center mb-4">
                <p className="font-bold text-lg text-slate-800">Problem {index + 1}</p>
                {level === 'mix' && (
                   <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                     {pLevel}
                   </span>
                )}
              </div>
              <p className="text-lg leading-relaxed mb-6 text-slate-700 whitespace-pre-wrap">{problem.problemText}</p>
              
              {problem.stepByStepHints && problem.stepByStepHints.length > 0 && (
                <div className="mb-6 p-5 border border-amber-200 bg-amber-50/50 rounded-xl">
                  <h6 className="font-bold text-sm text-amber-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">💡</span> Step-by-Step Hints
                  </h6>
                  <ol className="list-decimal list-inside text-slate-700 space-y-2">
                    {problem.stepByStepHints.map((hint, hintIndex) => (
                      <li key={hintIndex} className="pl-2">{hint}</li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="mt-6">
                <p className="font-medium text-slate-500 italic mb-4">{problem.workspacePrompt}</p>
                <div className="min-h-[12rem] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50"></div>
              </div>
            </div>
          ))}
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
            const keyIndex = Math.floor(i / baseLevels.length) % levelKeys.length;
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
        <h3 className="text-2xl font-black text-purple-800 mb-6 pb-2 border-b border-purple-200 no-print">
          {title}
        </h3>
        <div className="space-y-10">
          {keys.map(({ key, level: kLevel }, index) => (
            <div key={`${level}-key-${index}`} className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm break-inside-avoid">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-black text-slate-800">Problem {index + 1} Answer Key</h4>
                {level === 'mix' && (
                   <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 no-print gap-4">
           <div className="bg-slate-100 p-1 rounded-lg flex space-x-1">
            <button onClick={() => setActiveView('student')} className={`px-4 py-2 rounded-md font-semibold transition-colors ${activeView === 'student' ? 'bg-white text-purple-700 shadow' : 'text-slate-600 hover:bg-slate-200'}`}>Student Worksheet</button>
            <button onClick={() => setActiveView('teacher')} className={`px-4 py-2 rounded-md font-semibold transition-colors ${activeView === 'teacher' ? 'bg-white text-purple-700 shadow' : 'text-slate-600 hover:bg-slate-200'}`}>Teacher Key</button>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={onPrint} 
              className="flex items-center space-x-2 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] hover:from-[#6d28d9] hover:to-[#4338ca] text-white px-3.5 py-2 rounded-xl transition-all font-semibold text-xs sm:text-sm shadow-sm hover:shadow cursor-pointer"
              title="Print worksheet using system dialog"
            >
                <StudentSheetIcon />
                <span>Print {LEVEL_NAMES[activeDifferentiationLevel]} {activeView === 'student' ? 'Worksheet' : 'Key'}</span>
            </button>
            <button 
              onClick={() => {
                const html = generateWorksheetHtml(content, activeDifferentiationLevel, activeView, {
                  mathConcept: printInfo.mathConcept,
                  gradeLevel: printInfo.gradeLevel,
                  numberOfQuestions: printInfo.numberOfQuestions
                });
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
                downloadWorksheetHtml(content, activeDifferentiationLevel, activeView, {
                  mathConcept: printInfo.mathConcept,
                  gradeLevel: printInfo.gradeLevel,
                  numberOfQuestions: printInfo.numberOfQuestions
                });
              }}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl transition-all font-semibold text-xs sm:text-sm border border-slate-200 cursor-pointer"
              title="Download standalone printable HTML file"
            >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
            </button>
          </div>
        </div>
      )}

      {availableLevels.length > 1 && (
        <div className="flex justify-center mb-6 border-b no-print">
          <div className="flex space-x-1">
            {availableLevels.map(level => (
              <button
                key={level}
                onClick={() => setActiveDifferentiationLevel(level)}
                className={`px-4 py-2 font-semibold text-sm rounded-t-md transition-colors border-b-2 ${
                  activeDifferentiationLevel === level
                    ? 'border-purple-600 text-purple-700'
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
            <h1 className="text-3xl font-bold mb-2">Math Word Problems: {printInfo.mathConcept}</h1>
            <h2 className="text-xl text-gray-600">Grade {printInfo.gradeLevel} &ndash; {activeDifferentiationLevel ? LEVEL_NAMES[activeDifferentiationLevel] : ''} &ndash; {activeView === 'teacher' ? 'Teacher Answer Key' : 'Student Worksheet'}</h2>
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
    </div>
  );
};
