import React, { useState } from 'react';
import { LANGUAGES } from '../data/mockData';
import { Flashcard, LanguageCode } from '../types';
import { playTapSound, playCorrectSound, speakText } from '../utils/audio';
import { Volume2, RotateCw, Check, BookOpen, Sparkles } from 'lucide-react';

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

  const safeIdx = Math.min(currentIdx, Math.max(0, cards.length - 1));
  const card = cards[safeIdx];
  const currentLang = LANGUAGES.find((l) => l.code === selectedLanguage) || LANGUAGES[0];

  const handleFlip = () => {
    playTapSound();
    setIsFlipped(!isFlipped);
  };

  const handleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!card) return;
    playTapSound();
    setIsPlayingAudio(true);
    speakText(card.term, currentLang.voiceLang, () => setIsPlayingAudio(false));
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

  if (cards.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto pb-24 px-4 pt-4 text-center">
        <div className="p-8 bg-white rounded-3xl border border-slate-200">
          <div className="text-4xl mb-3">📚</div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            Aucun mot dans vos révisions
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Ajoutez le Mot du jour ou terminez des leçons pour remplir votre deck de révision !
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto pb-24 px-4 pt-2">
      {/* Top Review Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Vocabulary Vault
          </h2>
          <p className="text-xs text-slate-500">
            {currentLang.flag} {currentLang.name} · Spaced Repetition & Audio
          </p>
        </div>
        <div className="text-xs font-bold text-[#004ac6] bg-blue-50 px-2.5 py-1 rounded-full flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{safeIdx + 1} / {cards.length}</span>
        </div>
      </div>

      {/* 3D Flip Flashcard */}
      <div
        onClick={handleFlip}
        className="w-full min-h-[300px] bg-white rounded-3xl border border-slate-200 shadow-md p-6 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all relative overflow-hidden select-none mb-6"
      >
        {/* Background watermark/accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 opacity-40" />

        {/* Card Header */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isFlipped ? 'Translation & Context' : 'Target Phrase'}
            </span>
            {card.id.startsWith('wotd-') && (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Mot du jour
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAudio}
              className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-[#004ac6] transition-colors"
              title="Pronounce word"
              aria-label="Pronounce word"
            >
              <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
            </button>
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-0.5">
              <RotateCw className="w-3 h-3" /> Flip
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="my-auto text-center py-4 z-10">
          {!isFlipped ? (
            <>
              <h3
                className="text-2xl md:text-3xl font-bold text-slate-900 mb-2"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {card.term}
              </h3>
              {card.phonetic && (
                <div className="text-xs text-slate-400 font-mono tracking-wide mb-3">
                  [{card.phonetic}]
                </div>
              )}
              <div className="text-xs text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-full font-medium">
                Tap card to reveal definition
              </div>
            </>
          ) : (
            <div className="space-y-3 animate-fadeIn">
              <div
                className="text-2xl font-bold text-[#004ac6]"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {card.translation}
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                <div className="text-[11px] font-semibold text-slate-500 mb-1">Example in context:</div>
                <div className="text-xs font-bold text-slate-800 italic">"{card.exampleSentence}"</div>
                <div className="text-[11px] text-slate-500 mt-0.5">"{card.exampleTranslation}"</div>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer: Mastery bar */}
        <div className="z-10 pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] font-semibold text-slate-500">Mastery Level:</div>
          <div className="flex items-center gap-2">
            <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${card.mastery}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700 tabular-nums">{card.mastery}%</span>
          </div>
        </div>
      </div>

      {/* Repetition Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => handleResult(false)}
          className="tactile-chip py-3 rounded-xl font-bold text-xs text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>Need Practice</span>
          <span>🔄</span>
        </button>

        <button
          onClick={() => handleResult(true)}
          className="btn-3d-green text-white py-3 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>I Know This!</span>
          <Check className="w-4 h-4" />
        </button>
      </div>

      {/* Vocabulary List Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Deck de révision ({cards.length})
          </h4>
          <span className="text-[11px] text-slate-400">Cliquez pour réviser</span>
        </div>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {cards.map((c, i) => (
            <div
              key={c.id}
              onClick={() => {
                playTapSound();
                setCurrentIdx(i);
                setIsFlipped(false);
              }}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                safeIdx === i
                  ? 'border-[#004ac6] bg-blue-50/60 shadow-2xs'
                  : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-800">{c.term}</span>
                  {c.id.startsWith('wotd-') && (
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                      Mot du jour
                    </span>
                  )}
                </div>
                <div className="text-slate-400 text-[11px] truncate">· {c.translation}</div>
              </div>
              <div className="text-[11px] font-bold text-emerald-600 tabular-nums shrink-0">
                {c.mastery}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
