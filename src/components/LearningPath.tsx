import React, { useState } from 'react';
import { Unit, UnitLesson, LanguageCode, WordOfTheDay } from '../types';
import { playTapSound, playFanfareSound } from '../utils/audio';
import { WordOfTheDayCard } from './WordOfTheDayCard';
import { Lock, Check, Sparkles, BookOpen, Star, Trophy, Award, Mic, X } from 'lucide-react';

interface LearningPathProps {
  units: Unit[];
  selectedLanguage: LanguageCode;
  onOpenLesson: (lesson: UnitLesson) => void;
  onOpenLinaChat: () => void;
  onAddToVocab: (word: WordOfTheDay) => void;
  isAlreadyInVocab: (term: string) => boolean;
  onOpenVocabReview: () => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({
  units,
  selectedLanguage,
  onOpenLesson,
  onOpenLinaChat,
  onAddToVocab,
  isAlreadyInVocab,
  onOpenVocabReview,
}) => {
  const [guidebookUnit, setGuidebookUnit] = useState<Unit | null>(null);
  const [showChestModal, setShowChestModal] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto pb-24 px-4 pt-2">
      {/* Daily Quest / Voice Practice Banner */}
      <div
        onClick={() => {
          playTapSound();
          onOpenLinaChat();
        }}
        className="mb-3.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-xs cursor-pointer hover:border-blue-400 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
            🎙️
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Pratique Orale avec Lina</span>
              <span className="text-[10px] bg-blue-100 text-[#004ac6] font-bold px-1.5 py-0.2 rounded-full">
                Micro 24/7
              </span>
            </div>
            <div className="text-[11px] text-slate-500">Parlez au micro et obtenez un retour immédiat</div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-[#004ac6] bg-white px-2.5 py-1 rounded-full border border-blue-200 shadow-2xs group-hover:bg-blue-50">
            Parler →
          </span>
        </div>
      </div>

      {/* Word of the Day Feature */}
      <WordOfTheDayCard
        selectedLanguage={selectedLanguage}
        onAddToVocab={onAddToVocab}
        isAlreadyInVocab={isAlreadyInVocab}
        onOpenVocabReview={onOpenVocabReview}
      />

      {units.map((unit) => (
        <section key={unit.id} className="mb-8">
          {/* Unit Header Card */}
          <div
            className="rounded-2xl p-4 text-white shadow-md mb-6 relative overflow-hidden"
            style={{
              background:
                unit.number === 1
                  ? 'linear-gradient(135deg, #004ac6 0%, #2563eb 100%)'
                  : 'linear-gradient(135deg, #006c49 0%, #059669 100%)',
            }}
          >
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-100 mb-0.5">
                  Unité {unit.number}
                </div>
                <h2
                  className="text-lg md:text-xl font-bold tracking-tight text-white mb-1"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {unit.title}
                </h2>
                <p className="text-xs text-blue-50/90 max-w-xs">{unit.description}</p>
              </div>

              <button
                onClick={() => {
                  playTapSound();
                  setGuidebookUnit(unit);
                }}
                className="bg-white/15 hover:bg-white/25 active:bg-white/30 backdrop-blur-md p-2 rounded-xl border border-white/20 text-white transition-colors cursor-pointer"
                title="Consulter le guide de grammaire"
                aria-label="Guide de grammaire"
              >
                <BookOpen className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Zigzag Learning Path Nodes */}
          <div className="flex flex-col items-center space-y-6 relative py-2">
            {unit.lessons.map((lesson, index) => {
              const offsets = [0, 52, -52, 40, 0];
              const xOffset = offsets[index % offsets.length];

              const isCurrent = !lesson.isCompleted && !lesson.isLocked;
              const isLinaPractice = lesson.id === 'u1-l3';

              return (
                <div
                  key={lesson.id}
                  className="relative flex flex-col items-center transition-transform"
                  style={{ transform: `translateX(${xOffset}px)` }}
                >
                  {/* Floating "COMMENCER" badge for active node */}
                  {isCurrent && (
                    <div className="absolute -top-9 z-20 animate-bounce">
                      <div className="bg-[#004ac6] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 border border-blue-400">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>COMMENCER</span>
                      </div>
                      <div className="w-2 h-2 bg-[#004ac6] rotate-45 mx-auto -mt-1" />
                    </div>
                  )}

                  {/* Node Circle Button */}
                  <button
                    disabled={lesson.isLocked}
                    onClick={() => {
                      playTapSound();
                      if (isLinaPractice) {
                        onOpenLinaChat();
                      } else {
                        onOpenLesson(lesson);
                      }
                    }}
                    className={`relative w-18 h-18 rounded-full flex items-center justify-center transition-all cursor-pointer select-none ${
                      lesson.isCompleted
                        ? 'bg-amber-400 text-amber-950 shadow-[0_5px_0_0_#d97706] hover:bg-amber-300'
                        : isCurrent
                        ? 'bg-[#004ac6] text-white shadow-[0_6px_0_0_#002f80] ring-4 ring-blue-100 hover:bg-[#0053db] active:translate-y-1 active:shadow-[0_2px_0_0_#002f80]'
                        : 'bg-slate-200 text-slate-400 shadow-[0_5px_0_0_#cbd5e1] opacity-70 cursor-not-allowed'
                    }`}
                  >
                    {/* Ring progress indicator */}
                    <svg className="absolute -inset-1.5 w-21 h-21 -rotate-90 pointer-events-none">
                      <circle
                        cx="42"
                        cy="42"
                        r="38"
                        fill="transparent"
                        stroke={lesson.isCompleted ? '#f59e0b' : isCurrent ? '#004ac6' : '#e2e8f0'}
                        strokeWidth="3.5"
                        strokeDasharray="238"
                        strokeDashoffset={lesson.isCompleted ? '0' : isCurrent ? '120' : '238'}
                        className="transition-all duration-500"
                      />
                    </svg>

                    {/* Node Icon */}
                    {lesson.isCompleted ? (
                      <Check className="w-7 h-7 stroke-[3] text-amber-950" />
                    ) : lesson.isLocked ? (
                      <Lock className="w-6 h-6 text-slate-400" />
                    ) : isLinaPractice ? (
                      <span className="text-2xl">🎙️</span>
                    ) : (
                      <Star className="w-7 h-7 fill-white text-white" />
                    )}

                    {/* Star Badge for completed */}
                    {lesson.isCompleted && (
                      <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 shadow-xs">
                        <Star className="w-3 h-3 fill-white" />
                      </div>
                    )}
                  </button>

                  {/* Lesson Label */}
                  <div className="mt-2 text-center max-w-[130px]">
                    <div
                      className={`text-xs font-bold leading-tight ${
                        isCurrent
                          ? 'text-[#004ac6]'
                          : lesson.isCompleted
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {lesson.title}
                    </div>
                    {isCurrent && (
                      <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">
                        +{lesson.xpReward} XP
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Mystery Chest / Checkpoint milestone */}
            <div className="pt-2">
              <button
                onClick={() => {
                  playTapSound();
                  setShowChestModal(true);
                }}
                className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-[0_4px_0_0_#f59e0b] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                title="Coffre de récompenses LinGoL"
              >
                🎁
              </button>
            </div>
          </div>
        </section>
      ))}

      {/* In-App Grammar Guidebook Modal (No browser alert) */}
      {guidebookUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 animate-scaleUp">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#004ac6]" />
                <h3 className="font-bold text-sm text-slate-800">
                  Guide - Unité {guidebookUnit.number}
                </h3>
              </div>
              <button
                onClick={() => setGuidebookUnit(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                <span className="font-bold text-[#004ac6] block mb-1">
                  1. Ordre des mots et politesse
                </span>
                Pratiquez toujours les formules comme « por favor » et « gracias ».
              </div>
              <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-100">
                <span className="font-bold text-amber-800 block mb-1">
                  2. Masculin et Féminin
                </span>
                Les noms masculins utilisent « el / un », les féminins « la / una ».
              </div>
              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                <span className="font-bold text-emerald-800 block mb-1">
                  3. Entraînement au micro
                </span>
                Répétez chaque phrase à voix haute pour valider votre accent avec Lina.
              </div>
            </div>

            <button
              onClick={() => setGuidebookUnit(null)}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#004ac6] text-white font-bold text-xs hover:bg-[#003da6] transition-colors"
            >
              Compris, continuer
            </button>
          </div>
        </div>
      )}

      {/* In-App Reward Chest Modal (No browser alert) */}
      {showChestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 text-center shadow-2xl border border-slate-100 animate-scaleUp">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl">
              🎁
            </div>
            <h3 className="font-black text-lg text-slate-800 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Coffre Mystère LinGoL
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Terminez toutes les leçons de l'Unité 1 pour débloquer +50 Lingots 💎 et le badge d'Explorateur !
            </p>
            <button
              onClick={() => {
                playFanfareSound();
                setShowChestModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-xs"
            >
              C'est parti !
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
