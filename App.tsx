import React, { useState, useCallback, useEffect } from 'react';
import { TopTicker } from './components/TopTicker';
import { Sidebar, MobileBottomNav } from './components/Sidebar';
import { HelpModal } from './components/HelpModal';
import { SettingsForm } from './components/SettingsForm';
import { OutputDisplay } from './components/OutputDisplay';
import { GoogleSignInModal } from './components/GoogleSignInModal';
import { AdminArchiveModal } from './components/AdminArchiveModal';
import { UserAreaModal } from './components/UserAreaModal';
import { GenerationSuccessModal } from './components/GenerationSuccessModal';
import { GeneratingPopupModal } from './components/GeneratingPopupModal';
import type { FormState, GeneratedProblem, UserProfile } from './types';
import { generateWordProblemsStream } from './services/geminiService';
import { printWorksheetDocument } from './services/printService';
import { DEFAULT_FORM_STATE } from './constants';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, doc, getDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { trackEvent } from './services/trackingService';

export default function App() {
  const [formState, setFormState] = useState<FormState>({
    ...DEFAULT_FORM_STATE,
    context: 'Real Life',
    gradeLevel: '6',
    numberOfQuestions: 5,
    mathConcept: '',
    differentiation: {
      scaffolded: false,
      onLevel: true,
      challenge: false,
    }
  });

  const [generatedContent, setGeneratedContent] = useState<GeneratedProblem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'student' | 'teacher'>('student');
  const [progress, setProgress] = useState(0);
  const [activeDifferentiationLevel, setActiveDifferentiationLevel] = useState<'scaffolded' | 'onLevel' | 'challenge' | 'mix' | null>(null);
  
  // Navigation & Modals State
  const [sidebarTab, setSidebarTab] = useState<'home' | 'saved' | 'history' | 'help'>('home');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Firebase State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [isAdminArchiveOpen, setIsAdminArchiveOpen] = useState(false);
  const [isUserAreaOpen, setIsUserAreaOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleSelectTab = (tab: 'home' | 'saved' | 'history' | 'help') => {
    setSidebarTab(tab);
    if (tab === 'saved' || tab === 'history') {
      setIsUserAreaOpen(true);
    } else if (tab === 'help') {
      setIsHelpModalOpen(true);
    }
  };

  // Check if current user is admin chitkaran@gmail.com
  const isAdmin = Boolean(
    user?.email && user.email.toLowerCase() === 'chitkaran@gmail.com'
  );

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Track login if user changes from null to authenticated
      if (currentUser && !user) {
        trackEvent({
          event: 'login',
          email: currentUser.email || currentUser.providerData[0]?.email || 'Unknown Email',
          name: currentUser.displayName || 'Teacher',
          userId: currentUser.uid
        });
      }
      
      setUser(currentUser);
      setIsAuthChecking(false);

      if (!currentUser) {
        setUserProfile(null);
        setHistory([]);
        setLastSync(null);
        setIsAdminArchiveOpen(false);
        setIsUserAreaOpen(false);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // User Profile & Monthly Quota Sync (30 free generations / month)
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const currentMonthStr = new Date().toISOString().slice(0, 7); // e.g. "2026-09"

    const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        // Check if calendar month rolled over -> auto-reset monthly count
        if (data.currentMonth !== currentMonthStr) {
          const resetProfile: UserProfile = {
            ...data,
            generationsUsedThisMonth: 0,
            currentMonth: currentMonthStr,
            updatedAt: new Date().toISOString()
          };
          try {
            await setDoc(userDocRef, resetProfile, { merge: true });
            setUserProfile(resetProfile);
          } catch (err) {
            console.error('Failed to reset monthly quota:', err);
          }
        } else {
          setUserProfile(data);
        }
      } else {
        // Initial setup for new teacher user
        const initialProfile: UserProfile = {
          userId: user.uid,
          email: user.email || user.providerData[0]?.email || 'teacher@domain.com',
          displayName: user.displayName || 'Teacher',
          plan: 'free',
          quotaLimit: 30,
          generationsUsedThisMonth: 0,
          currentMonth: currentMonthStr,
          updatedAt: new Date().toISOString()
        };
        try {
          await setDoc(userDocRef, initialProfile);
          setUserProfile(initialProfile);
        } catch (err) {
          console.error('Failed to initialize user profile:', err);
        }
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user]);

  // History Listener (Sync user's personal worksheets with Firestore)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `users/${user.uid}/worksheets`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setHistory(items);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/worksheets`);
    });

    return () => unsubscribe();
  }, [user]);

  // Plan Upgrade / Toggle Handler
  const handleUpgradePlan = async (plan: 'free' | 'unlimited') => {
    if (!user) return;
    try {
      const now = new Date().toISOString();
      const currentMonthStr = now.slice(0, 7);
      const userDocRef = doc(db, 'users', user.uid);
      
      const updatedProfile = {
        userId: user.uid,
        email: user.email || user.providerData[0]?.email || 'teacher@domain.com',
        displayName: user.displayName || 'Teacher',
        plan,
        quotaLimit: plan === 'unlimited' ? 999999 : 30,
        generationsUsedThisMonth: userProfile?.generationsUsedThisMonth ?? 0,
        currentMonth: userProfile?.currentMonth || currentMonthStr,
        updatedAt: now
      };
      await setDoc(userDocRef, updatedProfile, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      throw err;
    }
  };

  // Save to teacher's personal workspace (shows up in User Area)
  const saveWorksheet = async (content: GeneratedProblem) => {
    if (!user) return;

    try {
      const now = new Date().toISOString();
      await addDoc(collection(db, `users/${user.uid}/worksheets`), {
        userId: user.uid,
        mathConcept: formState.mathConcept,
        gradeLevel: formState.gradeLevel,
        numberOfQuestions: formState.numberOfQuestions,
        content,
        createdAt: now,
        lastSync: now
      });
      setLastSync(now);
    } catch (err) {
      console.error('Failed to save to user worksheets:', err);
      try {
        handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/worksheets`);
      } catch (e) {
        // Logged
      }
    }
  };

  // Save to global archive for admin review (not shown to regular users)
  const saveToGlobalArchive = async (content: GeneratedProblem) => {
    if (!user) return;
    try {
      const now = new Date().toISOString();
      await addDoc(collection(db, 'global_generations'), {
        teacherUid: user.uid,
        teacherEmail: user.email || user.providerData[0]?.email || 'unknown@domain.com',
        teacherName: user.displayName || 'Teacher',
        mathConcept: formState.mathConcept,
        gradeLevel: formState.gradeLevel,
        genre: formState.context || 'Real Life',
        numberOfQuestions: formState.numberOfQuestions,
        content,
        createdAt: now
      });
    } catch (err) {
      console.error('Failed to save to global archive:', err);
      try {
        handleFirestoreError(err, OperationType.CREATE, 'global_generations');
      } catch (e) {
        // Logged
      }
    }
  };

  const handleLoadWorksheet = async (id: string) => {
    if (!user) return;
    try {
      const docRef = doc(db, `users/${user.uid}/worksheets`, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGeneratedContent(data.content);
        setFormState(prev => ({
          ...prev,
          mathConcept: data.mathConcept,
          gradeLevel: data.gradeLevel,
          numberOfQuestions: data.numberOfQuestions
        }));
        
        const availableLevels = Object.keys(data.content.studentWorksheet).filter(level => {
          const key = level as keyof typeof data.content.studentWorksheet;
          return data.content.studentWorksheet[key] && data.content.studentWorksheet[key]!.length > 0;
        });
        
        if (availableLevels.length > 1) {
          setActiveDifferentiationLevel('mix');
        } else if (availableLevels.length === 1) {
          setActiveDifferentiationLevel(availableLevels[0] as 'scaffolded' | 'onLevel' | 'challenge');
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}/worksheets/${id}`);
    }
  };

  const handleDeleteWorksheet = async (id: string) => {
    if (!user) return;
    try {
      const docRef = doc(db, `users/${user.uid}/worksheets`, id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/worksheets/${id}`);
    }
  };

  const handleGenerate = useCallback(async () => {
    // If not signed in, show Google Sign-In prompt
    if (!user) {
      setShowSignInModal(true);
      return;
    }

    // Check teacher quota (30 free generations each month)
    const isUnlimited = userProfile?.plan === 'unlimited';
    const quotaLimit = userProfile?.quotaLimit ?? 30;
    const usedThisMonth = userProfile?.generationsUsedThisMonth ?? 0;

    if (!isUnlimited && usedThisMonth >= quotaLimit) {
      setError('You have reached your monthly free limit of 30 generations. Upgrade to Unlimited for unrestricted access.');
      setIsUserAreaOpen(true);
      return;
    }

    if (!formState.mathConcept.trim()) {
      setError('Please enter a math concept or topic.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);
    setProgress(5);
    setActiveDifferentiationLevel(null);

    // Dynamic progress ticker to ensure the user sees continuous percentage progress
    let tickerVal = 5;
    const ticker = setInterval(() => {
      if (tickerVal < 30) {
        tickerVal += 3.5;
      } else if (tickerVal < 65) {
        tickerVal += 2;
      } else if (tickerVal < 88) {
        tickerVal += 1.2;
      } else if (tickerVal < 94) {
        tickerVal += 0.4;
      }
      setProgress(prev => Math.max(prev, Math.min(94, Math.round(tickerVal))));
    }, 180);

    try {
      // Track generation event in Google Sheets
      trackEvent({
        event: 'generate',
        email: user?.email || user?.providerData[0]?.email || 'Anonymous',
        name: user?.displayName || 'Teacher',
        userId: user?.uid || 'anonymous',
        topic: formState.mathConcept,
        gradeLevel: formState.gradeLevel,
        questionCount: formState.numberOfQuestions
      });

      const stream = await generateWordProblemsStream(formState);
      let accumulatedText = '';
      const estimatedTotal = 3200; 

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          accumulatedText += chunkText;
          const streamProgress = Math.min(95, Math.round((accumulatedText.length / estimatedTotal) * 100));
          setProgress(prev => Math.max(prev, streamProgress));
        }
      }
      
      clearInterval(ticker);
      setProgress(100);
      // Give the user a moment to see the completed 100% dial
      await new Promise(r => setTimeout(r, 350));

      const content = JSON.parse(accumulatedText);
      setGeneratedContent(content);

      // Save to teacher's personal workspace
      if (user) {
        await saveWorksheet(content);
        // Also archive every word problem globally for admin (chitkaran@gmail.com) review
        await saveToGlobalArchive(content);

        // Deduct/increment quota for teacher
        const now = new Date().toISOString();
        const currentMonthStr = now.slice(0, 7);
        const newUsed = (userProfile?.generationsUsedThisMonth ?? 0) + 1;
        const updatedProfile = {
          userId: user.uid,
          email: user.email || user.providerData[0]?.email || 'teacher@domain.com',
          displayName: user.displayName || 'Teacher',
          plan: userProfile?.plan || 'free',
          quotaLimit: userProfile?.quotaLimit ?? 30,
          generationsUsedThisMonth: newUsed,
          currentMonth: userProfile?.currentMonth || currentMonthStr,
          lastGeneratedAt: now,
          updatedAt: now
        };
        try {
          await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });
        } catch (err) {
          console.error('Failed to update quota counter:', err);
        }
      }

      const availableLevels = Object.keys(content.studentWorksheet).filter(level => {
        const key = level as keyof typeof content.studentWorksheet;
        return content.studentWorksheet[key] && content.studentWorksheet[key]!.length > 0;
      });
      
      if (availableLevels.length > 1) {
        setActiveDifferentiationLevel('mix');
      } else if (availableLevels.length === 1) {
        setActiveDifferentiationLevel(availableLevels[0] as 'scaffolded' | 'onLevel' | 'challenge');
      }

      // Show action popup with Print, Generate Again, Cancel
      setIsSuccessModalOpen(true);

    } catch (err) {
      clearInterval(ticker);
      setError(err instanceof Error ? err.message : 'An error occurred during generation.');
      console.error(err);
    } finally {
      clearInterval(ticker);
      setIsLoading(false);
    }
  }, [formState, user, userProfile]);

  const handlePrint = () => {
    if (generatedContent) {
      printWorksheetDocument(
        generatedContent,
        activeDifferentiationLevel || 'mix',
        activeView,
        {
          mathConcept: formState.mathConcept,
          gradeLevel: formState.gradeLevel,
          numberOfQuestions: formState.numberOfQuestions,
          context: formState.context
        }
      );
    } else {
      window.print();
    }
  };

  const handleGenerateAgain = useCallback(() => {
    setIsSuccessModalOpen(false);
    handleGenerate();
  }, [handleGenerate]);

  // Check if blur should be applied: when user is not logged in and not checking initial auth
  const isBlurred = !isAuthChecking && !user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f6f8] via-[#edf7f9] to-[#dff0f3] relative overflow-x-hidden font-sans text-slate-800 selection:bg-purple-600 selection:text-white">
      
      {/* Decorative Pastel Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden no-print select-none">
        <div className="absolute -top-[12%] -left-[10%] w-[45%] h-[45%] bg-sky-200/40 blur-[130px] rounded-full" />
        <div className="absolute top-[25%] -right-[8%] w-[45%] h-[45%] bg-purple-200/30 blur-[140px] rounded-full" />
        <div className="absolute -bottom-[10%] -left-[5%] w-[50%] h-[45%] bg-teal-100/50 blur-[130px] rounded-full" />
      </div>

      {/* 1. TOP TICKER (Shown at the very top with live fluctuating counters & teacher status) */}
      <div className="no-print">
        <TopTicker 
          user={user}
          onOpenSignIn={() => setShowSignInModal(true)}
          userProfile={userProfile}
          onOpenUserArea={() => setIsUserAreaOpen(true)}
          isAdmin={isAdmin}
          onOpenAdminArchive={() => setIsAdminArchiveOpen(true)}
        />
      </div>

      {/* Main Page Content Wrapper (Blurred if user is not logged in) */}
      <div className={`relative z-10 transition-all duration-300 ${isBlurred ? 'filter blur-md pointer-events-none select-none' : ''}`}>
        
        {/* 2. MAIN TWO-COLUMN CONTAINER: SIDEBAR + MAIN CARD */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-1 pb-28 lg:pb-20 relative">
          
          <div className="flex flex-col lg:flex-row items-stretch gap-6">
            {/* Left Sidebar (Desktop Only) */}
            <div className="no-print hidden lg:flex w-64 xl:w-72 shrink-0">
              <Sidebar 
                activeTab={sidebarTab}
                onSelectTab={handleSelectTab}
                savedCount={history.length}
              />
            </div>

            {/* Right Main Content Area */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">
              {/* Main Generator Card */}
              <div className="no-print">
                <SettingsForm 
                  formState={formState} 
                  setFormState={setFormState} 
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                  userProfile={userProfile}
                  onOpenUserArea={() => setIsUserAreaOpen(true)}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="no-print">
                  <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-2xl shadow-sm flex items-center gap-3">
                    <span className="text-rose-500 font-bold text-lg">⚠️</span>
                    <p className="text-sm font-medium text-rose-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Generated Worksheet Display */}
              {generatedContent && (
                <div>
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10">
                    <OutputDisplay 
                      content={generatedContent} 
                      activeView={activeView}
                      setActiveView={setActiveView}
                      printInfo={{
                        mathConcept: formState.mathConcept,
                        gradeLevel: formState.gradeLevel,
                        numberOfQuestions: formState.numberOfQuestions
                      }}
                      activeDifferentiationLevel={activeDifferentiationLevel}
                      setActiveDifferentiationLevel={setActiveDifferentiationLevel as (level: 'scaffolded' | 'onLevel' | 'challenge' | 'mix') => void}
                      onPrint={handlePrint}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

        </main>

        {/* Mobile Bottom Navigation Bar */}
        <div className="no-print lg:hidden">
          <MobileBottomNav 
            activeTab={sidebarTab}
            onSelectTab={handleSelectTab}
            savedCount={history.length}
          />
        </div>
      </div>

      {/* Overlay Modals (All hidden during printing) */}
      <div className="no-print">
        {/* Help Modal */}
        <HelpModal 
          isOpen={isHelpModalOpen} 
          onClose={() => {
            setIsHelpModalOpen(false);
            setSidebarTab('home');
          }} 
        />

        {/* 4. GOOGLE SIGN-IN MODAL (Centered over blurred page if user is not logged in) */}
        {(isBlurred || showSignInModal) && (
          <GoogleSignInModal onSuccess={() => setShowSignInModal(false)} />
        )}

        {/* 5. ADMIN ARCHIVE VAULT MODAL (Only rendered & viewable by chitkaran@gmail.com) */}
        {isAdmin && (
          <AdminArchiveModal
            isOpen={isAdminArchiveOpen}
            onClose={() => setIsAdminArchiveOpen(false)}
            onLoadWorksheet={(loadedContent, concept, grade, count) => {
              setGeneratedContent(loadedContent);
              setFormState(prev => ({
                ...prev,
                mathConcept: concept,
                gradeLevel: grade,
                numberOfQuestions: count
              }));
              const availableLevels = Object.keys(loadedContent.studentWorksheet).filter(level => {
                const key = level as keyof typeof loadedContent.studentWorksheet;
                return loadedContent.studentWorksheet[key] && loadedContent.studentWorksheet[key]!.length > 0;
              });
              if (availableLevels.length > 1) {
                setActiveDifferentiationLevel('mix');
              } else if (availableLevels.length === 1) {
                setActiveDifferentiationLevel(availableLevels[0] as 'scaffolded' | 'onLevel' | 'challenge');
              }
            }}
          />
        )}

        {/* 6. TEACHER USER AREA MODAL (My past generations, free quota tracking, and upgrade) */}
        <UserAreaModal
          isOpen={isUserAreaOpen}
          onClose={() => setIsUserAreaOpen(false)}
          userProfile={userProfile}
          history={history}
          onLoadWorksheet={handleLoadWorksheet}
          onDeleteWorksheet={handleDeleteWorksheet}
          onUpgradePlan={handleUpgradePlan}
        />

        {/* 7. GENERATION PROGRESS MODAL POPUP (Shows circular dial, progress bar & math trivia without scrolling) */}
        <GeneratingPopupModal
          isOpen={isLoading}
          progress={progress}
          formState={formState}
        />

        {/* 8. GENERATION SUCCESS ACTION POPUP (Print, Generate Again, Cancel) */}
        <GenerationSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          onPrint={handlePrint}
          onGenerateAgain={handleGenerateAgain}
          content={generatedContent}
          formState={formState}
          onOpenUserArea={() => setIsUserAreaOpen(true)}
        />
      </div>

    </div>
  );
}
