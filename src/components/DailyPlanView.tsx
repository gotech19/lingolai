import React, { useState } from 'react';
import { DailyPlanItem, LanguageCode } from '../types';
import { INITIAL_DAILY_PLAN, LANGUAGES } from '../data/mockData';
import { playTapSound, playCorrectSound } from '../utils/audio';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  Mic,
  Headphones,
  Check,
  Sparkles,
} from 'lucide-react';

interface DailyPlanViewProps {
  selectedLanguage: LanguageCode;
  onNavigateTab: (tab: any) => void;
  onOpenLinaChat: () => void;
  onOpenSpeakingCoach: () => void;
}

export const DailyPlanView: React.FC<DailyPlanViewProps> = ({
  selectedLanguage,
  onNavigateTab,
  onOpenLinaChat,
  onOpenSpeakingCoach,
}) => {
  const [planItems, setPlanItems] = useState<DailyPlanItem[]>(INITIAL_DAILY_PLAN);
  const currentLang = LANGUAGES.find((l) => l.code === selectedLanguage) || LANGUAGES[0];

  const completedCount = planItems.filter((p) => p.isCompleted).length;
  const completionPercent = Math.round((completedCount / planItems.length) * 100);
  const totalMinutes = planItems.reduce((acc, curr) => acc + curr.durationMin, 0);

  const handleToggleItem = (id: string) => {
    playTapSound();
    setPlanItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.isCompleted;
          if (nextState) playCorrectSound();
          return { ...item, isCompleted: nextState };
        }
        return item;
      })
    );
  };

  const getAction = (type: DailyPlanItem['type']) => {
    switch (type) {
      case 'speaking':
        return onOpenSpeakingCoach;
      case 'vocabulary':
        return () => onNavigateTab('review');
      case 'listening':
        return onOpenLinaChat;
      default:
        return () => onNavigateTab('learn');
    }
  };

  const getTypeIcon = (type: DailyPlanItem['type']) => {
    switch (type) {
      case 'speaking':
        return <Mic className="w-4 h-4 text-emerald-500" />;
      case 'vocabulary':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'listening':
        return <Headphones className="w-4 h-4 text-indigo-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="w-full h-full pb-20 md:pb-8 pt-1 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] dark:text-blue-400">
              Planning d'Entraînement
            </span>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-[#2563EB] dark:text-blue-300 font-extrabold px-2 py-0.5 rounded-full">
              Aujourd'hui
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Plan Quotidien LinGoL
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Un programme équilibré pour progresser sans surcharger vos journées en {currentLang.name}.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Temps total prévu</div>
            <div className="text-sm font-black text-slate-800 dark:text-slate-100">{totalMinutes} minutes</div>
          </div>
        </div>
      </div>

      {/* Progress Metric & Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Timeline (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Activités d'Aujourd'hui ({completedCount}/{planItems.length})
            </h3>
            <span className="text-xs font-bold text-emerald-600">
              {completionPercent}% achevé
            </span>
          </div>

          <div className="space-y-3">
            {planItems.map((item, idx) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  item.isCompleted
                    ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 opacity-80'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-2xs hover:border-[#2563EB]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => handleToggleItem(item.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      item.isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'border-2 border-slate-300 dark:border-slate-600 hover:border-[#2563EB]'
                    }`}
                  >
                    {item.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0">{getTypeIcon(item.type)}</span>
                      <h4
                        className={`text-xs md:text-sm font-bold truncate ${
                          item.isCompleted
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {item.title}
                      </h4>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{item.durationMin} minutes</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={getAction(item.type)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer ${
                    item.isCompleted
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                      : 'bg-blue-50 dark:bg-blue-900/40 text-[#2563EB] dark:text-blue-300 hover:bg-blue-100'
                  }`}
                >
                  <span>{item.isCompleted ? 'Revoir' : 'Lancer'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Summary Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-[#2563EB] to-indigo-900 text-white rounded-3xl p-6 shadow-md space-y-4">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wide">
              Bilan du Rythme
            </span>
            <div className="text-3xl font-black">{completionPercent}%</div>
            <p className="text-xs text-blue-100 leading-relaxed">
              Consacrer 15 minutes régulières par jour est 4 fois plus efficace qu'une session intensive le week-end.
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenSpeakingCoach}
                className="w-full py-2.5 rounded-xl bg-white text-[#2563EB] font-bold text-xs hover:bg-blue-50 transition-colors shadow-xs"
              >
                Pratiquer l'oral maintenant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
