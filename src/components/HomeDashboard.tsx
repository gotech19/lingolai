import React from 'react';
import { UserStats, UserProfile, LanguageCode } from '../types';
import { LANGUAGES, INITIAL_MISSIONS } from '../data/mockData';
import { playTapSound } from '../utils/audio';
import {
  Sparkles,
  Flame,
  Zap,
  Target,
  ArrowRight,
  BookOpen,
  Mic,
  Headphones,
  CheckCircle2,
  Clock,
  Compass,
  Layers,
  ChevronRight,
  Bot,
  Radio,
} from 'lucide-react';

interface HomeDashboardProps {
  stats: UserStats;
  currentUser: UserProfile;
  onNavigateTab: (tab: any) => void;
  onOpenNextLesson: () => void;
  onOpenLinaChat: () => void;
  onOpenSpeakingCoach: () => void;
  currentLessonTitle?: string;
  currentUnitTitle?: string;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  stats,
  currentUser,
  onNavigateTab,
  onOpenNextLesson,
  onOpenLinaChat,
  onOpenSpeakingCoach,
  currentLessonTitle = 'Commander au Café & Boissons',
  currentUnitTitle = 'Unité 1 : Café & Salutations',
}) => {
  const currentLang = LANGUAGES.find((l) => l.code === stats.selectedLanguage) || LANGUAGES[0];
  const goalPercentage = Math.min(100, Math.round((stats.todayMinutesPracticed / Math.max(1, stats.dailyGoalMinutes)) * 100));
  const remainingMinutes = Math.max(0, stats.dailyGoalMinutes - stats.todayMinutesPracticed);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const displayName = currentUser.isAuthenticated ? currentUser.name.split(' ')[0] : 'Apprenant';

  const recommendations = [
    {
      id: 'rec-speaking',
      title: 'Expression Orale',
      desc: 'Conversation active au microphone avec Lina AI',
      icon: Mic,
      color: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
      action: onOpenLinaChat,
    },
    {
      id: 'rec-coach',
      title: 'Coach Prononciation',
      desc: 'Shadowing, fluidité et score d\'intelligibilité',
      icon: Radio,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
      action: onOpenSpeakingCoach,
    },
    {
      id: 'rec-vocab',
      title: 'Flashcards Vocabulaire',
      desc: 'Répétition espacée des termes récents',
      icon: Layers,
      color: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
      action: () => onNavigateTab('review'),
    },
    {
      id: 'rec-path',
      title: 'Leçon Suivante',
      desc: 'Exercices guidés, écoute et grammaire',
      icon: Compass,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
      action: onOpenNextLesson,
    },
  ];

  return (
    <div className="w-full h-full pb-20 md:pb-8 pt-1 space-y-6">
      {/* 1. TOP COMMAND BAR: Greeting + Stats pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] dark:text-blue-400">
              Tableau de Bord LinGoL
            </span>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-[#2563EB] dark:text-blue-300 font-extrabold px-2 py-0.5 rounded-full">
              {stats.cefrLevel || 'A1'}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, {displayName} ! 👋
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Objectif : Maîtriser le {currentLang.name} ({currentLang.flag}) grâce à la pratique vocale quotidienne.
          </p>
        </div>

        {/* Quick Highlights */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-800/60">
            <span className="text-lg">🔥</span>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold leading-none">Série</div>
              <div className="text-xs font-black text-orange-600 dark:text-orange-400">{stats.streakDays} jours</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60">
            <span className="text-lg">⚡</span>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold leading-none">Total XP</div>
              <div className="text-xs font-black text-[#2563EB] dark:text-blue-400">{stats.xp} pts</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
            <span className="text-lg">💎</span>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold leading-none">Lingots</div>
              <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">{stats.gems}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. HERO ROW: Main "Continue Learning" Card + Daily Goal Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Continue Learning Card (8 cols) */}
        <div className="lg:col-span-8 bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#0F766E] rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-200 bg-white/15 px-2.5 py-0.5 rounded-full">
                {currentUnitTitle}
              </span>
              <span className="text-[11px] text-blue-100 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> ~ 5 min
              </span>
            </div>

            <h3 className="text-xl md:text-2xl font-black tracking-tight leading-snug">
              {currentLessonTitle}
            </h3>
            <p className="text-xs md:text-sm text-blue-100/90 max-w-lg leading-relaxed">
              Pratiquez les formules essentielles pour échanger avec assurance au restaurant ou en voyage.
            </p>
          </div>

          <div className="relative z-10 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/20">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-blue-100">Progression :</span>
              <div className="w-36 md:w-48 bg-white/25 rounded-full h-2.5 overflow-hidden">
                <div className="bg-amber-300 h-full rounded-full transition-all" style={{ width: '65%' }} />
              </div>
              <span className="text-xs font-bold text-amber-200">65%</span>
            </div>

            <button
              onClick={() => {
                playTapSound();
                onOpenNextLesson();
              }}
              className="py-3 px-6 rounded-2xl bg-white hover:bg-blue-50 text-[#2563EB] font-black text-xs md:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>Continuer la leçon</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Daily Goal Card with Progress Ring (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#2563EB]" />
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Objectif du Jour</h4>
            </div>
            <span className="text-xs font-bold text-slate-400">{stats.dailyGoalMinutes} min visées</span>
          </div>

          {/* Progress Ring Visualization */}
          <div className="my-auto py-4 flex items-center justify-center gap-5">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-24 h-24 -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-100 dark:text-slate-800"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="transparent"
                  stroke="#2563EB"
                  strokeWidth="8"
                  strokeDasharray="251"
                  strokeDashoffset={251 - (251 * goalPercentage) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black text-slate-900 dark:text-white">{goalPercentage}%</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">Atteint</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Temps pratiqué</span>
                <strong className="text-sm font-black text-slate-800 dark:text-slate-100">
                  {stats.todayMinutesPracticed} min
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Restant aujourd'hui</span>
                <strong className="text-xs font-bold text-[#0D9488]">
                  {remainingMinutes === 0 ? '✓ Complété !' : `${remainingMinutes} min`}
                </strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playTapSound();
              onOpenLinaChat();
            }}
            className="w-full py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 text-[#2563EB] dark:text-blue-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Pratiquer 5 min avec Lina</span>
          </button>
        </div>
      </div>

      {/* 3. RECOMMENDED FOR YOU (Adaptive Learning Engine) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Recommandé pour vous (IA Adaptative)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Personnalisé selon vos sessions</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.map((rec) => {
            const Icon = rec.icon;
            return (
              <div
                key={rec.id}
                onClick={() => {
                  playTapSound();
                  rec.action();
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-2xs hover:shadow-md hover:border-[#2563EB] transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${rec.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-white group-hover:text-[#2563EB] transition-colors">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {rec.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-[#2563EB] dark:text-blue-400">
                  <span>Commencer</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. DAILY MISSIONS (3 missions with progress & rewards) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Missions Quotidiennes
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400">Renouvellement à minuit</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INITIAL_MISSIONS.map((mission) => (
            <div
              key={mission.id}
              className={`p-4 rounded-2xl border transition-all ${
                mission.isCompleted
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{mission.icon}</span>
                <span className="text-xs font-bold text-[#2563EB] bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  +{mission.rewardXp} XP · +{mission.rewardGems} 💎
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1">
                {mission.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-snug">
                {mission.description}
              </p>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>Progression</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {mission.progress}/{mission.target}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      mission.isCompleted ? 'bg-emerald-500' : 'bg-[#2563EB]'
                    }`}
                    style={{ width: `${Math.min(100, (mission.progress / mission.target) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
