import React, { useState } from 'react';
import { LanguageCode } from '../types';
import { LANGUAGES } from '../data/mockData';
import { playTapSound } from '../utils/audio';
import { Check, Sparkles, Clock, Globe } from 'lucide-react';

interface SetupModalProps {
  onComplete: (lang: LanguageCode, dailyGoal: number) => void;
  onBack: () => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ onComplete, onBack }) => {
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('es');
  const [dailyGoal, setDailyGoal] = useState<number>(10);
  const [motivation, setMotivation] = useState<string>('travel');

  const goals = [
    { minutes: 5, label: 'Détente', desc: '5 min / jour' },
    { minutes: 10, label: 'Régulier', desc: '10 min / jour (Recommandé)' },
    { minutes: 15, label: 'Sérieux', desc: '15 min / jour' },
    { minutes: 20, label: 'Intensif', desc: '20 min / jour' },
  ];

  const motivations = [
    { id: 'travel', label: 'Voyage & Échanges', emoji: '✈️' },
    { id: 'career', label: 'Carrière & Travail', emoji: '💼' },
    { id: 'brain', label: 'Mémoire & Esprit', emoji: '🧠' },
    { id: 'culture', label: 'Culture & Amis', emoji: '🎉' },
  ];

  const handleFinish = () => {
    playTapSound();
    onComplete(selectedLang, dailyGoal);
  };

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex flex-col font-sans relative select-none">
      <header className="w-full max-w-md mx-auto px-5 pt-4 pb-2 flex items-center justify-between z-20">
        <button
          onClick={() => {
            playTapSound();
            onBack();
          }}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 py-1.5 px-3 rounded-lg"
        >
          ← Retour
        </button>
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#004ac6] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
          <Sparkles className="w-3.5 h-3.5" /> Configuration LinGoL
        </div>
      </header>

      <main className="flex-grow flex flex-col justify-between px-5 md:px-8 py-2 w-full max-w-md mx-auto pb-6">
        <div className="space-y-4">
          <div>
            <h2
              className="text-xl md:text-2xl font-bold text-[#004ac6] tracking-tight mb-1"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Que souhaitez-vous apprendre ?
            </h2>
            <p className="text-xs text-[#434655]">
              Lina AI adaptera ses conversations et exercices à vos objectifs.
            </p>
          </div>

          {/* Language selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-[#004ac6]" /> Langue cible
            </label>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      playTapSound();
                      setSelectedLang(lang.code);
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#004ac6] bg-blue-50/70 shadow-2xs ring-1 ring-[#004ac6]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{lang.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{lang.nativeName}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Goal */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#004ac6]" /> Objectif quotidien
            </label>
            <div className="space-y-1.5">
              {goals.map((g) => {
                const isSelected = dailyGoal === g.minutes;
                return (
                  <button
                    key={g.minutes}
                    onClick={() => {
                      playTapSound();
                      setDailyGoal(g.minutes);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#004ac6] bg-blue-50/70 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800">{g.label}</span>
                      <span className="text-[11px] text-slate-500 ml-2">({g.desc})</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#004ac6]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Motivation */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Votre motivation principale</label>
            <div className="grid grid-cols-2 gap-2">
              {motivations.map((m) => {
                const isSelected = motivation === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      playTapSound();
                      setMotivation(m.id);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#004ac6] bg-blue-50/80 text-[#004ac6]'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button
            onClick={handleFinish}
            className="w-full btn-3d-primary text-white rounded-xl py-3.5 font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Démarrer avec LinGoL</span>
            <span>🚀</span>
          </button>
        </div>
      </main>
    </div>
  );
};
