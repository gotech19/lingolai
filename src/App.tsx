/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { OnboardingScreen } from './components/OnboardingScreen';
import { SetupModal } from './components/SetupModal';
import { HeaderNav } from './components/HeaderNav';
import { SidebarNav } from './components/SidebarNav';
import { BottomNav, TabType } from './components/BottomNav';
import { LearningPath } from './components/LearningPath';
import { LinaChatStudio } from './components/LinaChatStudio';
import { VocabReview } from './components/VocabReview';
import { LeaderboardView } from './components/LeaderboardView';
import { LessonModal } from './components/LessonModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { ResetModal } from './components/ResetModal';
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
import { Mic, RotateCcw, Sparkles } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'onboarding' | 'setup' | 'main'>('onboarding');
  const [activeTab, setActiveTab] = useState<TabType>('lina'); // Parler avec Lina en priorité
  const [activeLesson, setActiveLesson] = useState<UnitLesson | null>(null);

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
    setActiveTab('lina');
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

  return (
    <div className="min-h-screen h-screen w-full bg-[#f8f9ff] text-[#0b1c30] flex flex-col overflow-hidden font-sans select-none">
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
            onSelectLanguage={handleLanguageChange}
            onOpenGoogleAuth={() => setIsGoogleAuthModalOpen(true)}
            onOpenResetModal={() => setIsResetModalOpen(true)}
            onResetToOnboarding={() => setCurrentScreen('onboarding')}
          />

          {/* Main Workspace */}
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8f9ff]">
            {/* Mobile Top Header (hidden on desktop) */}
            <div className="md:hidden">
              <HeaderNav
                stats={stats}
                currentUser={currentUser}
                onOpenGoogleAuth={() => setIsGoogleAuthModalOpen(true)}
                onSelectLanguage={handleLanguageChange}
                onResetToOnboarding={() => setCurrentScreen('onboarding')}
                onOpenResetModal={() => setIsResetModalOpen(true)}
              />
            </div>

            {/* Desktop Top Workspace Header */}
            <header className="hidden md:flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200/80 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xl">{currentLang.flag}</span>
                <div>
                  <h1 className="text-base font-extrabold text-slate-800 leading-tight">
                    {activeTab === 'lina' && 'Studio de Conversation Vocale • Lina AI'}
                    {activeTab === 'path' && 'Parcours d\'apprentissage & Leçons'}
                    {activeTab === 'review' && 'Coffre de Vocabulaire & Flashcards'}
                    {activeTab === 'profile' && 'Ligue Diamant & Profil Apprenant'}
                  </h1>
                  <span className="text-xs text-slate-500">
                    Apprentissage de {currentLang.name} ({currentLang.nativeName})
                  </span>
                </div>
              </div>

              {/* Quick actions on Desktop Header */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsResetModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-300 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors text-xs font-semibold cursor-pointer"
                  title="Mettre LinGoL à zéro (état vierge)"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                  <span>Mettre à zéro</span>
                </button>

                <button
                  onClick={() => setActiveTab('lina')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'lina'
                      ? 'bg-[#004ac6] text-white shadow-xs'
                      : 'bg-blue-50 text-[#004ac6] hover:bg-blue-100'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Micro Lina</span>
                </button>
              </div>
            </header>

            {/* Main Scrollable Content */}
            <main className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto h-full flex flex-col">
              {activeTab === 'lina' && (
                <div className="flex-1 h-full flex flex-col">
                  <LinaChatStudio
                    selectedLanguage={stats.selectedLanguage}
                    onPracticePointsEarned={handlePracticePoints}
                  />
                </div>
              )}

              {activeTab === 'path' && (
                <div className="p-4 md:p-6">
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

              {activeTab === 'review' && (
                <div className="p-4 md:p-6">
                  <VocabReview
                    selectedLanguage={stats.selectedLanguage}
                    cards={flashcards}
                    onUpdateCardMastery={handleUpdateCardMastery}
                  />
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="p-4 md:p-6">
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
    </div>
  );
}
