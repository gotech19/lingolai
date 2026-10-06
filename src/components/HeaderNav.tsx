import React, { useState, useRef, useEffect } from 'react';
import { UserStats, LanguageCode, UserProfile } from '../types';
import { LANGUAGES } from '../data/mockData';
import { playTapSound } from '../utils/audio';
import { ChevronDown, RotateCcw, Moon, Sun } from 'lucide-react';
import { GoogleIcon } from './OnboardingScreen';

interface HeaderNavProps {
  stats: UserStats;
  currentUser: UserProfile;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenGoogleAuth: () => void;
  onSelectLanguage: (lang: LanguageCode) => void;
  onResetToOnboarding: () => void;
  onOpenResetModal?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  stats,
  currentUser,
  isDarkMode = false,
  onToggleDarkMode,
  onOpenGoogleAuth,
  onSelectLanguage,
  onResetToOnboarding,
  onOpenResetModal,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === stats.selectedLanguage) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3.5 py-2.5 flex items-center justify-between shadow-xs">
      {/* Left: Brand & Language */}
      <div className="flex items-center gap-2">
        <div
          onClick={() => {
            playTapSound();
            onResetToOnboarding();
          }}
          className="flex items-center gap-1.5 cursor-pointer group"
          title="Accueil LinGoL"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#0D9488] flex items-center justify-center text-white font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
            L
          </div>
          <span
            className="font-black text-lg tracking-tight text-[#2563EB] dark:text-blue-400 leading-none"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            LinGoL
          </span>
        </div>

        {/* Target Language Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              playTapSound();
              setDropdownOpen(!dropdownOpen);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200/70 dark:border-slate-700"
            title="Changer de langue"
          >
            <span className="text-base leading-none">{currentLang.flag}</span>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase">{currentLang.code}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1 z-50 animate-fadeIn max-h-56 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                Langue cible
              </div>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    playTapSound();
                    onSelectLanguage(lang.code);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors ${
                    lang.code === stats.selectedLanguage
                      ? 'bg-blue-50 dark:bg-blue-900/40 text-[#2563EB] dark:text-blue-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <div className="min-w-0 flex-1 truncate">
                    <div>{lang.name}</div>
                  </div>
                  {lang.code === stats.selectedLanguage && (
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-[#2563EB] dark:text-blue-300 px-1.5 py-0.5 rounded font-bold">
                      Actif
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Stats, Dark Mode & Profile */}
      <div className="flex items-center gap-2 text-xs font-bold">
        {/* Streak */}
        <div
          className="flex items-center gap-1 text-orange-600 dark:text-orange-400 bg-orange-50/80 dark:bg-orange-950/40 px-2 py-1 rounded-xl border border-orange-200/60 dark:border-orange-800/60"
          title={`Série de ${stats.streakDays} jours`}
        >
          <span className="text-sm">🔥</span>
          <span className="tabular-nums font-black text-[11px]">{stats.streakDays}</span>
        </div>

        {/* Gems */}
        <div
          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 px-2 py-1 rounded-xl border border-blue-200/60 dark:border-blue-800/60"
          title={`${stats.gems} Lingots`}
        >
          <span className="text-sm">💎</span>
          <span className="tabular-nums font-black text-[11px]">{stats.gems}</span>
        </div>

        {/* Dark Mode button on mobile */}
        {onToggleDarkMode && (
          <button
            onClick={() => {
              playTapSound();
              onToggleDarkMode();
            }}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Mode sombre"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* Google Authentication Button */}
        <button
          onClick={() => {
            playTapSound();
            onOpenGoogleAuth();
          }}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-xl transition-all cursor-pointer border ${
            currentUser.isAuthenticated
              ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-700 shadow-2xs'
              : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 shadow-2xs'
          }`}
          title={currentUser.isAuthenticated ? currentUser.name : 'Connexion Google'}
        >
          {currentUser.isAuthenticated ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <GoogleIcon />
          )}
        </button>

        {/* Reset button */}
        {onOpenResetModal && (
          <button
            onClick={() => {
              playTapSound();
              onOpenResetModal();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Mettre à zéro l'application"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
          </button>
        )}
      </div>
    </header>
  );
};
