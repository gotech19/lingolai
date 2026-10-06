/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { OnboardingScreen } from './components/OnboardingScreen';
import { SetupModal } from './components/SetupModal';
import { HeaderNav } from './components/HeaderNav';
import { SidebarNav, NavTabType } from './components/SidebarNav';
import { BottomNav } from './components/BottomNav';
import { HomeDashboard } from './components/HomeDashboard';
import { LearningPath } from './components/LearningPath';
import { SpeakingCoach } from './components/SpeakingCoach';
import { LinaChatStudio } from './components/LinaChatStudio';
import { VocabReview } from './components/VocabReview';
import { DailyPlanView } from './components/DailyPlanView';
import { ProgressAnalytics } from './components/ProgressAnalytics';
import { LeaderboardView } from './components/LeaderboardView';
import { LessonModal } from './components/LessonModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { ResetModal } from './components/ResetModal';
import { InstallAppBanner } from './components/InstallAppBanner';
import {
  VIRGIN_STATS,
  DEMO_STATS,
  getVirginUnits,
  getVirginFlashcards,
  INITIAL_UNITS,
  INITIAL_FLASHCARDS,
  LANGUAGES,
} from './data/mockData';
import { UnitLesson, UserStats, LanguageCode, Flashcard, WordOfTheDay, UserProfile } from './types';
import { Mic, RotateCcw, Sparkles, Moon, Sun, Flame, Zap } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'onboarding' | 'setup' | 'main'>('onboarding');
  const [activeTab, setActiveTab] = useState<NavTabType>('home');
  const [activeLesson, setActiveLesson] = useState<UnitLesson | null>(null);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('lingol_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('lingol_dark_mode', String(isDarkMode));
    } catch {}
  }, [isDarkMode]);

  // Virgin state initialization (starts clean at zero)
  const [units, setUnits] = useState<typeof INITIAL_UNITS>(() => {
    try {
      const saved = localStorage.getItem('lingol_units');
      if (saved) return JSON.parse(saved);
    } catch {}
    return getVirginUnits();
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem('lingol_flashcards');
      if (saved) return JSON.parse(saved);
    } catch {}
    return getVirginFlashcards();
  });

  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('lingol_stats');
      if (saved) return JSON.parse(saved);
    } catch {}
    return VIRGIN_STATS;
  });

  // User Profile with Google Authentication state
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('lingol_google_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: 'Apprenant LinGoL',
      email: 'guest@lingol.app',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      provider: 'guest',
      isAuthenticated: false,
    };
  });

  const [isGoogleAuthModalOpen, setIsGoogleAuthModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lingol_stats', JSON.stringify(stats));
    } catch {}
  }, [stats]);

  useEffect(() => {
    try {
      localStorage.setItem('lingol_units', JSON.stringify(units));
    } catch {}
  }, [units]);

  useEffect(() => {
    try {
      localStorage.setItem('lingol_flashcards', JSON.stringify(flashcards));
    } catch {}
  }, [flashcards]);

  const handleGetStartedFromOnboarding = () => {
    setCurrentScreen('setup');
  };

  const handleSetupComplete = (lang: LanguageCode, dailyGoal: number) => {
    setStats((prev) => ({
      ...prev,
      selectedLanguage: lang,
      dailyGoalMinutes: dailyGoal,
    }));
    setCurrentScreen('main');
  };

  const handleLanguageChange = (lang: LanguageCode) => {
    setStats((prev) => ({ ...prev, selectedLanguage: lang }));
  };

  const handleGoogleLogin = (profile: UserProfile) => {
    setCurrentUser(profile);
    try {
      localStorage.setItem('lingol_google_user', JSON.stringify(profile));
    } catch {}

    // Bonus for connecting Google
    setStats((prev) => ({
      ...prev,
      xp: prev.xp + 50,
      gems: prev.gems + 20,
    }));

    if (currentScreen === 'onboarding') {
      setCurrentScreen('main');
    }
  };

  const handleGoogleLogout = () => {
    const guestUser: UserProfile = {
      name: 'Apprenant LinGoL',
      email: 'guest@lingol.app',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      provider: 'guest',
      isAuthenticated: false,
    };
    setCurrentUser(guestUser);
    try {
      localStorage.removeItem('lingol_google_user');
    } catch {}
  };

  // Reset to clean virgin state (0 XP, 0 streak, initial lesson 1)
  const handleResetToVirgin = () => {
    const virginUnits = getVirginUnits();
    const virginCards = getVirginFlashcards();
    setStats(VIRGIN_STATS);
    setUnits(virginUnits);
    setFlashcards(virginCards);
    setCurrentScreen('onboarding');
    setActiveTab('home');
    try {
      localStorage.removeItem('lingol_stats');
      localStorage.removeItem('lingol_units');
      localStorage.removeItem('lingol_flashcards');
      localStorage.removeItem('lingol_google_user');
    } catch {}
  };

  // Load demo data if user wants to preview pre-filled state
  const handleLoadDemoData = () => {
    setStats(DEMO_STATS);
    setUnits(INITIAL_UNITS);
    setFlashcards(INITIAL_FLASHCARDS);
    setCurrentScreen('main');
    setActiveTab('home');
  };

  const handleLessonComplete = (xpEarned: number) => {
    if (!activeLesson) return;

    // Mark lesson as completed
    const updatedUnits = units.map((u) => ({
      ...u,
      lessons: u.lessons.map((l) => {
        if (l.id === activeLesson.id) {
          return { ...l, isCompleted: true, stars: 3 };
        }
        return l;
      }),
    }));

    // Unlock next lesson in unit
    const u1 = updatedUnits[0];
    const completedIdx = u1.lessons.findIndex((l) => l.id === activeLesson.id);
    if (completedIdx !== -1 && completedIdx < u1.lessons.length - 1) {
      u1.lessons[completedIdx + 1].isLocked = false;
    }

    setUnits(updatedUnits);
    setStats((prev) => ({
      ...prev,
      xp: prev.xp + xpEarned,
      gems: prev.gems + 10,
      streakActiveToday: true,
      streakDays: prev.streakDays === 0 ? 1 : prev.streakDays,
    }));
    setActiveLesson(null);
  };

  const handlePracticePoints = (xpEarned: number) => {
    setStats((prev) => ({
      ...prev,
      xp: prev.xp + xpEarned,
      streakActiveToday: true,
      streakDays: prev.streakDays === 0 ? 1 : prev.streakDays,
    }));
  };

  const handleAddWordOfTheDay = (word: WordOfTheDay) => {
    if (flashcards.some((f) => f.term.toLowerCase() === word.term.toLowerCase())) {
      return;
    }
    const newCard: Flashcard = {
      id: word.id || `card-${Date.now()}`,
      term: word.term,
      phonetic: word.phonetic,
      translation: word.translation,
      exampleSentence: word.exampleSentence,
      exampleTranslation: word.exampleTranslation,
      mastery: 0,
      languageCode: word.languageCode,
    };
    setFlashcards((prev) => [newCard, ...prev]);
    setStats((prev) => ({
      ...prev,
      xp: prev.xp + 10,
    }));
  };

  const handleUpdateCardMastery = (cardId: string, success: boolean) => {
    setFlashcards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          return {
            ...c,
            mastery: success ? Math.min(100, c.mastery + 15) : Math.max(0, c.mastery - 15),
          };
        }
        return c;
      })
    );
  };

  const currentLang = LANGUAGES.find((l) => l.code === stats.selectedLanguage) || LANGUAGES[0];

  const getSectionTitle = (tab: NavTabType) => {
    switch (tab) {
      case 'home':
        return 'Tableau de bord • Accueil';
      case 'learn':
        return "Parcours d'apprentissage & Leçons";
      case 'practice':
        return 'Coach Vocal & Prononciation IA';
      case 'lina':
        return 'Studio de Conversation Vocale • Lina AI';
      case 'review':
        return 'Coffre de Vocabulaire & Flashcards';
      case 'plan':
        return "Plan d'Apprentissage Quotidien";
      case 'progress':
        return 'Statistiques & Analytique CEFR';
      case 'profile':
        return 'Ligue Diamant & Profil Apprenant';
      default:
        return 'LinGoL AI';
    }
  };

  return (
    <div className="min-h-screen h-screen w-full bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col overflow-hidden font-sans select-none">
      {/* 1. Onboarding Screen */}
      {currentScreen === 'onboarding' && (
        <div className="flex-1 w-full h-full overflow-y-auto">
          <OnboardingScreen
            onGetStarted={handleGetStartedFromOnboarding}
            onGoogleSignIn={() => setIsGoogleAuthModalOpen(true)}
          />
        </div>
      )}

      {/* 2. Setup Screen */}
      {currentScreen === 'setup' && (
        <div className="flex-1 w-full h-full overflow-y-auto">
          <SetupModal
            onComplete={handleSetupComplete}
            onBack={() => setCurrentScreen('onboarding')}
          />
        </div>
      )}

      {/* 3. Main Web Application Screen */}
      {currentScreen === 'main' && (
        <div className="flex-1 flex flex-col md:flex-row h-full w-full overflow-hidden">
          {/* Desktop Left Sidebar */}
          <SidebarNav
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            stats={stats}
            currentUser={currentUser}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
            onSelectLanguage={handleLanguageChange}
            onOpenGoogleAuth={() => setIsGoogleAuthModalOpen(true)}
            onOpenResetModal={() => setIsResetModalOpen(true)}
            onResetToOnboarding={() => setCurrentScreen('onboarding')}
          />

          {/* Main Workspace */}
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFC] dark:bg-[#0B1120]">
            {/* Mobile Top Header (hidden on desktop) */}
            <div className="md:hidden">
              <HeaderNav
                stats={stats}
                currentUser={currentUser}
                isDarkMode={isDarkMode}
                onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
                onOpenGoogleAuth={() => setIsGoogleAuthModalOpen(true)}
                onSelectLanguage={handleLanguageChange}
                onResetToOnboarding={() => setCurrentScreen('onboarding')}
                onOpenResetModal={() => setIsResetModalOpen(true)}
              />
            </div>

            {/* Desktop Top Workspace Header */}
            <header className="hidden md:flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl leading-none">{currentLang.flag}</span>
                <div>
                  <h1 className="text-base font-black text-slate-800 dark:text-white leading-tight">
                    {getSectionTitle(activeTab)}
                  </h1>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Apprentissage de {currentLang.name} ({currentLang.nativeName}) • Niveau {stats.cefrLevel}
                  </span>
                </div>
              </div>

              {/* Quick Actions & Stats on Desktop Header */}
              <div className="flex items-center gap-3">
                {/* Streak Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 text-orange-600 dark:text-orange-400 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 fill-orange-500" />
                  <span>{stats.streakDays} jours</span>
                </div>

                {/* XP Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-[#2563EB] dark:text-blue-400 text-xs font-bold">
                  <Zap className="w-3.5 h-3.5 fill-blue-500" />
                  <span>{stats.xp} XP</span>
                </div>

                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setIsDarkMode((prev) => !prev)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title={isDarkMode ? 'Mode clair' : 'Mode sombre'}
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Reset clean slate button */}
                <button
                  onClick={() => setIsResetModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-300 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition-colors text-xs font-semibold cursor-pointer"
                  title="Mettre LinGoL à zéro (état vierge)"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                  <span>Mettre à zéro</span>
                </button>

                {/* Quick Mic Lina Button */}
                <button
                  onClick={() => setActiveTab('lina')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                    activeTab === 'lina'
                      ? 'bg-gradient-to-r from-[#2563EB] to-[#0D9488] text-white ring-2 ring-blue-300 dark:ring-blue-700'
                      : 'bg-blue-50 dark:bg-blue-900/40 text-[#2563EB] dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Micro Lina</span>
                </button>
              </div>
            </header>

            {/* Main Scrollable Content */}
            <main className="flex-1 overflow-y-auto w-full h-full flex flex-col">
              {/* Tab 1: Home Dashboard */}
              {activeTab === 'home' && (
                <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                  <HomeDashboard
                    stats={stats}
                    currentUser={currentUser}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                    onOpenNextLesson={() => {
                      const firstIncomplete =
                        units[0]?.lessons.find((l) => !l.isCompleted && !l.isLocked) ||
                        units[0]?.lessons[0];
                      if (firstIncomplete) setActiveLesson(firstIncomplete);
                    }}
                    onOpenLinaChat={() => setActiveTab('lina')}
                    onOpenSpeakingCoach={() => setActiveTab('practice')}
                    currentLessonTitle={
                      units[0]?.lessons.find((l) => !l.isCompleted)?.title ||
                      'Commander au Café & Boissons'
                    }
                    currentUnitTitle={units[0]?.title || 'Unité 1 : Salutations & Bases'}
                  />
                </div>
              )}

              {/* Tab 2: Learning Path */}
              {activeTab === 'learn' && (
                <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                  <LearningPath
                    units={units}
                    selectedLanguage={stats.selectedLanguage}
                    onOpenLesson={(lesson) => setActiveLesson(lesson)}
                    onOpenLinaChat={() => setActiveTab('lina')}
                    onAddToVocab={handleAddWordOfTheDay}
                    isAlreadyInVocab={(term) =>
                      flashcards.some((f) => f.term.toLowerCase() === term.toLowerCase())
                    }
                    onOpenVocabReview={() => setActiveTab('review')}
                  />
                </div>
              )}

              {/* Tab 3: Speaking Coach */}
              {activeTab === 'practice' && (
                <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                  <SpeakingCoach
                    selectedLanguage={stats.selectedLanguage}
                    onXpEarned={handlePracticePoints}
                  />
                </div>
              )}

              {/* Tab 4: Lina AI Chat Studio */}
              {activeTab === 'lina' && (
                <div className="flex-1 h-full flex flex-col">
                  <LinaChatStudio
                    selectedLanguage={stats.selectedLanguage}
                    onPracticePointsEarned={handlePracticePoints}
                  />
                </div>
              )}

              {/* Tab 5: Vocabulary Review */}
              {activeTab === 'review' && (
                <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                  <VocabReview
                    selectedLanguage={stats.selectedLanguage}
                    cards={flashcards}
                    onUpdateCardMastery={handleUpdateCardMastery}
                  />
                </div>
              )}

              {/* Tab 6: Daily Plan */}
              {activeTab === 'plan' && (
                <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                  <DailyPlanView
                    selectedLanguage={stats.selectedLanguage}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                    onOpenLinaChat={() => setActiveTab('lina')}
                    onOpenSpeakingCoach={() => setActiveTab('practice')}
                  />
                </div>
              )}

              {/* Tab 7: Progress Analytics */}
              {activeTab === 'progress' && (
                <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                  <ProgressAnalytics stats={stats} />
                </div>
              )}

              {/* Tab 8: Profile & League */}
              {activeTab === 'profile' && (
                <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                  <LeaderboardView
                    stats={stats}
                    currentUser={currentUser}
                    onOpenGoogleAuth={() => setIsGoogleAuthModalOpen(true)}
                    onOpenResetModal={() => setIsResetModalOpen(true)}
                  />
                </div>
              )}
            </main>

            {/* Mobile Bottom Navigation (hidden on desktop) */}
            <div className="md:hidden">
              <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
            </div>
          </div>
        </div>
      )}

      {/* Active Lesson Modal */}
      {activeLesson && (
        <LessonModal
          lesson={activeLesson}
          onClose={() => setActiveLesson(null)}
          onComplete={handleLessonComplete}
        />
      )}

      {/* Google Authentication Modal */}
      <GoogleAuthModal
        isOpen={isGoogleAuthModalOpen}
        onClose={() => setIsGoogleAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleGoogleLogin}
        onLogout={handleGoogleLogout}
      />

      {/* Reset To Virgin State Modal */}
      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirmReset={handleResetToVirgin}
        onLoadDemoData={handleLoadDemoData}
      />

      {/* Optional Install PWA Banner */}
      <InstallAppBanner />
    </div>
  );
}
