import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  X, 
  Calendar, 
  User, 
  Mail, 
  GraduationCap, 
  BookOpen, 
  Download, 
  Trash2, 
  ChevronRight, 
  CheckCircle2, 
  FileText, 
  ArrowLeft,
  Filter,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import type { GlobalGeneration, GeneratedProblem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AdminArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadWorksheet: (worksheet: GeneratedProblem, concept: string, grade: string, count: number) => void;
}

export const AdminArchiveModal: React.FC<AdminArchiveModalProps> = ({ 
  isOpen, 
  onClose, 
  onLoadWorksheet 
}) => {
  const [generations, setGenerations] = useState<GlobalGeneration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<GlobalGeneration | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);

    const q = query(
      collection(db, 'global_generations'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: GlobalGeneration[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as GlobalGeneration));
      setGenerations(items);
      setIsLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'global_generations');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'global_generations', id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      setDeletingId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `global_generations/${id}`);
    }
  };

  const filteredItems = generations.filter(item => {
    const matchesSearch = 
      item.mathConcept?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.teacherEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.teacherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.genre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = gradeFilter === 'all' || item.gradeLevel === gradeFilter;

    return matchesSearch && matchesGrade;
  });

  const exportAllAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(generations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `teacher-generations-archive-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-6xl h-[90vh] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
      >
        {/* Modal Top Header */}
        <div className="bg-[#182449] px-6 py-5 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-10 h-10 rounded-xl object-contain border border-white/20 bg-white/10 p-1 flex-shrink-0 shadow-md" 
              referrerPolicy="no-referrer" 
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">Admin Vault: Teacher Generations</h2>
                <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Admin Only
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Viewing global archive for <span className="font-semibold text-amber-200">chitkaran@gmail.com</span> • {generations.length} total generated worksheets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportAllAsJSON}
              disabled={generations.length === 0}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              title="Export all records as JSON"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Content: Split List and Inspector */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden bg-slate-50">
          
          {/* Left Column: List of Generations */}
          <div className={`w-full md:w-5/12 lg:w-4/12 border-r border-slate-200 flex flex-col bg-white ${selectedItem ? 'hidden md:flex' : 'flex'}`}>
            
            {/* Filter and Search Bar */}
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by topic, teacher email, name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <span>Grade:</span>
                  <select
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="all">All Grades</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                      <option key={g} value={g.toString()}>Grade {g}</option>
                    ))}
                  </select>
                </div>
                <span className="font-bold text-slate-600">{filteredItems.length} records</span>
              </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold">Loading archive...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="py-16 text-center text-slate-400 px-4">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="text-xs font-bold text-slate-600">No generations found</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {searchTerm ? 'Try adjusting your search criteria.' : 'When teachers generate problems, they will appear here automatically.'}
                  </p>
                </div>
              ) : (
                filteredItems.map(item => {
                  const isSelected = selectedItem?.id === item.id;
                  const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';
                  const timeStr = item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`
                        p-3.5 rounded-2xl cursor-pointer transition-all border
                        ${isSelected 
                          ? 'bg-indigo-50/80 border-indigo-200 shadow-sm' 
                          : 'bg-white hover:bg-slate-50 border-transparent hover:border-slate-100'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-black text-slate-900 text-sm line-clamp-1">
                          {item.mathConcept}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 flex-shrink-0">
                          Gr {item.gradeLevel}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
                        <Mail className="h-3 w-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate font-medium">{item.teacherEmail}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="truncate max-w-[100px]">{item.teacherName || 'Teacher'}</span>
                        </span>
                        <span>{dateStr} {timeStr}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Right Column: Problem Inspector */}
          <div className={`flex-1 flex flex-col bg-slate-50 overflow-hidden ${selectedItem ? 'flex' : 'hidden md:flex'}`}>
            {selectedItem ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                
                {/* Detail Top bar */}
                <div className="p-4 md:p-6 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg md:text-xl font-black text-slate-900">
                          {selectedItem.mathConcept}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                          Grade {selectedItem.gradeLevel}
                        </span>
                        {selectedItem.genre && (
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                            {selectedItem.genre}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Generated by <span className="font-semibold text-slate-700">{selectedItem.teacherName}</span> ({selectedItem.teacherEmail}) on {new Date(selectedItem.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onLoadWorksheet(
                          selectedItem.content, 
                          selectedItem.mathConcept, 
                          selectedItem.gradeLevel, 
                          selectedItem.numberOfQuestions || 5
                        );
                        onClose();
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Load into Studio</span>
                    </button>

                    <button
                      onClick={() => setDeletingId(selectedItem.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete from archive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Student vs Teacher Tabs */}
                <div className="px-6 pt-4 bg-white border-b border-slate-100 flex gap-4">
                  <button
                    onClick={() => setActiveTab('student')}
                    className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition-all ${
                      activeTab === 'student'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Student Problems
                  </button>
                  <button
                    onClick={() => setActiveTab('teacher')}
                    className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition-all ${
                      activeTab === 'teacher'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Teacher Answer Key & Solutions
                  </button>
                </div>

                {/* Worksheet Problems Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {activeTab === 'student' ? (
                    <div className="space-y-6 max-w-4xl mx-auto">
                      {(['scaffolded', 'onLevel', 'challenge'] as const).map(levelKey => {
                        const problems = selectedItem.content?.studentWorksheet?.[levelKey] || [];
                        if (problems.length === 0) return null;

                        const levelTitle = 
                          levelKey === 'scaffolded' ? 'Level 1: Scaffolded (Accessible Entry)' :
                          levelKey === 'onLevel' ? 'Level 2: On-Level (Target Proficiency)' :
                          'Level 3: Challenge (Deep Rigor)';

                        return (
                          <div key={levelKey} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                            <h4 className="font-black text-sm uppercase tracking-wider text-indigo-800 border-b border-indigo-50 pb-2">
                              {levelTitle}
                            </h4>
                            <div className="space-y-4">
                              {problems.map((prob, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                                      Problem {idx + 1}
                                    </span>
                                  </div>
                                  <p className="text-slate-800 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                                    {prob.problemText}
                                  </p>

                                  {prob.stepByStepHints && prob.stepByStepHints.length > 0 && (
                                    <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/60 rounded-lg text-xs space-y-1">
                                      <p className="font-bold text-amber-800">💡 Step-by-Step Hints:</p>
                                      <ul className="list-disc list-inside text-slate-600 pl-1 space-y-0.5">
                                        {prob.stepByStepHints.map((hint, hIdx) => (
                                          <li key={hIdx}>{hint}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-6 max-w-4xl mx-auto">
                      {(['scaffolded', 'onLevel', 'challenge'] as const).map(levelKey => {
                        const keys = selectedItem.content?.teacherKey?.[levelKey] || [];
                        if (keys.length === 0) return null;

                        const levelTitle = 
                          levelKey === 'scaffolded' ? 'Teacher Key: Scaffolded' :
                          levelKey === 'onLevel' ? 'Teacher Key: On-Level' :
                          'Teacher Key: Challenge';

                        return (
                          <div key={levelKey} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                            <h4 className="font-black text-sm uppercase tracking-wider text-emerald-800 border-b border-emerald-50 pb-2">
                              {levelTitle}
                            </h4>
                            <div className="space-y-4">
                              {keys.map((keyItem, idx) => (
                                <div key={idx} className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-100 space-y-3">
                                  <p className="font-bold text-xs text-emerald-800 uppercase tracking-wider">
                                    Solution {idx + 1}
                                  </p>
                                  
                                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 whitespace-pre-wrap">
                                    <p className="font-bold text-slate-900 mb-1">Complete Solution:</p>
                                    {keyItem.completeSolution}
                                  </div>

                                  {keyItem.multipleStrategies && keyItem.multipleStrategies.length > 0 && (
                                    <div className="text-xs space-y-1">
                                      <p className="font-bold text-slate-700">Alternative Strategies:</p>
                                      <ul className="list-disc list-inside text-slate-600 pl-1">
                                        {keyItem.multipleStrategies.map((strat, sIdx) => (
                                          <li key={sIdx}>{strat}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {keyItem.commonMisconceptions && keyItem.commonMisconceptions.length > 0 && (
                                    <div className="text-xs space-y-1">
                                      <p className="font-bold text-rose-700">Common Misconceptions:</p>
                                      <ul className="list-disc list-inside text-slate-600 pl-1">
                                        {keyItem.commonMisconceptions.map((misc, mIdx) => (
                                          <li key={mIdx}>{misc}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
                  <FileText className="h-8 w-8" />
                </div>
                <h4 className="text-base font-bold text-slate-700">Select a Generation</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Click on any record from the left list to inspect the problems, hints, and teacher answer keys created by teachers.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deletingId && (
            <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-sm w-full border border-slate-100 text-center"
              >
                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <Trash2 className="h-7 w-7 text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Delete Archive Record?</h3>
                <p className="text-slate-500 text-xs mb-6">
                  This generation will be permanently deleted from the admin archive.
                </p>
                <div className="flex gap-2.5">
                  <button 
                    onClick={() => setDeletingId(null)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => deletingId && handleDelete(deletingId)}
                    className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};
