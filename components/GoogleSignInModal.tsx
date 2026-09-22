import React, { useState } from 'react';
import { GraduationCap, Sparkles, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { motion } from 'motion/react';

interface GoogleSignInModalProps {
  onSuccess?: () => void;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({ onSuccess }) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      if (error?.code !== 'auth/popup-closed-by-user') {
        setAuthError(error?.message || 'Sign in failed. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.18)] border border-slate-100 p-8 md:p-10 relative overflow-hidden"
      >
        {/* Subtle decorative glow in card */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          {/* App Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <GraduationCap className="h-9 w-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Sign In to AI Teacher Tools
            </h2>
            <p className="text-slate-600 text-sm md:text-base max-w-sm mx-auto leading-relaxed">
              Create curriculum-aligned math word problems, differentiated student worksheets, and teacher keys in seconds.
            </p>
          </div>

          {/* Value Props */}
          <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs md:text-sm font-semibold text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>Full K-12 curriculum alignment & difficulty tiers</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs md:text-sm font-semibold text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>Step-by-step hints & complete teacher answer keys</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs md:text-sm font-semibold text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>Automatic cloud storage to access your past worksheets</span>
            </div>
          </div>

          {authError && (
            <div className="w-full flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium text-left">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Google Sign-in Button */}
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full group relative flex items-center justify-center gap-3.5 px-6 py-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-2xl text-slate-800 font-bold text-base shadow-sm hover:shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSigningIn ? (
              <div className="flex items-center gap-2.5 text-slate-600">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>Connecting to Google...</span>
              </div>
            ) : (
              <>
                {/* Official Google 'G' SVG Logo */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
            <span>Secure teacher authentication powered by Google</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
