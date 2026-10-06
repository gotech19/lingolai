import React from 'react';
import { INITIAL_LEADERBOARD } from '../data/mockData';
import { UserStats, UserProfile } from '../types';
import { playTapSound } from '../utils/audio';
import { Trophy, Flame, Sparkles, Medal, Shield, Award, Check, User } from 'lucide-react';
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
    <div className="w-full max-w-md mx-auto pb-24 px-4 pt-2">
      {/* Google Account Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Profil LinGoL
            </span>
            {currentUser.isAuthenticated && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> Google Connecté
              </span>
            )}
          </div>
          <button
            onClick={() => {
              playTapSound();
              onOpenGoogleAuth();
            }}
            className="text-xs font-semibold text-[#004ac6] hover:underline"
          >
            {currentUser.isAuthenticated ? 'Gérer' : 'Connexion'}
          </button>
        </div>

        {currentUser.isAuthenticated ? (
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full border-2 border-blue-100 object-cover shadow-2xs"
            />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-slate-800 truncate">{currentUser.name}</div>
              <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Synchronisation Cloud LinGoL activée
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                <GoogleIcon />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Authentification Google</div>
                <div className="text-[11px] text-slate-500">Sauvegardez vos séries & vocabulaire</div>
              </div>
            </div>
            <button
              onClick={() => {
                playTapSound();
                onOpenGoogleAuth();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#4285F4] text-white text-xs font-bold hover:bg-[#3367D6] transition-colors shadow-2xs"
            >
              Connecter
            </button>
          </div>
        )}
      </div>

      {/* League Banner */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-indigo-950 via-[#004ac6] to-blue-900 text-white shadow-md mb-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-1">
              <Shield className="w-3.5 h-3.5 text-blue-300" /> Ligue Diamant
            </div>
            <h2
              className="text-xl md:text-2xl font-bold tracking-tight mb-1"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Tournoi LinGoL
            </h2>
            <p className="text-xs text-blue-100">Top 3 promu en Division Maître dans 2 jours</p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-inner">
            💎
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 mb-5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Classement Hebdomadaire</span>
        </h3>

        <div className="space-y-2">
          {users.map((u) => {
            const isTop3 = u.rank <= 3;
            const medalEmoji = u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : u.rank === 3 ? '🥉' : null;

            return (
              <div
                key={u.name}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  u.isCurrentUser
                    ? 'border-[#004ac6] bg-blue-50/80 shadow-xs'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 text-center font-bold text-xs text-slate-500 tabular-nums">
                    {medalEmoji || `#${u.rank}`}
                  </div>
                  <div className="text-xl">{u.avatar}</div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{u.name}</span>
                      {u.isCurrentUser && (
                        <span className="text-[10px] bg-[#004ac6] text-white px-1.5 py-0.2 rounded font-bold">
                          VOUS
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {isTop3 ? 'Zone de Promotion' : 'Zone de Maintien'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-extrabold text-[#004ac6] tabular-nums">
                    {u.xp} XP
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#004ac6]" />
          <span>Badges & Succès</span>
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3 rounded-2xl border flex flex-col justify-between ${
                ach.unlocked
                  ? 'border-amber-200 bg-amber-50/40'
                  : 'border-slate-100 bg-slate-50/50 opacity-60'
              }`}
            >
              <div>
                <div className="text-2xl mb-1.5">{ach.icon}</div>
                <div className="text-xs font-bold text-slate-900 leading-tight mb-1">
                  {ach.title}
                </div>
                <div className="text-[10px] text-slate-500 leading-snug">{ach.desc}</div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-slate-200/50 text-[10px] font-bold text-amber-700">
                {ach.unlocked ? '✓ Débloqué' : ach.progress || 'Verrouillé'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paramètres & Remise à zéro vierge */}
      {onOpenResetModal && (
        <div className="mt-5 bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
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
        </div>
      )}
    </div>
  );
};
