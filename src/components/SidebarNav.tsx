import React, { useState, useRef, useEffect } from 'react';
import { UserStats, LanguageCode, UserProfile } from '../types';
import { LANGUAGES } from '../data/mockData';
import { playTapSound } from '../utils/audio';
import {
  Home,
  Compass,
  Radio,
  Mic,
  Layers,
  Calendar,
  BarChart3,
  Trophy,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Shield,
  Check,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { GoogleIcon } from './OnboardingScreen';

export type NavTabType =
  | 'home'
  | 'learn'
  | 'practice'
  | 'lina'
  | 'review'
  | 'plan'
  | 'progress'
  | 'profile';

interface SidebarNavProps {
  activeTab: NavTabType;
  onSelectTab: (tab: NavTabType) => void;
  stats: UserStats;
  currentUser: UserProfile;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
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
  isDarkMode,
  onToggleDarkMode,
  onSelectLanguage,
  onOpenGoogleAuth,
  onOpenResetModal,
  onResetToOnboarding,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
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
      id: 'home' as NavTabType,
      label: 'Accueil',
      description: 'Tableau de bord principal',
      icon: Home,
    },
    {
      id: 'learn' as NavTabType,
      label: 'Parcours',
      description: 'Leçons guidées & unités',
      icon: Compass,
    },
    {
      id: 'practice' as NavTabType,
      label: 'Coach Vocal',
      description: 'Prononciation & Shadowing',
      icon: Radio,
      badge: 'Score IA',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300',
    },
    {
      id: 'lina' as NavTabType,
      label: 'Lina AI',
      description: 'Conversation orale 24/7',
      icon: Mic,
      badge: 'En direct',
      badgeColor: 'bg-blue-100 dark:bg-blue-900/60 text-[#2563EB] dark:text-blue-300',
    },
    {
      id: 'review' as NavTabType,
      label: 'Vocabulaire',
      description: 'Flashcards & Répétition',
      icon: Layers,
    },
    {
      id: 'plan' as NavTabType,
      label: 'Plan du Jour',
      description: 'Timeline d\'apprentissage',
      icon: Calendar,
    },
    {
      id: 'progress' as NavTabType,
      label: 'Analytique',
      description: 'Compétences CEFR & temps',
      icon: BarChart3,
    },
    {
      id: 'profile' as NavTabType,
      label: 'Ligue & Profil',
      description: 'Tournoi Diamant & succès',
      icon: Trophy,
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 h-full p-3.5 shrink-0 shadow-2xs select-none transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-72 lg:w-80'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-slate-100 dark:border-slate-800">
        <div
          onClick={() => {
            playTapSound();
            onResetToOnboarding();
          }}
          className="flex items-center gap-2.5 cursor-pointer group min-w-0"
          title="Accueil LinGoL"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#0D9488] flex items-center justify-center text-white font-black text-xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
            L
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div
                className="font-black text-xl tracking-tight text-[#2563EB] dark:text-blue-400 leading-none"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                LinGoL
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wide mt-0.5 truncate">
                Web App Vocale IA
              </div>
            </div>
          )}
        </div>

        {/* Collapse Sidebar Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Déplier le menu' : 'Replier le menu'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Target Language Dropdown (when expanded) */}
      {!isCollapsed && (
        <div className="relative mb-3" ref={langMenuRef}>
          <button
            onClick={() => {
              playTapSound();
              setLangMenuOpen(!langMenuOpen);
            }}
            className="w-full flex items-center justify-between p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-colors text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl leading-none">{currentLang.flag}</span>
              <span>{currentLang.name}</span>
              {currentLang.isRtl && (
                <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-bold">RTL</span>
              )}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {langMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-50 animate-fadeIn max-h-56 overflow-y-auto">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                Choisir la Langue
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
                      ? 'bg-blue-50 dark:bg-blue-900/40 text-[#2563EB] dark:text-blue-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1 truncate">
                    <div>{lang.name}</div>
                    <div className="text-[10px] text-slate-400">{lang.nativeName}</div>
                  </div>
                  {lang.code === stats.selectedLanguage && (
                    <Check className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Navigation Links */}
      <nav className="space-y-1 flex-1 overflow-y-auto pr-1 no-scrollbar">
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
              className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#2563EB] text-white shadow-xs font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase shrink-0 ${
                          isActive ? 'bg-white text-[#2563EB]' : item.badgeColor
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-[10px] truncate ${
                      isActive ? 'text-blue-100 font-medium' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Stats Widget (when expanded) */}
      {!isCollapsed && (
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 my-2.5 shrink-0">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400 mb-2">
            <span>Progrès LinGoL</span>
            <span className="text-[#2563EB] dark:text-blue-400">Niv. {stats.level} · {stats.cefrLevel}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-1.5 border border-slate-100 dark:border-slate-800">
              <div className="text-sm">🔥</div>
              <div className="font-black text-xs text-orange-600 dark:text-orange-400">{stats.streakDays}j</div>
              <div className="text-[9px] text-slate-400">Série</div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-1.5 border border-slate-100 dark:border-slate-800">
              <div className="text-sm">💎</div>
              <div className="font-black text-xs text-blue-600 dark:text-blue-400">{stats.gems}</div>
              <div className="text-[9px] text-slate-400">Lingots</div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-1.5 border border-slate-100 dark:border-slate-800">
              <div className="text-sm">⚡</div>
              <div className="font-black text-xs text-indigo-600 dark:text-indigo-400">{stats.xp}</div>
              <div className="text-[9px] text-slate-400">XP</div>
            </div>
          </div>
        </div>
      )}

      {/* Google User Profile & Dark Mode Row */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {currentUser.isAuthenticated ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-blue-200 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                <GoogleIcon />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-800 dark:text-white truncate">
                {currentUser.isAuthenticated ? currentUser.name : 'Compte Invité'}
              </div>
            </div>
            <button
              onClick={() => {
                playTapSound();
                onOpenGoogleAuth();
              }}
              className="text-[10px] font-bold text-[#2563EB] hover:underline shrink-0"
            >
              {currentUser.isAuthenticated ? 'Gérer' : 'Connexion'}
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenGoogleAuth}
            className="w-full flex justify-center p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <GoogleIcon />
          </button>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={() => {
            playTapSound();
            onToggleDarkMode();
          }}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDarkMode ? 'Activer le mode clair' : 'Activer le mode sombre'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Reset button at bottom */}
      {!isCollapsed && (
        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
          <button
            onClick={() => {
              playTapSound();
              onOpenResetModal();
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-rose-500" />
            <span>Remettre à zéro</span>
          </button>
          <span>v2.4 Pro</span>
        </div>
      )}
    </aside>
  );
};
