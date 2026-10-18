import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  RotateCcw, 
  Check, 
  Layout, 
  Grid3X3, 
  Type, 
  Palette, 
  Printer, 
  FileText, 
  Columns, 
  Square,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import type { 
  RenderSettings, 
  WorksheetLayout, 
  PaperStyle, 
  WorkspaceHeight, 
  RenderFontSize, 
  RenderTheme 
} from '../types';
import { DEFAULT_RENDER_SETTINGS } from '../types';

interface RenderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: RenderSettings;
  onSave: (newSettings: RenderSettings) => void;
  conceptTitle?: string;
  gradeLevel?: string;
}

export const RenderSettingsModal: React.FC<RenderSettingsModalProps> = ({
  isOpen,
  onClose,
  settings: initialSettings,
  onSave,
  conceptTitle = 'Math Word Problems',
  gradeLevel = '5'
}) => {
  const [settings, setSettings] = useState<RenderSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<'layout' | 'paper' | 'header' | 'theme'>('layout');
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: Partial<RenderSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...preset
    }));
  };

  const handleSaveAndClose = () => {
    onSave(settings);
    try {
      localStorage.setItem('math_render_settings', JSON.stringify(settings));
    } catch {
      // ignore local storage errors
    }
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 350);
  };

  const handleReset = () => {
    setSettings(DEFAULT_RENDER_SETTINGS);
  };

  // Helper for previewing paper texture
  const getPaperBgStyle = (style: PaperStyle) => {
    switch (style) {
      case 'grid':
        return {
          backgroundImage: 'linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          backgroundColor: '#f8fafc'
        };
      case 'lined':
        return {
          backgroundImage: 'linear-gradient(to bottom, transparent 23px, #cbd5e1 24px)',
          backgroundSize: '100% 24px',
          backgroundColor: '#fafbfc'
        };
      case 'dots':
        return {
          backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px',
          backgroundColor: '#f8fafc'
        };
      case 'blank':
      default:
        return {
          backgroundColor: '#f8fafc'
        };
    }
  };

  const getThemeColorClass = (theme: RenderTheme) => {
    switch (theme) {
      case 'slate':
        return {
          primary: 'text-slate-900',
          badge: 'bg-slate-100 text-slate-800 border-slate-300',
          border: 'border-slate-400',
          header: 'border-b-2 border-slate-900',
          btn: 'bg-slate-800 text-white'
        };
      case 'navy':
        return {
          primary: 'text-blue-950',
          badge: 'bg-blue-50 text-blue-800 border-blue-200',
          border: 'border-blue-400',
          header: 'border-b-2 border-blue-900',
          btn: 'bg-blue-900 text-white'
        };
      case 'emerald':
        return {
          primary: 'text-emerald-950',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          border: 'border-emerald-400',
          header: 'border-b-2 border-emerald-800',
          btn: 'bg-emerald-800 text-white'
        };
      case 'purple':
      default:
        return {
          primary: 'text-purple-950',
          badge: 'bg-purple-50 text-purple-800 border-purple-200',
          border: 'border-purple-300',
          header: 'border-b-2 border-purple-700',
          btn: 'bg-purple-700 text-white'
        };
    }
  };

  const themeClasses = getThemeColorClass(settings.themeColor);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-purple-300 border border-white/10">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">Worksheet Render Settings</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  Customizer
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Customize worksheet layout, paper grids, print styles, and typography
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="px-6 py-3 bg-purple-50/60 border-b border-purple-100 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="font-bold text-purple-900 flex items-center gap-1 shrink-0 text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Presets:
          </span>
          <button
            type="button"
            onClick={() => handleApplyPreset({
              layout: 'split-30-70',
              paperStyle: 'blank',
              workspaceHeight: 'standard',
              fontSize: 'standard',
              themeColor: 'purple',
              showHeader: true
            })}
            className="px-3 py-1.5 rounded-lg font-bold bg-white text-purple-900 border border-purple-200 hover:bg-purple-100 transition-all cursor-pointer shrink-0 shadow-2xs"
          >
            🌟 Default 30/70 Split
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset({
              layout: 'split-30-70',
              paperStyle: 'blank',
              workspaceHeight: 'compact',
              fontSize: 'compact',
              themeColor: 'slate',
              showHeader: true
            })}
            className="px-3 py-1.5 rounded-lg font-bold bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 transition-all cursor-pointer shrink-0 shadow-2xs"
          >
            🖨️ Ink-Saver Monochrome
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset({
              layout: 'split-30-70',
              paperStyle: 'grid',
              workspaceHeight: 'standard',
              fontSize: 'standard',
              themeColor: 'navy',
              showHeader: true
            })}
            className="px-3 py-1.5 rounded-lg font-bold bg-white text-blue-900 border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer shrink-0 shadow-2xs"
          >
            📐 Math Graph Grid
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset({
              layout: 'stacked',
              paperStyle: 'lined',
              workspaceHeight: 'spacious',
              fontSize: 'large',
              themeColor: 'purple',
              showHeader: true
            })}
            className="px-3 py-1.5 rounded-lg font-bold bg-white text-purple-900 border border-purple-200 hover:bg-purple-100 transition-all cursor-pointer shrink-0 shadow-2xs"
          >
            ✏️ Primary / Large Print
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-6 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('layout')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'layout'
                ? 'border-purple-600 text-purple-800 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Columns className="w-4 h-4" />
            <span>Layout & Size</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('paper')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'paper'
                ? 'border-purple-600 text-purple-800 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>Workspace Texture</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('header')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'header'
                ? 'border-purple-600 text-purple-800 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Header & Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'theme'
                ? 'border-purple-600 text-purple-800 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Color & Ink-Saver</span>
          </button>
        </div>

        {/* Modal Body: Controls & Live Preview */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* TAB 1: LAYOUT & SIZING */}
            {activeTab === 'layout' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5">
                    Problem & Workspace Layout
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSettings(s => ({ ...s, layout: 'split-30-70' }))}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        settings.layout === 'split-30-70'
                          ? 'border-purple-600 bg-purple-50/50 shadow-xs ring-1 ring-purple-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-sm text-slate-900">30% / 70% Horizontal</span>
                        {settings.layout === 'split-30-70' && <Check className="w-4 h-4 text-purple-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2">Standard curriculum format with wide right work box</p>
                      <div className="flex gap-1.5 h-6 w-full">
                        <div className="w-[30%] bg-purple-200 rounded-sm"></div>
                        <div className="w-[70%] bg-purple-100 border border-dashed border-purple-300 rounded-sm"></div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettings(s => ({ ...s, layout: 'split-40-60' }))}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        settings.layout === 'split-40-60'
                          ? 'border-purple-600 bg-purple-50/50 shadow-xs ring-1 ring-purple-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-sm text-slate-900">40% / 60% Horizontal</span>
                        {settings.layout === 'split-40-60' && <Check className="w-4 h-4 text-purple-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2">Extended text area for multi-paragraph stories</p>
                      <div className="flex gap-1.5 h-6 w-full">
                        <div className="w-[40%] bg-purple-200 rounded-sm"></div>
                        <div className="w-[60%] bg-purple-100 border border-dashed border-purple-300 rounded-sm"></div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettings(s => ({ ...s, layout: 'split-50-50' }))}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        settings.layout === 'split-50-50'
                          ? 'border-purple-600 bg-purple-50/50 shadow-xs ring-1 ring-purple-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-sm text-slate-900">50% / 50% Balanced</span>
                        {settings.layout === 'split-50-50' && <Check className="w-4 h-4 text-purple-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2">Equal width for question details and working room</p>
                      <div className="flex gap-1.5 h-6 w-full">
                        <div className="w-[50%] bg-purple-200 rounded-sm"></div>
                        <div className="w-[50%] bg-purple-100 border border-dashed border-purple-300 rounded-sm"></div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettings(s => ({ ...s, layout: 'stacked' }))}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        settings.layout === 'stacked'
                          ? 'border-purple-600 bg-purple-50/50 shadow-xs ring-1 ring-purple-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-sm text-slate-900">Stacked Vertical</span>
                        {settings.layout === 'stacked' && <Check className="w-4 h-4 text-purple-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2">Question on top, full-width work box underneath</p>
                      <div className="flex flex-col gap-1 h-6 w-full">
                        <div className="h-2 w-full bg-purple-200 rounded-xs"></div>
                        <div className="h-3.5 w-full bg-purple-100 border border-dashed border-purple-300 rounded-xs"></div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Workspace Height */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5">
                    Workspace Box Height
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'compact', label: 'Compact', desc: '150px • Saves paper' },
                      { id: 'standard', label: 'Standard', desc: '220px • Optimal balance' },
                      { id: 'spacious', label: 'Spacious', desc: '320px • Multi-step work' }
                    ].map(h => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setSettings(s => ({ ...s, workspaceHeight: h.id as WorkspaceHeight }))}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          settings.workspaceHeight === h.id
                            ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold ring-1 ring-purple-600'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <div className="text-sm font-extrabold">{h.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{h.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5">
                    Problem Typography Size
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'compact', label: 'Compact', desc: '14px / 10pt' },
                      { id: 'standard', label: 'Standard', desc: '16px / 11pt' },
                      { id: 'large', label: 'Large Print', desc: '19px / 13pt • Elementary / IEP' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSettings(s => ({ ...s, fontSize: f.id as RenderFontSize }))}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          settings.fontSize === f.id
                            ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold ring-1 ring-purple-600'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <div className="text-sm font-extrabold">{f.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{f.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PAPER & GRID TEXTURE */}
            {activeTab === 'paper' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5">
                    Workspace Paper Texture
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'blank', title: 'Smooth Blank', desc: 'Clean open box with curved edges' },
                      { id: 'grid', title: 'Math Quad Grid', desc: '16px square grid for fractions, geometry & graphs' },
                      { id: 'lined', title: 'Lined Notebook', desc: 'Horizontal ruled lines for neat written steps' },
                      { id: 'dots', title: 'Dot Matrix Grid', desc: 'Subtle dot pattern for diagrams and arrays' }
                    ].map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSettings(s => ({ ...s, paperStyle: p.id as PaperStyle }))}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          settings.paperStyle === p.id
                            ? 'border-purple-600 bg-purple-50/50 shadow-xs ring-1 ring-purple-600'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-sm text-slate-900">{p.title}</span>
                          {settings.paperStyle === p.id && <Check className="w-4 h-4 text-purple-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mb-3">{p.desc}</p>
                        <div 
                          className="h-12 w-full rounded-xl border border-slate-300"
                          style={getPaperBgStyle(p.id as PaperStyle)}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Workspace prompt toggle */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">Show Guiding Prompt</h4>
                    <p className="text-xs text-slate-500">Include "Show your mathematical thinking & working:" prompt inside box</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showWorkspacePrompt}
                      onChange={e => setSettings(s => ({ ...s, showWorkspacePrompt: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 3: HEADER & INFO */}
            {activeTab === 'header' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">Student Info Header Banner</h4>
                    <p className="text-xs text-slate-500">Prints Name, Date, and optional Score boxes at top of worksheet</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showHeader}
                      onChange={e => setSettings(s => ({ ...s, showHeader: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {settings.showHeader && (
                  <div className="grid grid-cols-2 gap-3 pl-2">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={settings.showClassField}
                        onChange={e => setSettings(s => ({ ...s, showClassField: e.target.checked }))}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700">Include "Class / Period" line</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={settings.showScoreField}
                        onChange={e => setSettings(s => ({ ...s, showScoreField: e.target.checked }))}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700">Include "Score / Marks" box</span>
                    </label>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Custom Header Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={settings.customTitle || ''}
                      onChange={e => setSettings(s => ({ ...s, customTitle: e.target.value }))}
                      placeholder={`e.g. ${conceptTitle} Practice Exam`}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden text-sm"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Leaves blank to use default concept title</p>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Custom Teacher or School Subtitle (Optional)
                    </label>
                    <input
                      type="text"
                      value={settings.customSubtitle || ''}
                      onChange={e => setSettings(s => ({ ...s, customSubtitle: e.target.value }))}
                      placeholder="e.g. Maplewood Elementary • Room 4B"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden text-sm"
                    />
                  </div>
                </div>

                {/* Difficulty Badges */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">Show Difficulty Badges</h4>
                    <p className="text-xs text-slate-500">Show [Scaffolded] or [Challenge] labels on problems (disable for blind assessments)</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showDifficultyBadge}
                      onChange={e => setSettings(s => ({ ...s, showDifficultyBadge: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 4: THEME & COLOR */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5">
                    Accent Color & Ink Style
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSettings(s => ({ ...s, themeColor: 'purple' }))}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        settings.themeColor === 'purple'
                          ? 'border-purple-600 bg-purple-50 shadow-xs ring-1 ring-purple-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 rounded-full bg-purple-700"></div>
                        <span className="font-extrabold text-sm text-slate-900">Modern Violet</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Original AI Teacher Tools vibrant brand</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettings(s => ({ ...s, themeColor: 'slate' }))}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        settings.themeColor === 'slate'
                          ? 'border-slate-800 bg-slate-100 shadow-xs ring-1 ring-slate-800'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 rounded-full bg-slate-800"></div>
                        <span className="font-extrabold text-sm text-slate-900">Ink-Saver Monochrome</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Pure monochrome gray lines, saves color cartridge</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettings(s => ({ ...s, themeColor: 'navy' }))}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        settings.themeColor === 'navy'
                          ? 'border-blue-700 bg-blue-50 shadow-xs ring-1 ring-blue-700'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 rounded-full bg-blue-900"></div>
                        <span className="font-extrabold text-sm text-slate-900">Academic Navy</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Classic collegiate navy headers</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettings(s => ({ ...s, themeColor: 'emerald' }))}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        settings.themeColor === 'emerald'
                          ? 'border-emerald-700 bg-emerald-50 shadow-xs ring-1 ring-emerald-700'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 rounded-full bg-emerald-800"></div>
                        <span className="font-extrabold text-sm text-slate-900">Forest Emerald</span>
                      </div>
                      <p className="text-[11px] text-slate-500">School math green accents</p>
                    </button>
                  </div>
                </div>

                {/* Print Page Break options */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5">
                    Print Page Break Spacing
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'auto', label: 'Continuous', desc: 'Flows naturally per page' },
                      { id: '2-per-page', label: '2 Per Page', desc: 'Break every 2 questions' },
                      { id: '4-per-page', label: '4 Per Page', desc: 'Break every 4 questions' }
                    ].map(b => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSettings(s => ({ ...s, pageBreaks: b.id as any }))}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          settings.pageBreaks === b.id
                            ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold ring-1 ring-purple-600'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <div className="text-sm font-extrabold">{b.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{b.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Interactive Preview (5 cols) */}
          <div className="lg:col-span-5 bg-slate-100 rounded-3xl p-4 sm:p-5 flex flex-col justify-between border border-slate-200">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                  Live Render Preview
                </span>
                <span className="text-[11px] font-mono text-purple-700 font-bold">
                  {settings.layout} • {settings.paperStyle}
                </span>
              </div>

              {/* Mock Rendered Sheet */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 text-left">
                
                {/* Header Mock */}
                {settings.showHeader && (
                  <div className="pb-2 mb-3 border-b border-slate-200 text-xs">
                    <div className="flex justify-between items-center mb-1 text-[10px] text-slate-500">
                      <span>Name: ______________________</span>
                      <span>Date: _________</span>
                      {settings.showScoreField && <span>Score: ___ / 5</span>}
                    </div>
                    {settings.showClassField && (
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        <span>Class / Period: _________________</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Title */}
                <div className="mb-3">
                  <h5 className={`font-black text-xs ${themeClasses.primary}`}>
                    {settings.customTitle || conceptTitle}
                  </h5>
                  <p className="text-[10px] text-slate-400">
                    {settings.customSubtitle || `Grade ${gradeLevel} Mathematics`}
                  </p>
                </div>

                {/* Problem Mock */}
                <div className={`p-2.5 rounded-xl border ${themeClasses.border} bg-white flex ${
                  settings.layout === 'stacked' 
                    ? 'flex-col gap-2' 
                    : 'flex-row gap-2.5'
                }`}>
                  
                  {/* Left or Top Question Text */}
                  <div className={`${
                    settings.layout === 'stacked'
                      ? 'w-full'
                      : settings.layout === 'split-30-70'
                      ? 'w-[35%]'
                      : settings.layout === 'split-40-60'
                      ? 'w-[45%]'
                      : 'w-[50%]'
                  }`}>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-black text-slate-800">Problem 1</span>
                      {settings.showDifficultyBadge && (
                        <span className={`text-[8px] font-black px-1.5 py-0.2 rounded ${themeClasses.badge}`}>
                          On-Level
                        </span>
                      )}
                    </div>
                    <p className={`text-slate-700 font-medium ${
                      settings.fontSize === 'compact' ? 'text-[10px]' : settings.fontSize === 'large' ? 'text-xs' : 'text-[11px]'
                    }`}>
                      Maya had 3/4 cup of flour and added 1/2 cup more. How much flour did she use in total?
                    </p>
                  </div>

                  {/* Right or Bottom Workspace Box */}
                  <div className={`${
                    settings.layout === 'stacked'
                      ? 'w-full'
                      : settings.layout === 'split-30-70'
                      ? 'w-[65%]'
                      : settings.layout === 'split-40-60'
                      ? 'w-[55%]'
                      : 'w-[50%]'
                  }`}>
                    <div 
                      className={`w-full rounded-lg border-2 ${themeClasses.border} p-2 flex flex-col justify-between ${
                        settings.workspaceHeight === 'compact' 
                          ? 'h-20' 
                          : settings.workspaceHeight === 'spacious' 
                          ? 'h-36' 
                          : 'h-28'
                      }`}
                      style={getPaperBgStyle(settings.paperStyle)}
                    >
                      {settings.showWorkspacePrompt && (
                        <span className="text-[9px] text-slate-400 italic">
                          Show your mathematical thinking:
                        </span>
                      )}
                      <div className="flex justify-end">
                        <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">
                          Work Space
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Presets summary footer inside column */}
            <div className="mt-4 pt-3 border-t border-slate-200 text-center">
              <p className="text-[11px] text-slate-500">
                Settings persist automatically in your browser for all upcoming printouts.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white cursor-pointer shadow-md transition-all ${
                savedNotice ? 'bg-emerald-600' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {savedNotice ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Applied & Saved!</span>
                </>
              ) : (
                <>
                  <Sliders className="w-4 h-4" />
                  <span>Apply Render Settings</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
