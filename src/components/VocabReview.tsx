import React, { useState } from 'react';
import { LANGUAGES } from '../data/mockData';
import { Flashcard, LanguageCode } from '../types';
import { playTapSound, playCorrectSound, speakText } from '../utils/audio';
import { Volume2, RotateCw, Check, BookOpen, Sparkles, Search, Layers, CheckCircle2 } from 'lucide-react';

interface VocabReviewProps {
  selectedLanguage: LanguageCode;
  cards: Flashcard[];
  onUpdateCardMastery: (cardId: string, success: boolean) => void;
}

export const VocabReview: React.FC<VocabReviewProps> = ({
  selectedLanguage,
  cards,
  onUpdateCardMastery,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const safeIdx = Math.min(currentIdx, Math.max(0, cards.length - 1));
  const card = cards[safeIdx];
  const currentLang = LANGUAGES.find((l) => l.code === selectedLanguage) || LANGUAGES[0];

  const handleFlip = () => {
    playTapSound();
    setIsFlipped(!isFlipped);
  };

  const handleAudio = (e: React.MouseEvent, termToPlay?: string) => {
    e.stopPropagation();
    const text = termToPlay || card?.term;
    if (!text) return;
    playTapSound();
    setIsPlayingAudio(true);
    speakText(text, currentLang.voiceLang, () => setIsPlayingAudio(false));
  };

  const handleResult = (success: boolean) => {
    playTapSound();
    if (success) {
      playCorrectSound();
    }
    if (card) {
      onUpdateCardMastery(card.id, success);
    }

    setIsFlipped(false);
    if (cards.length > 0) {
      setCurrentIdx((prev) => (prev + 1) % cards.length);
    }
  };

  const filteredCards = cards.filter(
    (c) =>
      c.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.translation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (cards.length === 0) {
    return (
      <div className="w-full max-w-lg mx-auto pb-24 px-4 pt-8 text-center">
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <div className="text-5xl mb-3">📚</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Coffre de Vocabulaire Vierge
          </h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Ajoutez le Mot du jour ou discutez avec Lina AI pour enrichir automatiquement votre coffre de révision.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full pb-20 md:pb-8 pt-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Coffre de Vocabulaire
          </h2>
          <p className="text-xs text-slate-500">
            {currentLang.flag} {currentLang.name} · Répétition espacée & Entraînement audio
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-bold text-[#004ac6] bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Carte {safeIdx + 1} / {cards.length}</span>
          </div>
        </div>
      </div>

      {/* Responsive Grid: Desktop Studio & Mobile Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT / CENTER: Flashcard Arena (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 3D Flip Card */}
          <div
            onClick={handleFlip}
            className="w-full min-h-[340px] md:min-h-[380px] bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 md:p-8 flex flex-col justify-between cursor-pointer hover:shadow-xl transition-all relative overflow-hidden select-none"
          >
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-bl-full -z-0 opacity-40" />

            {/* Header of card */}
            <div className="flex items-center justify-between z-10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {isFlipped ? 'Traduction & Contexte' : 'Phrase Cible'}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">
                  Maîtrise : <strong className="text-[#004ac6]">{card?.mastery || 0}%</strong>
                </span>
                <button
                  onClick={(e) => handleAudio(e)}
                  className="p-2 rounded-xl bg-blue-50 text-[#004ac6] hover:bg-blue-100 transition-colors cursor-pointer"
                  title="Écouter la prononciation"
                >
                  <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce text-emerald-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Center Content */}
            <div className="my-auto py-6 z-10 text-center">
              {!isFlipped ? (
                <div className="space-y-3">
                  <div
                    className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {card?.term}
                  </div>
                  {card?.phonetic && (
                    <div className="text-xs md:text-sm font-medium text-slate-500 font-mono">
                      /{card.phonetic}/
                    </div>
                  )}
                  <div className="text-[11px] text-slate-400 pt-2 flex items-center justify-center gap-1">
                    <RotateCw className="w-3 h-3 text-[#004ac6]" />
                    <span>Cliquez n'importe où pour retourner la carte</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    className="text-2xl md:text-3xl font-black text-[#004ac6] tracking-tight"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {card?.translation}
                  </div>

                  {card?.exampleSentence && (
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left max-w-md mx-auto">
                      <div className="text-xs font-semibold text-slate-800 italic mb-1">
                        « {card.exampleSentence} »
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {card.exampleTranslation}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer of card */}
            <div className="z-10 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-[10px] text-slate-400">
                {isFlipped ? 'Évaluez votre mémoire' : 'Retourner pour vérifier'}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlip();
                }}
                className="flex items-center gap-1 text-xs font-bold text-[#004ac6] hover:underline"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{isFlipped ? 'Voir le mot' : 'Voir la réponse'}</span>
              </button>
            </div>
          </div>

          {/* Feedback Rating Buttons */}
          <div className="grid grid-cols-2 gap-3.5">
            <button
              onClick={() => handleResult(false)}
              className="py-3 px-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-bold text-xs md:text-sm shadow-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>À revoir bientôt</span>
              <span>🔄</span>
            </button>

            <button
              onClick={() => handleResult(true)}
              className="py-3 px-4 rounded-2xl btn-3d-primary text-white font-bold text-xs md:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Maîtrisé !</span>
              <Check className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* RIGHT: Desktop Vocabulary Vault Library List (5 cols on desktop) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#004ac6]" />
              <h3 className="font-extrabold text-sm text-slate-800">
                Toutes les cartes ({cards.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-semibold">Deck actif</span>
          </div>

          {/* Search in deck */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un mot..."
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004ac6] focus:outline-none"
            />
          </div>

          {/* Cards List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredCards.map((c, i) => (
              <div
                key={c.id}
                onClick={() => {
                  playTapSound();
                  const targetIdx = cards.findIndex((orig) => orig.id === c.id);
                  if (targetIdx !== -1) {
                    setCurrentIdx(targetIdx);
                    setIsFlipped(false);
                  }
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  c.id === card?.id
                    ? 'border-[#004ac6] bg-blue-50/70 shadow-2xs'
                    : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 truncate">{c.term}</span>
                    {c.mastery >= 90 && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{c.translation}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                    {c.mastery}%
                  </span>
                  <button
                    onClick={(e) => handleAudio(e, c.term)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#004ac6] hover:bg-slate-100 transition-colors"
                    title="Prononcer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
