import React, { useState, useRef, useEffect } from 'react';
import { TabType } from './BottomNav';
import { UserStats, LanguageCode, UserProfile } from '../types';
import { LANGUAGES } from '../data/mockData';
import { playTapSound } from '../utils/audio';
import {
  Mic,
  Compass,
  Layers,
  Trophy,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Shield,
  Heart,
  Flame,
  Check,
} from 'lucide-react';
import { GoogleIcon } from './OnboardingScreen';

interface SidebarNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  stats: UserStats;
  currentUser: UserProfile;
  onSelectLanguage: (lang: LanguageCode) => void;
  onOpenGoogleAuth: () => void;
  onOpenResetModal: () => void;
  onResetToOnboarding: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onSelectTab,
  stats,
  currentUser,
  onSelectLanguage,
  onOpenGoogleAuth,
  onOpenResetModal,
  onResetToOnboarding,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === stats.selectedLanguage) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    {
      id: 'lina' as TabType,
      label: 'Parler (Lina AI)',
      description: 'Micro & conversation orale 24/7',
      icon: Mic,
      badge: 'Micro',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'path' as TabType,
      label: 'Parcours d\'apprentissage',
      description: 'Leçons interactives & unités',
      icon: Compass,
    },
    {
      id: 'review' as TabType,
      label: 'Vocabulaire & Cartes',
      description: 'Répétition espacée & flashcards',
      icon: Layers,
    },
    {
      id: 'profile' as TabType,
      label: 'Ligue & Profil',
      description: 'Tournoi Diamant & succès',
      icon: Trophy,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 lg:w-80 bg-white border-r border-slate-200/90 h-full p-4 shrink-0 shadow-2xs select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-100">
        <div
          onClick={() => {
            playTapSound();
            onResetToOnboarding();
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Accueil LinGoL"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] flex items-center justify-center text-white font-black text-lg shadow-xs group-hover:scale-105 transition-transform">
            L
          </div>
          <div>
            <div
              className="font-black text-xl tracking-tight text-[#004ac6] leading-none"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              LinGoL
            </div>
            <div className="text-[10px] text-slate-500 font-semibold tracking-wide">
              Web App Vocale IA
            </div>
          </div>
        </div>

        {/* Target Language Dropdown */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => {
              playTapSound();
              setLangMenuOpen(!langMenuOpen);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-xs font-bold text-slate-700"
            title="Changer de langue cible"
          >
            <span className="text-lg leading-none">{currentLang.flag}</span>
            <span className="uppercase">{currentLang.code}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {langMenuOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fadeIn">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Langue cible
              </div>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    playTapSound();
                    onSelectLanguage(lang.code);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors ${
                    lang.code === stats.selectedLanguage
                      ? 'bg-blue-50 text-[#004ac6] font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1 truncate">
                    <div>{lang.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{lang.nativeName}</div>
                  </div>
                  {lang.code === stats.selectedLanguage && (
                    <Check className="w-3.5 h-3.5 text-[#004ac6]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="space-y-1.5 flex-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                playTapSound();
                onSelectTab(item.id);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#004ac6] text-white shadow-sm shadow-blue-200'
                  : 'hover:bg-slate-100/80 text-slate-700'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase shrink-0 ${
                        isActive ? 'bg-white text-[#004ac6]' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <div
                  className={`text-[10px] truncate ${
                    isActive ? 'text-blue-100 font-medium' : 'text-slate-400'
                  }`}
                >
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Stats Quick Overview Widget */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 my-3 shrink-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>Statistiques LinGoL</span>
          <span className="text-[#004ac6] font-bold">Niveau {stats.level}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white rounded-xl p-2 border border-slate-100 shadow-2xs">
            <div className="text-base">🔥</div>
            <div className="font-black text-xs text-orange-600">{stats.streakDays} j</div>
            <div className="text-[9px] text-slate-400 font-medium">Série</div>
          </div>
          <div className="bg-white rounded-xl p-2 border border-slate-100 shadow-2xs">
            <div className="text-base">💎</div>
            <div className="font-black text-xs text-blue-600">{stats.gems}</div>
            <div className="text-[9px] text-slate-400 font-medium">Lingots</div>
          </div>
          <div className="bg-white rounded-xl p-2 border border-slate-100 shadow-2xs">
            <div className="text-base">⚡</div>
            <div className="font-black text-xs text-indigo-600">{stats.xp}</div>
            <div className="text-[9px] text-slate-400 font-medium">Points XP</div>
          </div>
        </div>
      </div>

      {/* Google User Profile Account Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2.5 mb-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {currentUser.isAuthenticated ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-blue-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                <GoogleIcon />
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">
                {currentUser.isAuthenticated ? currentUser.name : 'Compte Invité'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentUser.isAuthenticated ? currentUser.email : 'Non connecté'}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playTapSound();
              onOpenGoogleAuth();
            }}
            className="text-[11px] font-bold text-[#004ac6] hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
          >
            {currentUser.isAuthenticated ? 'Gérer' : 'Connexion'}
          </button>
        </div>
      </div>

      {/* Bottom Action: Mettre à zéro (vierge) */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs shrink-0">
        <button
          onClick={() => {
            playTapSound();
            onOpenResetModal();
          }}
          className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 font-semibold py-1 px-2 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer text-[11px]"
          title="Mettre l'application à zéro (état vierge)"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
          <span>Mettre à zéro (vierge)</span>
        </button>

        <button
          onClick={() => {
            playTapSound();
            onResetToOnboarding();
          }}
          className="text-slate-400 hover:text-slate-600 text-[11px] py-1 px-2 rounded-lg hover:bg-slate-50"
          title="Écran de bienvenue"
        >
          Accueil
        </button>
      </div>
    </aside>
  );
};
