/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { OnboardingScreen } from './components/OnboardingScreen';
import { SetupModal } from './components/SetupModal';
import { HeaderNav } from './components/HeaderNav';
import { BottomNav, TabType } from './components/BottomNav';
import { LearningPath } from './components/LearningPath';
import { LinaChatStudio } from './components/LinaChatStudio';
import { VocabReview } from './components/VocabReview';
import { LeaderboardView } from './components/LeaderboardView';
import { LessonModal } from './components/LessonModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { INITIAL_UNITS, INITIAL_FLASHCARDS } from './data/mockData';
import { UnitLesson, UserStats, LanguageCode, Flashcard, WordOfTheDay, UserProfile } from './types';
import { Smartphone, Monitor, Mic } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'onboarding' | 'setup' | 'main'>('onboarding');
  const [activeTab, setActiveTab] = useState<TabType>('lina'); // Start on Lina for direct voice/speech practice!
  const [activeLesson, setActiveLesson] = useState<UnitLesson | null>(null);
  const [units, setUnits] = useState(INITIAL_UNITS);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(INITIAL_FLASHCARDS);
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [isGoogleAuthModalOpen, setIsGoogleAuthModalOpen] = useState(false);

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

  const [stats, setStats] = useState<UserStats>({
    streakDays: 5,
    streakActiveToday: true,
    xp: 980,
    gems: 480,
    hearts: 5,
    maxHearts: 5,
    level: 3,
    selectedLanguage: 'es',
    dailyGoalMinutes: 10,
    todayMinutesPracticed: 6,
  });

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

    // If still in onboarding, jump right into the app to simplify flow
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
    }));
    setActiveLesson(null);
  };

  const handlePracticePoints = (xpEarned: number) => {
    setStats((prev) => ({
      ...prev,
      xp: prev.xp + xpEarned,
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-0 md:p-4 select-none">
      {/* Top Device Bar (for desktop preview & toggle) */}
      <div className="w-full max-w-md hidden md:flex items-center justify-between py-1.5 px-3 mb-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>LinGoL • Application Vocale</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer shadow-2xs font-medium"
            title="Basculer en mode plein écran"
          >
            {isPhoneFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5" /> Plein Écran
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" /> Format Mobile
              </>
            )}
          </button>
          <button
            onClick={() => setCurrentScreen('onboarding')}
            className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[#004ac6] font-bold hover:bg-blue-100 cursor-pointer"
            title="Revoir la présentation LinGoL"
          >
            Accueil LinGoL
          </button>
        </div>
      </div>

      {/* Main Container / Mobile Device Mockup */}
      <div
        className={`w-full bg-[#f8f9ff] text-[#0b1c30] relative overflow-hidden transition-all duration-300 ${
          isPhoneFrame
            ? 'max-w-[420px] min-h-[850px] max-h-[920px] rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-[8px] border-slate-800 flex flex-col'
            : 'max-w-2xl min-h-screen rounded-none md:rounded-2xl shadow-md border-0 md:border border-slate-200 flex flex-col'
        }`}
      >
        {/* Mobile Status Bar Notch Simulation (when in phone frame) */}
        {isPhoneFrame && (
          <div className="w-full pt-2 px-6 flex justify-between items-center text-[11px] font-bold text-slate-600 bg-transparent shrink-0 z-30 pointer-events-none">
            <span>9:41</span>
            <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto" />
            <div className="flex items-center gap-1 text-[10px]">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* Screen Routing */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {currentScreen === 'onboarding' && (
            <OnboardingScreen
              onGetStarted={handleGetStartedFromOnboarding}
              onGoogleSignIn={() => setIsGoogleAuthModalOpen(true)}
            />
          )}

          {currentScreen === 'setup' && (
            <SetupModal
              onComplete={handleSetupComplete}
              onBack={() => setCurrentScreen('onboarding')}
            />
          )}

          {currentScreen === 'main' && (
            <div className="flex-1 flex flex-col h-full">
              <HeaderNav
                stats={stats}
                currentUser={currentUser}
                onOpenGoogleAuth={() => setIsGoogleAuthModalOpen(true)}
                onSelectLanguage={handleLanguageChange}
                onResetToOnboarding={() => setCurrentScreen('onboarding')}
              />

              <main className="flex-1 overflow-y-auto">
                {activeTab === 'lina' && (
                  <LinaChatStudio
                    selectedLanguage={stats.selectedLanguage}
                    onPracticePointsEarned={handlePracticePoints}
                  />
                )}

                {activeTab === 'path' && (
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
                )}

                {activeTab === 'review' && (
                  <VocabReview
                    selectedLanguage={stats.selectedLanguage}
                    cards={flashcards}
                    onUpdateCardMastery={handleUpdateCardMastery}
                  />
                )}

                {activeTab === 'profile' && (
                  <LeaderboardView
                    stats={stats}
                    currentUser={currentUser}
                    onOpenGoogleAuth={() => setIsGoogleAuthModalOpen(true)}
                  />
                )}
              </main>

              <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
            </div>
          )}
        </div>

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
      </div>
    </div>
  );
}
