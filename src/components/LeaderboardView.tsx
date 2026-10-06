import React from 'react';
import { INITIAL_LEADERBOARD } from '../data/mockData';
import { UserStats, UserProfile } from '../types';
import { playTapSound } from '../utils/audio';
import { Trophy, Flame, Sparkles, Medal, Shield, Award, Check, User, Clock, RotateCcw } from 'lucide-react';
import { GoogleIcon } from './OnboardingScreen';

interface LeaderboardViewProps {
  stats: UserStats;
  currentUser: UserProfile;
  onOpenGoogleAuth: () => void;
  onOpenResetModal?: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  stats,
  currentUser,
  onOpenGoogleAuth,
  onOpenResetModal,
}) => {
  const users = [...INITIAL_LEADERBOARD];
  const curUser = users.find((u) => u.isCurrentUser);
  if (curUser) {
    curUser.xp = stats.xp;
    if (currentUser.isAuthenticated) {
      curUser.name = currentUser.name;
    }
  }
  users.sort((a, b) => b.xp - a.xp);
  users.forEach((u, i) => {
    u.rank = i + 1;
  });

  const achievements = [
    {
      id: 'ach-1',
      title: 'Partenaire de Lina',
      desc: 'Première conversation vocale avec Lina AI',
      unlocked: true,
      icon: '🤖',
    },
    {
      id: 'ach-2',
      title: 'Série de 7 jours',
      desc: 'Pratiquez chaque jour pendant une semaine',
      unlocked: stats.streakDays >= 7,
      progress: `${Math.min(7, stats.streakDays)}/7 jours`,
      icon: '🔥',
    },
    {
      id: 'ach-3',
      title: 'Expert Café & Bistro',
      desc: 'Commandez en langue cible avec votre micro',
      unlocked: true,
      icon: '☕',
    },
    {
      id: 'ach-4',
      title: 'Ligue Diamant',
      desc: 'Atteignez le podium du tournoi LinGoL',
      unlocked: true,
      icon: '💎',
    },
  ];

  return (
    <div className="w-full h-full pb-20 md:pb-8 pt-2">
      {/* Top Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-indigo-950 via-[#004ac6] to-blue-900 text-white shadow-md mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">
              <Shield className="w-4 h-4 text-blue-300" />
              <span>Ligue Diamant • Division Maître</span>
            </div>
            <h2
              className="text-2xl md:text-3xl font-black tracking-tight mb-1"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Tournoi Hebdomadaire LinGoL
            </h2>
            <div className="flex items-center gap-2 text-xs text-blue-100">
              <Clock className="w-3.5 h-3.5 text-blue-200" />
              <span>Fin du tournoi dans 2 jours · Top 3 qualifié en ligue supérieure</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-inner">
              💎
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Grid: Leaderboard on Left, Profile & Badges on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Leaderboard Rankings Table (7 cols on desktop) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Classement des Apprenants</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">Total : {users.length} apprenants</span>
          </div>

          <div className="space-y-2">
            {users.map((u) => {
              const isTop3 = u.rank <= 3;
              const medalEmoji = u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : u.rank === 3 ? '🥉' : null;

              return (
                <div
                  key={u.name}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    u.isCurrentUser
                      ? 'border-[#004ac6] bg-blue-50/80 shadow-2xs'
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-7 text-center font-black text-sm text-slate-600 tabular-nums">
                      {medalEmoji || `#${u.rank}`}
                    </div>
                    <div className="text-2xl">{u.avatar}</div>
                    <div>
                      <div className="text-xs md:text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>{u.name}</span>
                        {u.isCurrentUser && (
                          <span className="text-[10px] bg-[#004ac6] text-white px-2 py-0.5 rounded-full font-bold">
                            VOUS
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {isTop3 ? (
                          <span className="text-emerald-600 font-semibold">Promotion en Maître</span>
                        ) : (
                          'Zone de maintien'
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs md:text-sm font-black text-[#004ac6] tabular-nums">
                      {u.xp} XP
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: User Profile & Achievements Showcase (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Google Account Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Compte LinGoL
                </span>
                {currentUser.isAuthenticated && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Connecté
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  playTapSound();
                  onOpenGoogleAuth();
                }}
                className="text-xs font-bold text-[#004ac6] hover:underline"
              >
                {currentUser.isAuthenticated ? 'Gérer' : 'Connexion'}
              </button>
            </div>

            {currentUser.isAuthenticated ? (
              <div className="flex items-center gap-3.5">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full border-2 border-blue-200 object-cover shadow-2xs"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-slate-800 truncate">{currentUser.name}</div>
                  <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    Synchronisation active
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                    <GoogleIcon />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Authentification Google</div>
                    <div className="text-[11px] text-slate-500">Sauvegardez vos progrès</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    playTapSound();
                    onOpenGoogleAuth();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#4285F4] text-white text-xs font-bold hover:bg-[#3367D6] transition-colors shadow-2xs cursor-pointer"
                >
                  Connecter
                </button>
              </div>
            )}
          </div>

          {/* Achievements Grid */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#004ac6]" />
                <span>Badges & Succès</span>
              </h3>
              <span className="text-xs text-slate-400 font-bold">2/4 débloqués</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
                    ach.unlocked
                      ? 'border-amber-200 bg-amber-50/50'
                      : 'border-slate-100 bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div>
                    <div className="text-2xl mb-1.5">{ach.icon}</div>
                    <div className="text-xs font-bold text-slate-900 leading-tight mb-1">
                      {ach.title}
                    </div>
                    <div className="text-[10px] text-slate-500 leading-snug">{ach.desc}</div>
                  </div>
                  <div className="mt-2.5 pt-1.5 border-t border-slate-200/50 text-[10px] font-bold text-amber-700">
                    {ach.unlocked ? '✓ Débloqué' : ach.progress || 'Verrouillé'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reset Clean Slate Button */}
          {onOpenResetModal && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">Données & Progression</div>
                <div className="text-[11px] text-slate-500">Mettre l'application à zéro (état vierge)</div>
              </div>
              <button
                onClick={() => {
                  playTapSound();
                  onOpenResetModal();
                }}
                className="py-1.5 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors cursor-pointer"
              >
                Mettre à zéro
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
