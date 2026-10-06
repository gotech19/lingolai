import React from 'react';
import { UserStats, LanguageCode } from '../types';
import { LANGUAGES } from '../data/mockData';
import {
  TrendingUp,
  BarChart3,
  Award,
  Clock,
  Zap,
  Flame,
  CheckCircle2,
  BookOpen,
  Mic,
  Headphones,
  Eye,
  PenTool,
  Radio,
} from 'lucide-react';

interface ProgressAnalyticsProps {
  stats: UserStats;
}

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ stats }) => {
  const currentLang = LANGUAGES.find((l) => l.code === stats.selectedLanguage) || LANGUAGES[0];

  const skillMetrics = [
    { name: 'Expression Orale', score: 86, icon: Mic, color: 'bg-blue-500' },
    { name: 'Prononciation', score: 92, icon: Radio, color: 'bg-emerald-500' },
    { name: 'Vocabulaire', score: 88, icon: BookOpen, color: 'bg-amber-500' },
    { name: 'Compréhension Orale', score: 80, icon: Headphones, color: 'bg-indigo-500' },
    { name: 'Grammaire', score: 78, icon: Zap, color: 'bg-rose-500' },
    { name: 'Lecture', score: 85, icon: Eye, color: 'bg-teal-500' },
    { name: 'Écriture', score: 75, icon: PenTool, color: 'bg-purple-500' },
  ];

  const weeklyTime = [
    { day: 'Lun', mins: 12 },
    { day: 'Mar', mins: 15 },
    { day: 'Mer', mins: 10 },
    { day: 'Jeu', mins: 20 },
    { day: 'Ven', mins: 14 },
    { day: 'Sam', mins: 8 },
    { day: 'Dim', mins: stats.todayMinutesPracticed || 6 },
  ];

  const maxMins = Math.max(...weeklyTime.map((d) => d.mins), 20);

  return (
    <div className="w-full h-full pb-20 md:pb-8 pt-1 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] dark:text-blue-400">
              Analytique d'Apprentissage
            </span>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-[#2563EB] dark:text-blue-300 font-extrabold px-2 py-0.5 rounded-full">
              CEFR {stats.cefrLevel || 'A1'}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Progression & Compétences
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Analyse détaillée de vos performances en {currentLang.name} ({currentLang.nativeName}).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Niveau Actuel</div>
            <div className="text-sm font-black text-[#2563EB] dark:text-blue-400">
              Palier {stats.cefrLevel || 'A1'} · Intermédiaire
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Charts + Skills Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Weekly Study Time Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#2563EB]" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Temps d'Étude Hebdomadaire
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400">7 derniers jours</span>
          </div>

          {/* Simple Clean Responsive Bar Chart */}
          <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2">
            {weeklyTime.map((d, i) => {
              const heightPercent = Math.round((d.mins / maxMins) * 100);
              const isToday = i === weeklyTime.length - 1;

              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.mins}m
                  </span>
                  <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-t-xl h-full flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isToday ? 'bg-[#2563EB]' : 'bg-[#0D9488]'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      isToday ? 'text-[#2563EB] font-black' : 'text-slate-500'
                    }`}
                  >
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span>Moyenne quotidienne : <strong>12.5 min/jour</strong></span>
            <span className="text-[#0D9488] font-bold">Régularité optimale 🔥</span>
          </div>
        </div>

        {/* Right: 7-Skill Mastery Matrix (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Radar des Compétences
            </h3>
            <span className="text-xs font-bold text-[#2563EB]">CEFR {stats.cefrLevel}</span>
          </div>

          <div className="space-y-3">
            {skillMetrics.map((skill) => {
              const Icon = skill.icon;
              return (
                <div key={skill.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{skill.name}</span>
                    </div>
                    <span className="text-slate-900 dark:text-white tabular-nums">{skill.score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${skill.color}`}
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
