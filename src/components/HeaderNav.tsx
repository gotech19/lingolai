import React, { useState, useRef, useEffect } from 'react';
import { UserStats, LanguageCode, UserProfile } from '../types';
import { LANGUAGES } from '../data/mockData';
import { playTapSound } from '../utils/audio';
import { ChevronDown, Sparkles, RotateCcw } from 'lucide-react';
import { GoogleIcon } from './OnboardingScreen';

interface HeaderNavProps {
  stats: UserStats;
  currentUser: UserProfile;
  onOpenGoogleAuth: () => void;
  onSelectLanguage: (lang: LanguageCode) => void;
  onResetToOnboarding: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  stats,
  currentUser,
  onOpenGoogleAuth,
  onSelectLanguage,
  onResetToOnboarding,
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
    <header className="sticky top-0 z-30 w-full max-w-md mx-auto bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 py-2 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      {/* Left: Prominent LinGoL Brand & Language Selector */}
      <div className="flex items-center gap-2">
        {/* LinGoL Logo & Name */}
        <div
          onClick={() => {
            playTapSound();
            onResetToOnboarding();
          }}
          className="flex items-center gap-1.5 cursor-pointer group"
          title="LinGoL - Accueil"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#004ac6] to-[#2563eb] flex items-center justify-center text-white font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
            L
          </div>
          <span
            className="font-black text-base tracking-tight text-[#004ac6] hidden xs:inline-block sm:inline-block"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
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
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200/70"
            title="Changer de langue cible"
            aria-label="Changer de langue"
          >
            <span className="text-base leading-none">{currentLang.flag}</span>
            <span className="text-[11px] font-bold text-slate-700 uppercase">{currentLang.code}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-fadeIn">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
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
                      ? 'bg-blue-50 text-[#004ac6] font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{lang.name}</div>
                  </div>
                  {lang.code === stats.selectedLanguage && (
                    <span className="text-[10px] bg-blue-100 text-[#004ac6] px-1.5 py-0.5 rounded font-bold">
                      Actif
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Stats & Google Auth */}
      <div className="flex items-center gap-2 text-xs font-bold">
        {/* Streak */}
        <div
          className="flex items-center gap-1 text-orange-600 bg-orange-50/80 px-2 py-1 rounded-lg border border-orange-200/60"
          title={`Série de ${stats.streakDays} jours d'entraînement`}
        >
          <span className="text-sm">🔥</span>
          <span className="tabular-nums font-extrabold text-[11px]">{stats.streakDays}</span>
        </div>

        {/* Gems / Lingots */}
        <div
          className="flex items-center gap-1 text-blue-600 bg-blue-50/80 px-2 py-1 rounded-lg border border-blue-200/60"
          title={`${stats.gems} Lingots`}
        >
          <span className="text-sm">💎</span>
          <span className="tabular-nums font-extrabold text-[11px]">{stats.gems}</span>
        </div>

        {/* Google Authentication Button / User Profile */}
        <button
          onClick={() => {
            playTapSound();
            onOpenGoogleAuth();
          }}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all cursor-pointer border ${
            currentUser.isAuthenticated
              ? 'bg-white border-blue-200 hover:border-blue-400 shadow-2xs'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
          }`}
          title={
            currentUser.isAuthenticated
              ? `Connecté avec Google : ${currentUser.name}`
              : 'Se connecter avec Google'
          }
        >
          {currentUser.isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-slate-200"
              />
              <span className="text-[11px] font-semibold text-slate-700 hidden sm:inline max-w-[60px] truncate">
                {currentUser.name.split(' ')[0]}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <GoogleIcon />
              <span className="text-[11px] font-semibold text-slate-700 hidden xs:inline">Google</span>
            </div>
          )}
        </button>

        {/* Reset / Onboarding replay button */}
        <button
          onClick={() => {
            playTapSound();
            onResetToOnboarding();
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-[#004ac6] hover:bg-slate-100 transition-colors"
          title="Revoir la présentation LinGoL"
          aria-label="Revoir la présentation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
