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
  ExternalLink,
  Users,
  Crown,
  Settings,
  RefreshCw,
  Copy,
  Check,
  BarChart3,
  Flame,
  Clock,
  Layers,
  ShieldCheck,
  AlertCircle,
  Server,
  Globe,
  Terminal,
  Key
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import type { GlobalGeneration, GeneratedProblem, UserProfile, SavedWorksheet } from '../types';
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
  // Navigation Tabs: 'users', 'generations', or 'render'
  const [adminSection, setAdminSection] = useState<'users' | 'generations' | 'render'>('users');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // --- Users State ---
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userPlanFilter, setUserPlanFilter] = useState<'all' | 'free' | 'unlimited'>('all');
  const [userSortBy, setUserSortBy] = useState<'updated' | 'usage' | 'name' | 'email'>('updated');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit User Quota/Plan Modal
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editPlan, setEditPlan] = useState<'free' | 'unlimited'>('free');
  const [editQuotaLimit, setEditQuotaLimit] = useState<number>(30);
  const [editUsage, setEditUsage] = useState<number>(0);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);

  // View User Worksheets Drawer/Modal
  const [viewingUserWorksheets, setViewingUserWorksheets] = useState<UserProfile | null>(null);
  const [userWorksheets, setUserWorksheets] = useState<SavedWorksheet[]>([]);
  const [isLoadingWorksheets, setIsLoadingWorksheets] = useState(false);

  // --- Generations State ---
  const [generations, setGenerations] = useState<GlobalGeneration[]>([]);
  const [isGenerationsLoading, setIsGenerationsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<GlobalGeneration | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');

  // 1. Fetch Users Real-time
  useEffect(() => {
    if (!isOpen) return;
    setIsUsersLoading(true);

    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const list: UserProfile[] = snapshot.docs.map(docSnap => ({
        ...docSnap.data()
      } as UserProfile));
      setUsers(list);
      setIsUsersLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'users');
      setIsUsersLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  // 2. Fetch Generations Archive Real-time
  useEffect(() => {
    if (!isOpen) return;
    setIsGenerationsLoading(true);

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
      setIsGenerationsLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'global_generations');
      setIsGenerationsLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open User Edit Modal
  const handleOpenEditUser = (u: UserProfile) => {
    setEditingUser(u);
    setEditPlan(u.plan || 'free');
    setEditQuotaLimit(u.quotaLimit ?? 30);
    setEditUsage(u.generationsUsedThisMonth ?? 0);
  };

  // Save User Edit
  const handleSaveUser = async () => {
    if (!editingUser) return;
    setIsSavingUser(true);
    try {
      const userRef = doc(db, 'users', editingUser.userId);
      await updateDoc(userRef, {
        plan: editPlan,
        quotaLimit: Number(editQuotaLimit),
        generationsUsedThisMonth: Number(editUsage),
        updatedAt: new Date().toISOString()
      });
      setEditingUser(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${editingUser.userId}`);
    } finally {
      setIsSavingUser(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (userToDelete: UserProfile) => {
    try {
      await deleteDoc(doc(db, 'users', userToDelete.userId));
      setDeletingUser(null);
      if (viewingUserWorksheets?.userId === userToDelete.userId) {
        setViewingUserWorksheets(null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${userToDelete.userId}`);
    }
  };

  // Load User Worksheets
  const handleViewUserWorksheets = async (u: UserProfile) => {
    setViewingUserWorksheets(u);
    setIsLoadingWorksheets(true);
    setUserWorksheets([]);
    try {
      const wsRef = collection(db, 'users', u.userId, 'worksheets');
      const q = query(wsRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list: SavedWorksheet[] = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as SavedWorksheet));
      setUserWorksheets(list);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `users/${u.userId}/worksheets`);
    } finally {
      setIsLoadingWorksheets(false);
    }
  };

  // Delete Generation
  const handleDeleteGeneration = async (id: string) => {
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

  // Filtered & Sorted Users
  const filteredUsers = users.filter(u => {
    const term = userSearchTerm.toLowerCase();
    const matchesSearch = 
      (u.displayName || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.userId || '').toLowerCase().includes(term);

    const matchesPlan = userPlanFilter === 'all' || u.plan === userPlanFilter;
    return matchesSearch && matchesPlan;
  }).sort((a, b) => {
    if (userSortBy === 'updated') {
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    }
    if (userSortBy === 'usage') {
      return (b.generationsUsedThisMonth || 0) - (a.generationsUsedThisMonth || 0);
    }
    if (userSortBy === 'name') {
      return (a.displayName || '').localeCompare(b.displayName || '');
    }
    if (userSortBy === 'email') {
      return (a.email || '').localeCompare(b.email || '');
    }
    return 0;
  });

  // Filtered Generations
  const filteredGenerations = generations.filter(item => {
    const matchesSearch = 
      item.mathConcept?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.teacherEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.teacherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.genre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = gradeFilter === 'all' || item.gradeLevel === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  // Export Users CSV
  const exportUsersAsCSV = () => {
    const headers = ['User ID', 'Name', 'Email', 'Plan', 'Quota Limit', 'Used This Month', 'Current Month', 'Last Updated'];
    const rows = users.map(u => [
      `"${u.userId || ''}"`,
      `"${(u.displayName || '').replace(/"/g, '""')}"`,
      `"${u.email || ''}"`,
      `"${u.plan || 'free'}"`,
      u.quotaLimit ?? 30,
      u.generationsUsedThisMonth ?? 0,
      `"${u.currentMonth || ''}"`,
      `"${u.updatedAt || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `registered-users-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Export Users JSON
  const exportUsersAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(users, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `registered-users-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export Generations JSON
  const exportAllGenerationsAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(generations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `teacher-generations-archive-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Aggregate Stats
  const totalGenerationsUsed = users.reduce((acc, u) => acc + (u.generationsUsedThisMonth || 0), 0);
  const activeUsersCount = users.filter(u => (u.generationsUsedThisMonth || 0) > 0).length;
  const unlimitedUsersCount = users.filter(u => u.plan === 'unlimited').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/65 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-7xl h-[92vh] bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
      >
        {/* Top Header */}
        <div className="bg-[#101935] px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between text-white flex-shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">Admin Control Panel</h2>
                <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Admin Only
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Logged in as <span className="font-semibold text-amber-200">aiteachertools.ca@gmail.com</span> • Live Firebase Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Admin Panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs & Action Bar */}
        <div className="bg-white border-b border-slate-200 px-5 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAdminSection('users')}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                adminSection === 'users'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Registered Users</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                adminSection === 'users' ? 'bg-purple-800 text-purple-100' : 'bg-slate-200 text-slate-700'
              }`}>
                {users.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAdminSection('generations')}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                adminSection === 'generations'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Teacher Generations Vault</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                adminSection === 'generations' ? 'bg-purple-800 text-purple-100' : 'bg-slate-200 text-slate-700'
              }`}>
                {generations.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAdminSection('render')}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                adminSection === 'render'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>Render Deployment</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                adminSection === 'render' ? 'bg-purple-800 text-purple-100' : 'bg-emerald-100 text-emerald-800'
              }`}>
                Settings
              </span>
            </button>
          </div>

          {/* Quick Export / Link Buttons */}
          <div className="flex items-center gap-2">
            {adminSection === 'users' && (
              <>
                <button
                  type="button"
                  onClick={exportUsersAsCSV}
                  disabled={users.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  title="Export Users as CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={exportUsersAsJSON}
                  disabled={users.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  title="Export Users as JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </>
            )}

            {adminSection === 'generations' && (
              <button
                type="button"
                onClick={exportAllGenerationsAsJSON}
                disabled={generations.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                title="Export Generations as JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            )}

            {adminSection === 'render' && (
              <a
                href="https://dashboard.render.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                <span>Render Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 1: REGISTERED USERS MANAGEMENT                         */}
        {/* ============================================================== */}
        {adminSection === 'users' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50">
            {/* Top Metrics Cards */}
            <div className="p-4 sm:p-6 bg-white border-b border-slate-200/80">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-6xl mx-auto">
                {/* Total Users */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Registered Users</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-900">{users.length}</p>
                  </div>
                </div>

                {/* Active This Month */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Active This Month</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-900">{activeUsersCount}</p>
                  </div>
                </div>

                {/* Unlimited Plans */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Unlimited Plans</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-900">{unlimitedUsersCount}</p>
                  </div>
                </div>

                {/* Total Generations Used */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Generations Used</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-900">{totalGenerationsUsed}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 sm:px-6 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by teacher name, email, or user ID..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                {/* Plan Filter */}
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span>Plan:</span>
                  <select
                    value={userPlanFilter}
                    onChange={(e) => setUserPlanFilter(e.target.value as any)}
                    className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="all">All Plans</option>
                    <option value="free">Free Tier (30/mo)</option>
                    <option value="unlimited">Unlimited Tier</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="flex items-center gap-1.5">
                  <span>Sort by:</span>
                  <select
                    value={userSortBy}
                    onChange={(e) => setUserSortBy(e.target.value as any)}
                    className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="updated">Recent Activity</option>
                    <option value="usage">Highest Quota Usage</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="email">Email (A-Z)</option>
                  </select>
                </div>

                <span className="font-bold text-slate-600 pl-2">
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
                </span>
              </div>
            </div>

            {/* Users Table / Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {isUsersLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
                  <div className="w-7 h-7 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-slate-600">Loading registered users from Firestore...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-20 text-center text-slate-400 px-4">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-40 text-slate-400" />
                  <p className="text-sm font-bold text-slate-700">No registered users found</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {userSearchTerm 
                      ? 'No users match your search or filter criteria.' 
                      : 'As teachers sign in and use the generator, their profiles will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                          <th className="py-3 px-4">User / Teacher</th>
                          <th className="py-3 px-4">Plan Status</th>
                          <th className="py-3 px-4">Monthly Quota Usage</th>
                          <th className="py-3 px-4">Billing Period</th>
                          <th className="py-3 px-4">Last Active</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredUsers.map((u) => {
                          const isUnlimited = u.plan === 'unlimited';
                          const quotaLimit = u.quotaLimit ?? 30;
                          const usedCount = u.generationsUsedThisMonth ?? 0;
                          const usagePercent = isUnlimited ? 0 : Math.min(100, Math.round((usedCount / quotaLimit) * 100));
                          const isQuotaExceeded = !isUnlimited && usedCount >= quotaLimit;

                          const initials = (u.displayName || u.email || 'T')
                            .split(' ')
                            .map(n => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase();

                          return (
                            <tr key={u.userId} className="hover:bg-slate-50/80 transition-colors">
                              {/* User Info */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                    isUnlimited 
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                      : 'bg-purple-100 text-purple-800 border border-purple-200'
                                  }`}>
                                    {initials}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-900 truncate">{u.displayName || 'Teacher'}</span>
                                      {(u.email === 'aiteachertools.ca@gmail.com' || u.email === 'chitkaran@gmail.com') && (
                                        <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-black rounded border border-amber-300">
                                          ADMIN
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-slate-500 text-[11px] truncate">{u.email}</p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <span className="text-[10px] text-slate-400 font-mono">UID: {u.userId.slice(0, 8)}...</span>
                                      <button
                                        type="button"
                                        onClick={() => handleCopy(u.userId, u.userId)}
                                        className="text-slate-400 hover:text-slate-600 transition-colors"
                                        title="Copy full UID"
                                      >
                                        {copiedId === u.userId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Plan Status */}
                              <td className="py-3.5 px-4">
                                {isUnlimited ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-100 to-amber-200 text-amber-900 border border-amber-300">
                                    <Crown className="w-3 h-3 text-amber-600" />
                                    <span>Unlimited</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                    <span>Free ({quotaLimit}/mo)</span>
                                  </span>
                                )}
                              </td>

                              {/* Quota Usage */}
                              <td className="py-3.5 px-4 min-w-[160px]">
                                {isUnlimited ? (
                                  <div>
                                    <div className="flex items-center gap-1 text-slate-700 font-bold">
                                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                      <span>{usedCount} generated</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">No monthly quota cap</span>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                                      <span className={isQuotaExceeded ? 'text-rose-600' : 'text-slate-700'}>
                                        {usedCount} / {quotaLimit} used
                                      </span>
                                      <span className="text-[10px] text-slate-400">{usagePercent}%</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                                      <div 
                                        className={`h-full transition-all rounded-full ${
                                          isQuotaExceeded 
                                            ? 'bg-rose-500' 
                                            : usagePercent > 80 
                                            ? 'bg-amber-500' 
                                            : 'bg-purple-600'
                                        }`}
                                        style={{ width: `${usagePercent}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </td>

                              {/* Billing Period */}
                              <td className="py-3.5 px-4">
                                <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {u.currentMonth || new Date().toISOString().slice(0, 7)}
                                </span>
                              </td>

                              {/* Last Active */}
                              <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                                {u.updatedAt ? new Date(u.updatedAt).toLocaleString() : 'N/A'}
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* View Worksheets */}
                                  <button
                                    type="button"
                                    onClick={() => handleViewUserWorksheets(u)}
                                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                    title="View worksheets saved by this teacher"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </button>

                                  {/* Edit Plan / Quota */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditUser(u)}
                                    className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                                    title="Edit user plan & monthly quota"
                                  >
                                    <Settings className="w-4 h-4" />
                                  </button>

                                  {/* Delete User */}
                                  {u.email !== 'aiteachertools.ca@gmail.com' && u.email !== 'chitkaran@gmail.com' && (
                                    <button
                                      type="button"
                                      onClick={() => setDeletingUser(u)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                      title="Delete user profile"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 2: TEACHER GENERATIONS VAULT ARCHIVE                   */}
        {/* ============================================================== */}
        {adminSection === 'generations' && (
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
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  <span className="font-bold text-slate-600">{filteredGenerations.length} records</span>
                </div>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
                {isGenerationsLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
                    <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-semibold">Loading archive...</p>
                  </div>
                ) : filteredGenerations.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 px-4">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="text-xs font-bold text-slate-600">No generations found</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {searchTerm ? 'Try adjusting your search criteria.' : 'When teachers generate problems, they will appear here automatically.'}
                    </p>
                  </div>
                ) : (
                  filteredGenerations.map(item => {
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
                            ? 'bg-purple-50/80 border-purple-200 shadow-xs' 
                            : 'bg-white hover:bg-slate-50 border-transparent hover:border-slate-100'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="font-black text-slate-900 text-sm line-clamp-1">
                            {item.mathConcept}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 flex-shrink-0">
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
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-200 transition-all cursor-pointer"
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
                      className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                        activeTab === 'student'
                          ? 'border-purple-600 text-purple-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Student Problems
                    </button>
                    <button
                      onClick={() => setActiveTab('teacher')}
                      className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                        activeTab === 'teacher'
                          ? 'border-purple-600 text-purple-600'
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
                            <div key={levelKey} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                              <h4 className="font-black text-sm uppercase tracking-wider text-purple-900 border-b border-purple-50 pb-2">
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
                            <div key={levelKey} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
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
                  <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
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
        )}

        {/* ============================================================== */}
        {/* SECTION 3: RENDER.COM DEPLOYMENT SETTINGS                      */}
        {/* ============================================================== */}
        {adminSection === 'render' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-slate-50 p-4 sm:p-6 md:p-8 space-y-6">
            <div className="max-w-5xl mx-auto w-full space-y-6">
              
              {/* Top Banner */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-purple-300 shrink-0">
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white">Render.com Deployment Configuration</h3>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black rounded-full uppercase tracking-wider">
                        Production Ready
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      Deploy this application as a <strong>Web Service</strong> on Render with the server-side Express backend and Vite client build.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="https://dashboard.render.com/select-repo?type=web"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-900/50 cursor-pointer"
                  >
                    <span>Deploy on Render</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Service Form Settings */}
              <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-indigo-600" />
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      1. Web Service Form Settings
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    Use these exact values in your Render dashboard
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Service Type */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Service Type</span>
                      <span className="text-[10px] font-black px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md">
                        CRITICAL
                      </span>
                    </div>
                    <p className="text-sm font-black text-slate-900">Web Service</p>
                    <p className="text-[11px] text-slate-500">
                      Do <em>not</em> choose Static Site. The app requires Express backend for AI generation.
                    </p>
                  </div>

                  {/* Runtime */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <span className="text-xs font-bold text-slate-500">Language / Runtime</span>
                    <p className="text-sm font-black text-slate-900">Node</p>
                    <p className="text-[11px] text-slate-500">Compatible with Node.js 18, 20, or 22</p>
                  </div>

                  {/* Build Command */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Build Command</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('npm install && npm run build', 'build_cmd')}
                        className="flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
                      >
                        {copiedField === 'build_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'build_cmd' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <code className="block p-2 rounded-lg bg-slate-900 text-amber-300 font-mono text-xs select-all">
                      npm install &amp;&amp; npm run build
                    </code>
                    <p className="text-[11px] text-slate-500">
                      Builds Vite assets and bundles <code className="text-slate-700">server.ts</code> to <code className="text-slate-700">dist/server.cjs</code>.
                    </p>
                  </div>

                  {/* Start Command */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Start Command</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('npm run start', 'start_cmd')}
                        className="flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
                      >
                        {copiedField === 'start_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'start_cmd' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <code className="block p-2 rounded-lg bg-slate-900 text-amber-300 font-mono text-xs select-all">
                      npm run start
                    </code>
                    <p className="text-[11px] text-slate-500">
                      Starts the bundled Node server on the port assigned by Render.
                    </p>
                  </div>

                  {/* Health Check */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Health Check Path (Advanced)</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('/api/health', 'health_path')}
                        className="flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
                      >
                        {copiedField === 'health_path' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'health_path' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <code className="block p-2 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs select-all">
                      /api/health
                    </code>
                    <p className="text-[11px] text-slate-500">
                      Render verifies zero-downtime deploys using this endpoint.
                    </p>
                  </div>

                  {/* Plan / Instance */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <span className="text-xs font-bold text-slate-500">Instance Plan</span>
                    <p className="text-sm font-black text-slate-900">Free or Starter</p>
                    <p className="text-[11px] text-slate-500">
                      Free works with 512MB RAM. Starter ($7/mo) stays online 24/7 with no cold starts.
                    </p>
                  </div>

                </div>
              </div>

              {/* Environment Variables */}
              <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-amber-600" />
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      2. Required Environment Variables
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    Add in Render Dashboard ➔ Environment tab
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-purple-700">NODE_ENV</span>
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded">
                          Required
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Value should be: <code className="font-bold text-slate-800">production</code></p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('production', 'env_node')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      {copiedField === 'env_node' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Value</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-amber-700">GEMINI_API_KEY</span>
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                          Required
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Your Google Gemini API Key from Google AI Studio
                      </p>
                    </div>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-sm"
                    >
                      <span>Get Gemini Key</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs">
                    <p className="font-bold">ℹ️ Note regarding PORT:</p>
                    <p className="text-blue-700 mt-0.5">
                      You do <strong>not</strong> need to set <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">PORT</code> manually. Render automatically provides a dynamic port and sets the <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">PORT</code> variable which the application reads automatically.
                    </p>
                  </div>
                </div>
              </div>

              {/* Crucial Post-Deploy Step: Firebase Authorized Domain */}
              <div className="bg-amber-50/80 rounded-3xl p-5 sm:p-7 border border-amber-300 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-950 uppercase tracking-wider">
                      3. Critical Step: Authorize Render Domain in Firebase
                    </h4>
                    <p className="text-xs text-amber-800">
                      Required for Google Sign-in to work on your Render live domain
                    </p>
                  </div>
                </div>

                <ol className="list-decimal list-inside text-xs text-amber-900 space-y-1.5 pl-1 leading-relaxed">
                  <li>Deploy your service on Render and copy your live URL (e.g. <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">your-app.onrender.com</code>).</li>
                  <li>Open the <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline font-bold text-amber-950">Firebase Console</a> and select your project.</li>
                  <li>Navigate to <strong>Authentication</strong> ➔ <strong>Settings</strong> tab ➔ <strong>Authorized domains</strong>.</li>
                  <li>Click <strong>Add domain</strong>, paste your Render domain (without <code className="font-mono">https://</code>), and save.</li>
                </ol>
              </div>

              {/* Blueprint render.yaml view */}
              <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-600" />
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      4. Blueprint File (render.yaml)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`services:
  - type: web
    name: math-word-problem-generator
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm run start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: GEMINI_API_KEY
        sync: false`, 'yaml_spec')}
                    className="flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
                  >
                    {copiedField === 'yaml_spec' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedField === 'yaml_spec' ? 'Copied Blueprint!' : 'Copy render.yaml'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-500">
                  This repository includes a pre-configured <code className="text-slate-800 font-bold">render.yaml</code>. If you choose &quot;Blueprint&quot; in Render, it will auto-detect everything:
                </p>

                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
{`services:
  - type: web
    name: math-word-problem-generator
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm run start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: GEMINI_API_KEY
        sync: false`}
                </pre>
              </div>

            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: EDIT USER PLAN & QUOTA                                  */}
        {/* ============================================================== */}
        <AnimatePresence>
          {editingUser && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl p-6 sm:p-7 max-w-md w-full border border-slate-100"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Edit User Quota & Plan</h3>
                      <p className="text-[11px] text-slate-500 truncate max-w-[240px]">{editingUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="py-5 space-y-4">
                  {/* Plan Switcher */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Subscription Plan
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditPlan('free')}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                          editPlan === 'free'
                            ? 'bg-purple-50 border-purple-400 text-purple-900 ring-2 ring-purple-400/20'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <User className="w-4 h-4 text-purple-600" />
                        <div>
                          <p>Free Tier</p>
                          <p className="text-[10px] text-slate-400 font-normal">Monthly quota</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditPlan('unlimited')}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                          editPlan === 'unlimited'
                            ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/20'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Crown className="w-4 h-4 text-amber-600" />
                        <div>
                          <p>Unlimited</p>
                          <p className="text-[10px] text-slate-400 font-normal">No monthly limits</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Quota Limit */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Monthly Quota Limit (Free Tier)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={editQuotaLimit}
                      onChange={(e) => setEditQuotaLimit(Number(e.target.value))}
                      disabled={editPlan === 'unlimited'}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Default is 30 problems / month.</p>
                  </div>

                  {/* Reset / Modify Usage */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Generations Used This Month ({editingUser.currentMonth || 'Current'})
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditUsage(0)}
                        className="text-[11px] font-bold text-purple-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset to 0</span>
                      </button>
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={editUsage}
                      onChange={(e) => setEditUsage(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveUser}
                    disabled={isSavingUser}
                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-200 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSavingUser ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ============================================================== */}
        {/* MODAL: VIEW TEACHER'S SAVED WORKSHEETS                         */}
        {/* ============================================================== */}
        <AnimatePresence>
          {viewingUserWorksheets && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-100"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        Worksheets by {viewingUserWorksheets.displayName || 'Teacher'}
                      </h3>
                      <p className="text-xs text-slate-500">{viewingUserWorksheets.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingUserWorksheets(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
                  {isLoadingWorksheets ? (
                    <div className="py-16 text-center text-slate-400">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs font-semibold">Loading saved worksheets...</p>
                    </div>
                  ) : userWorksheets.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                      <p className="text-xs font-bold text-slate-700">No saved worksheets found</p>
                      <p className="text-[11px] text-slate-400 mt-1">This user has not saved any worksheets yet.</p>
                    </div>
                  ) : (
                    userWorksheets.map((ws) => (
                      <div
                        key={ws.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{ws.mathConcept}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              Grade {ws.gradeLevel}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Saved on {new Date(ws.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onLoadWorksheet(ws.content, ws.mathConcept, ws.gradeLevel, ws.numberOfQuestions || 5);
                            setViewingUserWorksheets(null);
                            onClose();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Load into Studio</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 text-right shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewingUserWorksheets(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ============================================================== */}
        {/* DELETE USER CONFIRMATION                                       */}
        {/* ============================================================== */}
        <AnimatePresence>
          {deletingUser && (
            <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-sm w-full border border-slate-100 text-center"
              >
                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 mx-auto text-rose-500">
                  <Trash2 className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Delete User Profile?</h3>
                <p className="text-slate-500 text-xs mb-2">
                  Are you sure you want to delete profile for <span className="font-bold text-slate-700">{deletingUser.email}</span>?
                </p>
                <p className="text-slate-400 text-[11px] mb-6">
                  This user profile and quota configuration will be removed from Firestore.
                </p>
                <div className="flex gap-2.5">
                  <button 
                    onClick={() => setDeletingUser(null)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(deletingUser)}
                    className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ============================================================== */}
        {/* DELETE GENERATION ARCHIVE RECORD CONFIRMATION                  */}
        {/* ============================================================== */}
        <AnimatePresence>
          {deletingId && (
            <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-sm w-full border border-slate-100 text-center"
              >
                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 mx-auto text-rose-500">
                  <Trash2 className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Delete Archive Record?</h3>
                <p className="text-slate-500 text-xs mb-6">
                  This generation will be permanently deleted from the admin archive.
                </p>
                <div className="flex gap-2.5">
                  <button 
                    onClick={() => setDeletingId(null)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => deletingId && handleDeleteGeneration(deletingId)}
                    className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors cursor-pointer"
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
