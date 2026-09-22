
import React from 'react';

interface IconProps {
    className?: string;
}

export const AppleBookIcon: React.FC<IconProps> = ({ className }) => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-12 h-12 md:w-16 md:h-16 ${className}`}>
    <rect x="10" y="44" width="44" height="8" rx="2" fill="#4FD1C5"/>
    <rect x="12" y="36" width="40" height="8" rx="2" fill="#A0AEC0"/>
    <path d="M35 16C35 12.6863 32.3137 10 29 10C25.6863 10 23 12.6863 23 16C23 19.3137 25.6863 22 29 22H35V16Z" fill="#F56565"/>
    <path d="M29 36C29 32.6863 31.6863 30 35 30C38.3137 30 41 32.6863 41 36C41 39.3137 38.3137 42 35 42H29V36Z" fill="#F56565"/>
    <path d="M34 10C34.5523 10 35 9.55228 35 9C35 8.44772 34.5523 8 34 8C33.4477 8 33 8.44772 33 9C33 9.55228 33.4477 10 34 10Z" fill="currentColor" className="opacity-60"/>
    <path d="M32 10C32.5523 10 33 9.55228 33 9C33 8.44772 32.5523 8 32 8C31.4477 8 31 8.44772 31 9C31 9.55228 31.4477 10 32 10Z" fill="currentColor" className="opacity-60"/>
  </svg>
);

export const BlackboardIcon: React.FC<IconProps> = ({ className }) => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-12 h-12 md:w-16 md:h-16 ${className}`}>
    <rect x="6" y="14" width="52" height="36" rx="3" fill="#4A5568"/>
    <path d="M58 50H6V54H58V50Z" fill="#C19A6B"/>
    <rect x="42" y="44" width="10" height="4" rx="1" fill="#EDF2F7"/>
    <path d="M50 20L58 28V20H50Z" fill="#F6E05E" stroke="#ECC94B" strokeWidth="1"/>
    <line x1="51" y1="20" x2="51" y2="44" stroke="#ECC94B" strokeWidth="2"/>
    <text x="14" y="36" fontFamily="monospace" fontSize="14" fill="currentColor">10-4=6</text>
  </svg>
);

export const ScaffoldIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

export const OnLevelIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
);

export const ChallengeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
);

export const StudentSheetIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
export const TeacherKeyIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
export const GoogleDocsIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
export const DownloadIcon: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
