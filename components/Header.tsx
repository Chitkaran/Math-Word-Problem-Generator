import React, { useState } from 'react';
import { GraduationCap, User, LogIn, LogOut, History, ChevronDown, Clock, Trash2, AlertTriangle, X, ShieldAlert, Zap, Crown } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserProfile } from '../types';

interface WorksheetHistoryItem {
  id: string;
  mathConcept: string;
  gradeLevel: string;
  createdAt: string;
}

interface AppHeaderProps {
  user: FirebaseUser | null;
  lastSync: string | null;
  history: WorksheetHistoryItem[];
  onLoadWorksheet: (id: string) => void;
  onDeleteWorksheet: (id: string) => void;
  onOpenSignIn?: () => void;
  isAdmin?: boolean;
  onOpenAdminArchive?: () => void;
  userProfile?: UserProfile | null;
  onOpenUserArea?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  user, 
  lastSync, 
  history, 
  onLoadWorksheet, 
  onDeleteWorksheet,
  onOpenSignIn,
  isAdmin = false,
  onOpenAdminArchive,
  userProfile,
  onOpenUserArea
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (onOpenSignIn) {
      onOpenSignIn();
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const executeDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingId) {
      onDeleteWorksheet(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <header className="relative z-40 px-4 pt-4 pb-3">
      <div className="container mx-auto max-w-7xl">
        {/* Sky Blue Capsule Header matching CSS selector 1 */}
        <div className="bg-[#a9e6ff] border-4 border-white rounded-2xl md:rounded-[1.75rem] px-6 py-4 flex items-center justify-between shadow-lg shadow-sky-900/10">
          
          {/* Left Brand Area */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Logo Image */}
            <img 
              src="/logo.png" 
              alt="Math Word Problem Generator Logo" 
              className="w-10 h-10 md:w-11 md:h-11 rounded-xl object-contain border border-white/40 bg-white/40 p-0.5 flex-shrink-0 shadow-md shadow-sky-900/10" 
              referrerPolicy="no-referrer"
            />

            {/* App Name matching logo branding */}
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-[#0b67a9] tracking-tight flex items-center">
                Math Word Problem
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] md:text-xs font-black uppercase tracking-wider bg-[#000000] text-white shadow-sm hidden sm:inline-block">
                Generator
              </span>
            </div>

            {/* Divider */}
            <span className="text-[#0b67a9]/40 font-light hidden lg:inline text-lg">|</span>

            {/* Tagline */}
            <p className="text-[#0b67a9] text-xs md:text-sm font-medium hidden lg:inline">
              By a Teacher, For the Teachers
            </p>

            {lastSync && user && (
              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-0.5 bg-[#0b67a9]/15 text-[#0b67a9] rounded-full border border-[#0b67a9]/20 text-[10px] font-bold uppercase tracking-wider ml-2">
                <Clock className="h-3 w-3" />
                <span>Synced {new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
          </div>

          {/* Right Action / Auth Area */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Admin Archive Vault Button (Only visible for admin chitkaran@gmail.com) */}
                {isAdmin && (
                  <button
                    onClick={onOpenAdminArchive}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs md:text-sm rounded-xl shadow-md shadow-amber-900/30 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-amber-300"
                    title="Access All Teacher Generated Problems Archive"
                  >
                    <ShieldAlert className="h-4 w-4 text-slate-950" />
                    <span className="hidden xl:inline">Admin Archive</span>
                  </button>
                )}

                {/* User Area & Quota Status Pill Button */}
                {onOpenUserArea && (
                  <button
                    onClick={onOpenUserArea}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold border border-[#0b67a9] bg-[#0b67a9] text-white shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="Open User Area: My Past Generations, Quota & Plan"
                  >
                    {userProfile?.plan === 'unlimited' ? (
                      <>
                        <Crown className="h-4 w-4 text-white fill-white flex-shrink-0" />
                        <span className="hidden sm:inline text-white">Unlimited</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px] font-black uppercase">
                          Pro
                        </span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 text-white flex-shrink-0" />
                        <span className="hidden sm:inline text-white">Free Quota:</span>
                        <span className="font-extrabold text-white">
                          {Math.max(0, (userProfile?.quotaLimit ?? 30) - (userProfile?.generationsUsedThisMonth ?? 0))}/30
                        </span>
                      </>
                    )}
                  </button>
                )}

                {/* History Dropdown Button */}
                <div className="relative">
                  <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 px-3 py-2 bg-[#0b67a9] hover:bg-[#09548a] text-white border border-[#0b67a9] rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer shadow-sm"
                    title="View saved worksheets"
                  >
                    <History className="h-4 w-4 text-white" />
                    <span className="hidden md:inline text-white">Saved Worksheets</span>
                    <span className="px-1.5 py-0.2 bg-white/20 text-white rounded-full text-[11px] font-black">
                      {history.length}
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 text-white/80 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showHistory && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-3 w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[60] overflow-hidden"
                      >
                        <div className="px-4 py-2.5 border-b border-slate-100 flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Your Saved Worksheets ({history.length})
                          </span>
                          <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600 p-1">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="max-h-80 overflow-y-auto space-y-1 p-1">
                          {history.length > 0 ? (
                            history.map(item => (
                              <div key={item.id} className="relative group rounded-xl hover:bg-indigo-50/60 transition-colors">
                                <button
                                  onClick={() => {
                                    onLoadWorksheet(item.id);
                                    setShowHistory(false);
                                  }}
                                  className="w-full text-left px-3.5 py-2.5 pr-10"
                                >
                                  <p className="font-bold text-slate-800 text-sm truncate group-hover:text-indigo-700">
                                    {item.mathConcept}
                                  </p>
                                  <div className="flex justify-between items-center mt-1 text-[11px] text-slate-500">
                                    <span>Grade {item.gradeLevel}</span>
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </button>
                                <button 
                                  onClick={(e) => confirmDelete(e, item.id)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                  title="Delete Worksheet"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-center text-slate-400 text-sm">
                              No saved worksheets yet. Generated worksheets will save automatically!
                            </div>
                          )}
                        </div>

                        {/* Dropdown Footer: User Area Quick Link */}
                        {onOpenUserArea && (
                          <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-semibold">Total: {history.length}</span>
                            <button
                              onClick={() => {
                                setShowHistory(false);
                                onOpenUserArea();
                              }}
                              className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline cursor-pointer"
                            >
                              Manage in User Area →
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Delete Confirmation Modal */}
                  <AnimatePresence>
                    {deletingId && (
                      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-sm w-full border border-slate-100 text-center"
                        >
                          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                            <AlertTriangle className="h-7 w-7 text-rose-500" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 mb-1">Delete Worksheet?</h3>
                          <p className="text-slate-500 text-xs mb-6">
                            This worksheet will be permanently removed from your account.
                          </p>
                          <div className="flex gap-2.5">
                            <button 
                              onClick={() => setDeletingId(null)}
                              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={executeDelete}
                              className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Teacher Profile & Sign Out */}
                <div className="flex items-center gap-2.5 pl-3 border-l border-[#0b67a9]/30">
                  <div 
                    onClick={onOpenUserArea} 
                    className="flex items-center gap-2 cursor-pointer group"
                    title="Open User Area"
                  >
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || ''} 
                        className="w-9 h-9 rounded-full border border-[#0b67a9]/40 shadow-sm object-cover group-hover:ring-2 group-hover:ring-[#0b67a9] transition-all" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#0b67a9] flex items-center justify-center text-white text-sm font-bold group-hover:ring-2 group-hover:ring-[#0b67a9] transition-all">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                      </div>
                    )}

                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-bold text-[#0b67a9] truncate max-w-[120px] transition-colors">
                        {user.displayName || 'Teacher'}
                      </p>
                      <span className="text-[10px] text-[#0b67a9]/70 flex items-center gap-1">
                        My Account
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={handleSignOut}
                    className="p-1.5 text-[#0b67a9] hover:text-rose-600 hover:bg-white/50 rounded-lg transition-colors ml-1 cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Sign In Button matching logo violet pill style */
              <button 
                onClick={handleSignIn}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-bold text-sm rounded-full shadow-md shadow-purple-950/40 border border-purple-400/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <User className="h-4 w-4 fill-white/20" />
                <span>Sign In</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
