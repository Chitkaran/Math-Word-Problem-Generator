import React, { useState, useCallback, useEffect } from 'react';
import { TopTicker } from './components/TopTicker';
import { AppHeader } from './components/Header';
import { SettingsForm } from './components/SettingsForm';
import { OutputDisplay } from './components/OutputDisplay';
import { GoogleSignInModal } from './components/GoogleSignInModal';
import { AdminArchiveModal } from './components/AdminArchiveModal';
import { UserAreaModal } from './components/UserAreaModal';
import { GenerationSuccessModal } from './components/GenerationSuccessModal';
import { GeneratingPopupModal } from './components/GeneratingPopupModal';
import type { FormState, GeneratedProblem, UserProfile } from './types';
import { generateWordProblemsStream } from './services/geminiService';
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
    setProgress(0);
    setActiveDifferentiationLevel(null);

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
      const estimatedTotal = 3500; 

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          accumulatedText += chunkText;
          const currentProgress = Math.min(95, (accumulatedText.length / estimatedTotal) * 100);
          setProgress(currentProgress);
        }
      }
      
      setProgress(100);
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
      setError(err instanceof Error ? err.message : 'An error occurred during generation.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [formState, user, userProfile]);

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateAgain = useCallback(() => {
    setIsSuccessModalOpen(false);
    handleGenerate();
  }, [handleGenerate]);

  // Check if blur should be applied: when user is not logged in and not checking initial auth
  const isBlurred = !isAuthChecking && !user;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EBF5FB] via-[#F3F9FF] to-[#E6F7F4] relative overflow-x-hidden font-sans text-slate-800 selection:bg-indigo-500 selection:text-white">
      
      {/* Decorative Pastel Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden no-print select-none">
        {/* Top Left Sky Blue Glow */}
        <div className="absolute -top-[12%] -left-[10%] w-[45%] h-[45%] bg-sky-200/50 blur-[130px] rounded-full" />
        {/* Center Right Cyan Glow */}
        <div className="absolute top-[25%] -right-[8%] w-[45%] h-[45%] bg-teal-100/40 blur-[140px] rounded-full" />
        {/* Bottom Left Mint Glow */}
        <div className="absolute -bottom-[10%] -left-[5%] w-[50%] h-[45%] bg-emerald-100/40 blur-[120px] rounded-full" />
      </div>

      {/* 1. TOP TICKER (Shown at the very top with live fluctuating counters) */}
      <TopTicker />

      {/* Main Page Content Wrapper (Blurred if user is not logged in) */}
      <div className={`relative z-10 transition-all duration-300 ${isBlurred ? 'filter blur-md pointer-events-none select-none' : ''}`}>
        
        {/* 2. MAIN NAV BAR (Navy Blue Capsule) */}
        <div className="no-print">
          <AppHeader 
            user={user} 
            lastSync={lastSync} 
            history={history} 
            onLoadWorksheet={handleLoadWorksheet} 
            onDeleteWorksheet={handleDeleteWorksheet}
            onOpenSignIn={() => setShowSignInModal(true)}
            isAdmin={isAdmin}
            onOpenAdminArchive={() => setIsAdminArchiveOpen(true)}
            userProfile={userProfile}
            onOpenUserArea={() => setIsUserAreaOpen(true)}
          />
        </div>
        
        {/* 3. MAIN CONTAINER */}
        <main className="container mx-auto max-w-7xl pb-24 relative">
          
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

          {/* Bottom Left Playful Doodle: "Small Steps Big Learning" */}
          <div className="hidden md:flex absolute -bottom-16 left-6 flex-col select-none pointer-events-none z-0">
            <div className="relative pl-7">
              {/* 3 Yellow radiating rays on left */}
              <div className="absolute left-0 top-3 flex flex-col gap-1.5 items-center">
                <span className="w-4 h-1 bg-amber-400 rounded-full -rotate-25 block" />
                <span className="w-5 h-1 bg-amber-400 rounded-full block" />
                <span className="w-4 h-1 bg-amber-400 rounded-full rotate-25 block" />
              </div>

              {/* Hand-drawn style playful text */}
              <div className="font-extrabold text-[#1E3A8A] text-lg leading-tight tracking-tight drop-shadow-sm rotate-[-4deg]">
                <p>Small</p>
                <p className="pl-1">Steps</p>
                <p className="pl-2 text-xl text-indigo-900">Big</p>
                <p className="text-xl text-indigo-900">Learning</p>
              </div>

              {/* Smile arc under Learning */}
              <div className="w-20 h-3 border-b-2 border-amber-400 rounded-full mt-1 ml-1" />
            </div>
          </div>

          {/* Bottom Right Playful Doodle: Heart & Stars */}
          <div className="hidden md:flex absolute -bottom-12 right-10 items-center gap-3 select-none pointer-events-none z-0">
            {/* Outlined cute sky blue heart */}
            <svg className="w-9 h-9 text-sky-400 stroke-current fill-none transform -rotate-12" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            {/* Sparkle cross/stars */}
            <div className="flex flex-col gap-1 text-sky-400">
              <span className="text-base font-black leading-none">+</span>
              <span className="text-xs font-black leading-none ml-2">✦</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 mt-6 max-w-4xl mx-auto">
              <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-2xl shadow-sm flex items-center gap-3">
                <span className="text-rose-500 font-bold text-lg">⚠️</span>
                <p className="text-sm font-medium text-rose-800">{error}</p>
              </div>
            </div>
          )}

          {/* Generated Worksheet Display */}
          {generatedContent && (
            <div className="px-4 mt-8">
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-6 md:p-12">
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

        </main>
      </div>

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
  );
}
