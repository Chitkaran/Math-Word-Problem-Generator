import React from 'react';
import { Home, Bookmark, History, HelpCircle } from 'lucide-react';
import appLogoLarge from '../src/assets/images/app_logo_large_1790109432285.jpg';

interface SidebarProps {
  activeTab: 'home' | 'saved' | 'history' | 'help';
  onSelectTab: (tab: 'home' | 'saved' | 'history' | 'help') => void;
  savedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  savedCount = 0
}) => {
  return (
    <aside className="w-full lg:w-64 xl:w-72 bg-white rounded-3xl p-5 xl:p-6 shadow-sm border border-slate-100 flex flex-col justify-between shrink-0 select-none">
      {/* Top Section: Big App Logo + Navigation */}
      <div>
        {/* App Logo - Big & prominent as requested */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-full max-w-[210px] xl:max-w-[230px] aspect-square rounded-[2rem] overflow-hidden shadow-lg shadow-sky-500/15 border-2 border-white ring-1 ring-slate-100/90 hover:scale-[1.02] transition-transform duration-300">
            <img 
              src={appLogoLarge} 
              alt="Math Word Problem Generator" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 pt-2">
          {/* Home */}
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-[#ede9fe] text-[#7c3aed] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span>Home</span>
          </button>

          {/* My Saved */}
          <button
            type="button"
            onClick={() => onSelectTab('saved')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-[#ede9fe] text-[#7c3aed] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <Bookmark className="w-5 h-5 shrink-0" />
              <span>My Saved</span>
            </div>
            {savedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-purple-100 text-purple-700">
                {savedCount}
              </span>
            )}
          </button>

          {/* History */}
          <button
            type="button"
            onClick={() => onSelectTab('history')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#ede9fe] text-[#7c3aed] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <History className="w-5 h-5 shrink-0" />
            <span>History</span>
          </button>

          {/* Help */}
          <button
            type="button"
            onClick={() => onSelectTab('help')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'help'
                ? 'bg-[#ede9fe] text-[#7c3aed] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <HelpCircle className="w-5 h-5 shrink-0" />
            <span>Help</span>
          </button>
        </nav>
      </div>

      {/* Bottom Doodle Quote */}
      <div className="pt-8 pb-2 text-center">
        <div className="relative inline-block">
          {/* Quotes & Words */}
          <div className="font-extrabold text-[#1e3a8a] text-xs xl:text-sm leading-tight">
            <span className="text-amber-400 font-serif text-base font-bold mr-0.5">“</span>
            <span className="block font-black text-slate-800">Good</span>
            <span className="block font-black text-slate-800">Teachers</span>
            <span className="block font-black text-indigo-900">Build</span>
            <span className="block font-black text-indigo-900">Great</span>
            <span className="block font-black text-indigo-900">Thinkers</span>
            <span className="text-amber-400 font-serif text-base font-bold ml-0.5">”</span>
          </div>

          {/* Yellow smile arc underline */}
          <div className="w-16 h-2 border-b-2 border-amber-400 rounded-full mx-auto mt-1" />
          
          {/* Little Blue Heart */}
          <div className="mt-1 text-sky-500 text-xs">💙</div>
        </div>
      </div>
    </aside>
  );
};

export const MobileBottomNav: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  savedCount = 0
}) => {
  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-3 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-around select-none"
    >
      {/* Home */}
      <button
        type="button"
        onClick={() => onSelectTab('home')}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all cursor-pointer active:scale-95 ${
          activeTab === 'home'
            ? 'text-[#7c3aed] font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'home' ? 'bg-[#ede9fe] scale-105' : ''}`}>
          <Home className="w-5 h-5 shrink-0" />
        </div>
        <span className="text-[11px] mt-0.5 tracking-tight font-semibold">Home</span>
      </button>

      {/* My Saved */}
      <button
        type="button"
        onClick={() => onSelectTab('saved')}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all cursor-pointer active:scale-95 ${
          activeTab === 'saved'
            ? 'text-[#7c3aed] font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className={`p-1.5 rounded-xl transition-all relative ${activeTab === 'saved' ? 'bg-[#ede9fe] scale-105' : ''}`}>
          <Bookmark className="w-5 h-5 shrink-0" />
          {savedCount > 0 && (
            <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full text-[9px] font-black bg-[#7c3aed] text-white ring-2 ring-white">
              {savedCount}
            </span>
          )}
        </div>
        <span className="text-[11px] mt-0.5 tracking-tight font-semibold">My Saved</span>
      </button>

      {/* History */}
      <button
        type="button"
        onClick={() => onSelectTab('history')}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all cursor-pointer active:scale-95 ${
          activeTab === 'history'
            ? 'text-[#7c3aed] font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'history' ? 'bg-[#ede9fe] scale-105' : ''}`}>
          <History className="w-5 h-5 shrink-0" />
        </div>
        <span className="text-[11px] mt-0.5 tracking-tight font-semibold">History</span>
      </button>

      {/* Help */}
      <button
        type="button"
        onClick={() => onSelectTab('help')}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all cursor-pointer active:scale-95 ${
          activeTab === 'help'
            ? 'text-[#7c3aed] font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'help' ? 'bg-[#ede9fe] scale-105' : ''}`}>
          <HelpCircle className="w-5 h-5 shrink-0" />
        </div>
        <span className="text-[11px] mt-0.5 tracking-tight font-semibold">Help</span>
      </button>
    </nav>
  );
};

