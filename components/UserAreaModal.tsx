import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Sparkles, 
  Clock, 
  Calendar, 
  Zap, 
  CheckCircle2, 
  Trash2, 
  ExternalLink, 
  Search, 
  FileText, 
  GraduationCap, 
  TrendingUp, 
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Printer
} from 'lucide-react';
import type { UserProfile, SavedWorksheet, GeneratedProblem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface UserAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  history: SavedWorksheet[];
  onLoadWorksheet: (id: string) => void;
  onDeleteWorksheet: (id: string) => void;
  onUpgradePlan: (plan: 'free' | 'unlimited') => Promise<void>;
  onDirectLoadWorksheet?: (worksheet: GeneratedProblem, concept: string, grade: string, count: number) => void;
}

export const UserAreaModal: React.FC<UserAreaModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  history,
  onLoadWorksheet,
  onDeleteWorksheet,
  onUpgradePlan,
  onDirectLoadWorksheet
}) => {
  const [activeTab, setActiveTab] = useState<'quota' | 'history' | 'upgrade'>('quota');
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [previewWorksheet, setPreviewWorksheet] = useState<SavedWorksheet | null>(null);

  if (!isOpen) return null;

  const isUnlimited = userProfile?.plan === 'unlimited';
  const quotaLimit = userProfile?.quotaLimit ?? 30;
  const used = userProfile?.generationsUsedThisMonth ?? 0;
  const remaining = isUnlimited ? Infinity : Math.max(0, quotaLimit - used);
  const percentUsed = isUnlimited ? 100 : Math.min(100, Math.round((used / quotaLimit) * 100));

  // Compute next month reset date (1st of next month)
  const getNextResetDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleTogglePlan = async (targetPlan: 'free' | 'unlimited') => {
    setIsUpdatingPlan(true);
    try {
      await onUpgradePlan(targetPlan);
      if (targetPlan === 'unlimited') {
        setUpgradeSuccess(true);
        setTimeout(() => setUpgradeSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.mathConcept?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || item.gradeLevel === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-5xl h-[88vh] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
      >
        {/* Top Header */}
        <div className="bg-[#182449] px-6 py-5 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-3.5">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-11 h-11 rounded-2xl object-contain border border-white/20 bg-white/10 p-1 flex-shrink-0 shadow-lg shadow-purple-950/40" 
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black tracking-tight">Teacher Account & Workspace</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 ${
                  isUnlimited 
                    ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-500/20' 
                    : 'bg-purple-500/30 text-purple-200 border border-purple-400/30'
                }`}>
                  {isUnlimited ? (
                    <>
                      <Crown className="h-3 w-3 fill-slate-950" />
                      Unlimited Pro
                    </>
                  ) : (
                    <>Free Tier ({remaining} left)</>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {userProfile?.email || 'Logged in teacher'} • Manage your monthly quota, past generations, and plan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 pt-3 flex gap-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab('quota')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'quota'
                ? 'bg-white border-purple-600 text-purple-700 shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Zap className="h-4 w-4 text-purple-600" />
            <span>My Quota</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-extrabold">
              {isUnlimited ? '∞' : `${remaining}/30`}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white border-purple-600 text-purple-700 shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Clock className="h-4 w-4 text-purple-600" />
            <span>My Past Generations</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-700 font-extrabold">
              {history.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('upgrade')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'upgrade'
                ? 'bg-white border-amber-500 text-amber-700 shadow-sm'
                : 'border-transparent text-slate-600 hover:text-amber-800 hover:bg-slate-100/80'
            }`}
          >
            <Crown className="h-4 w-4 text-amber-500" />
            <span>{isUnlimited ? 'Plan Status' : 'Upgrade to Unlimited'}</span>
            {!isUnlimited && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-400 text-slate-950 font-black uppercase">
                Pro
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/60">
          
          {/* TAB 1: QUOTA OVERVIEW */}
          {activeTab === 'quota' && (
            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* Main Quota Status Card */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">Monthly Allowance</span>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-0.5">
                      {isUnlimited ? (
                        <span className="text-indigo-600 flex items-center gap-2">
                          Unlimited Generations <Crown className="h-6 w-6 text-amber-500 fill-amber-400" />
                        </span>
                      ) : (
                        <span>
                          <strong className="text-indigo-600">{remaining}</strong> of {quotaLimit} Left This Month
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {isUnlimited 
                        ? 'Your account has active Unlimited status with zero generation limits.'
                        : `Every free teacher account receives 30 word problem generations per calendar month. Quota resets on ${getNextResetDate()}.`
                      }
                    </p>
                  </div>

                  {!isUnlimited && (
                    <button
                      onClick={() => setActiveTab('upgrade')}
                      className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs md:text-sm rounded-2xl shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      <Crown className="h-4 w-4 fill-slate-950" />
                      <span>Upgrade for Unlimited</span>
                    </button>
                  )}
                </div>

                {/* Visual Progress Meter */}
                {!isUnlimited ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>{used} Generations Used</span>
                      <span>{remaining} Remaining</span>
                    </div>
                    <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          remaining <= 5 
                            ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                            : 'bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600'
                        }`}
                        style={{ width: `${Math.max(4, percentUsed)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                      <span>Cycle: {userProfile?.currentMonth || 'Current Month'}</span>
                      <span>Resets on {getNextResetDate()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800">
                    <ShieldCheck className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold">No Limits Active</p>
                      <p className="text-emerald-700">Generate as many word problem worksheets as you need for all your classrooms without monthly restrictions.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Usage Breakdown Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                    <TrendingUp className="h-4 w-4 text-indigo-500" />
                    <span>Total Generated</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">{history.length}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Saved in your cloud archive</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>Current Month</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">{used}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Generations used this month</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span>Current Plan</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2 capitalize">{userProfile?.plan || 'Free'}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isUnlimited ? 'Unlimited access' : '30 free/month'}
                  </p>
                </div>
              </div>

              {/* Tips & Info */}
              <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-900">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-blue-950">How Quota Works</p>
                  <p className="text-blue-800 leading-relaxed">
                    Your quota is automatically deducted by 1 each time you generate a new set of word problems. 
                    Loading and printing previously saved worksheets from your <strong>Past Generations</strong> does not consume any quota!
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MY PAST GENERATIONS */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              
              {/* Filter / Search bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search your past worksheets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span>Grade:</span>
                    <select
                      value={gradeFilter}
                      onChange={(e) => setGradeFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="all">All Grades</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                        <option key={g} value={g.toString()}>Grade {g}</option>
                      ))}
                    </select>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {filteredHistory.length} saved
                  </span>
                </div>
              </div>

              {/* Generations List */}
              {filteredHistory.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                  <FileText className="h-10 w-10 text-slate-300 mx-auto" />
                  <h4 className="text-base font-bold text-slate-700">No Past Generations Found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {searchTerm 
                      ? 'No worksheets matched your search query. Try clearing the filter.' 
                      : 'When you generate word problems, they will automatically be saved here so you can reload or print them anytime without consuming quota.'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredHistory.map(item => {
                    const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';
                    const timeStr = item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                    
                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-black text-slate-900 text-base line-clamp-1">
                              {item.mathConcept}
                            </h4>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 flex-shrink-0">
                              Grade {item.gradeLevel}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {dateStr} at {timeStr}
                            </span>
                            <span>•</span>
                            <span>{item.numberOfQuestions || 5} problems</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                onLoadWorksheet(item.id);
                                onClose();
                              }}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>Load into Studio</span>
                            </button>
                            <button
                              onClick={() => setPreviewWorksheet(item)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                              Quick View
                            </button>
                          </div>

                          <button
                            onClick={() => setDeletingId(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Worksheet"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 3: UPGRADE TO UNLIMITED */}
          {activeTab === 'upgrade' && (
            <div className="max-w-3xl mx-auto space-y-6">
              
              {upgradeSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900 shadow-sm animate-bounce">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="font-black text-sm">Congratulations! Your account is now Unlimited Pro!</p>
                    <p className="text-xs text-emerald-700">You can now generate unlimited curriculum-aligned word problems without monthly limits.</p>
                  </div>
                </div>
              )}

              {/* Plans Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Free Plan Card */}
                <div className={`bg-white rounded-3xl p-6 border-2 transition-all flex flex-col justify-between ${
                  !isUnlimited ? 'border-indigo-600 shadow-lg' : 'border-slate-200'
                }`}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Starter Tier</span>
                      {!isUnlimited && (
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                          Current Plan
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">Free Teacher</h3>
                      <p className="text-xs text-slate-500 mt-1">Perfect for single classroom needs</p>
                    </div>
                    <div className="text-3xl font-black text-slate-900">
                      $0 <span className="text-xs font-normal text-slate-400">/ forever</span>
                    </div>

                    <div className="space-y-2.5 pt-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                        <span><strong>30 Free Generations</strong> every month</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                        <span>Differentiated problems (3 tiers)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                        <span>Full teacher solutions & step hints</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                        <span>Save & Print anytime</span>
                      </div>
                    </div>
                  </div>

                  {isUnlimited && (
                    <div className="pt-6">
                      <button
                        onClick={() => handleTogglePlan('free')}
                        disabled={isUpdatingPlan}
                        className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                      >
                        Switch back to Free Plan
                      </button>
                    </div>
                  )}
                </div>

                {/* Unlimited Pro Plan Card */}
                <div className={`bg-gradient-to-b from-indigo-900 via-[#182449] to-slate-950 text-white rounded-3xl p-6 border-2 relative overflow-hidden flex flex-col justify-between ${
                  isUnlimited ? 'border-amber-400 shadow-xl shadow-indigo-900/30' : 'border-amber-400/80 shadow-lg'
                }`}>
                  {/* Gold Badge */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                    Unlimited
                  </div>

                  <div className="space-y-4">
                    <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Crown className="h-4 w-4 fill-amber-300" />
                      <span>Professional Educator</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">Unlimited Pro</h3>
                      <p className="text-xs text-slate-300 mt-1">For active teachers, grade teams & tutors</p>
                    </div>
                    <div className="text-3xl font-black text-white">
                      Unlimited <span className="text-xs font-normal text-amber-300">/ no cap</span>
                    </div>

                    <div className="space-y-2.5 pt-2 text-xs text-slate-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        <span><strong>∞ Unlimited Generations</strong> every month</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        <span>Zero monthly quota restriction</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        <span>Priority streaming generation speed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        <span>Unlimited cloud worksheet storage</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        <span>All future teacher tool expansions</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    {isUnlimited ? (
                      <div className="p-3 bg-white/10 rounded-2xl text-center text-xs font-bold text-amber-300 border border-amber-400/30 flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Active Plan: Unlimited Access</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleTogglePlan('unlimited')}
                        disabled={isUpdatingPlan}
                        className="w-full py-3 px-6 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {isUpdatingPlan ? 'Activating Unlimited...' : 'Upgrade to Unlimited Now'}
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Quick View Worksheet Modal */}
        <AnimatePresence>
          {previewWorksheet && (
            <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl shadow-2xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden border border-slate-200"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{previewWorksheet.mathConcept}</h3>
                    <p className="text-xs text-slate-400">Grade {previewWorksheet.gradeLevel} • {new Date(previewWorksheet.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => setPreviewWorksheet(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                  {(['scaffolded', 'onLevel', 'challenge'] as const).map(level => {
                    const problems = previewWorksheet.content?.studentWorksheet?.[level] || [];
                    if (problems.length === 0) return null;
                    return (
                      <div key={level} className="space-y-2">
                        <span className="text-xs font-black uppercase text-indigo-700 tracking-wider">
                          {level === 'scaffolded' ? 'Scaffolded' : level === 'onLevel' ? 'On-Level' : 'Challenge'}
                        </span>
                        {problems.map((p, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded-xl text-xs text-slate-800 border border-slate-100">
                            <p className="font-semibold">{idx + 1}. {p.problemText}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      onLoadWorksheet(previewWorksheet.id);
                      setPreviewWorksheet(null);
                      onClose();
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Load into Studio
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deletingId && (
            <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-sm w-full border border-slate-100 text-center"
              >
                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <Trash2 className="h-7 w-7 text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Delete Worksheet?</h3>
                <p className="text-slate-500 text-xs mb-6">
                  This worksheet will be removed from your past generations.
                </p>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setDeletingId(null)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onDeleteWorksheet(deletingId);
                      setDeletingId(null);
                    }}
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
