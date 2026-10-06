import React, { useState } from 'react';
import { WordOfTheDay, LanguageCode } from '../types';
import { WORDS_OF_THE_DAY, LANGUAGES } from '../data/mockData';
import { speakText, playTapSound, playCorrectSound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Volume2,
  BookmarkPlus,
  Check,
  RotateCw,
  BookOpen,
  ArrowRight,
  Info,
} from 'lucide-react';

interface WordOfTheDayCardProps {
  selectedLanguage: LanguageCode;
  onAddToVocab: (word: WordOfTheDay) => void;
  isAlreadyInVocab: (term: string) => boolean;
  onOpenVocabReview?: () => void;
}

export const WordOfTheDayCard: React.FC<WordOfTheDayCardProps> = ({
  selectedLanguage,
  onAddToVocab,
  isAlreadyInVocab,
  onOpenVocabReview,
}) => {
  const languageWords = WORDS_OF_THE_DAY[selectedLanguage] || WORDS_OF_THE_DAY.es;
  const [wordIndex, setWordIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSlowAudio, setIsSlowAudio] = useState(false);

  const currentWord: WordOfTheDay = languageWords[wordIndex % languageWords.length];
  const currentLang = LANGUAGES.find((l) => l.code === selectedLanguage) || LANGUAGES[0];
  const isSaved = isAlreadyInVocab(currentWord.term);

  const handleNextWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTapSound();
    setWordIndex((prev) => (prev + 1) % languageWords.length);
  };

  const handleAudio = (e: React.MouseEvent, rate = 0.95) => {
    e.stopPropagation();
    playTapSound();
    if (rate < 0.8) {
      setIsSlowAudio(true);
    } else {
      setIsPlayingAudio(true);
    }

    speakText(
      currentWord.term,
      currentLang.voiceLang,
      () => {
        setIsPlayingAudio(false);
        setIsSlowAudio(false);
      },
      rate
    );
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) return;
    playCorrectSound();
    onAddToVocab(currentWord);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.4 },
    });
  };

  return (
    <div className="mb-5 rounded-3xl bg-white border border-blue-100/90 shadow-sm overflow-hidden transition-all hover:shadow-md relative">
      {/* Top Gradient Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-3.5 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-sm shadow-inner">
            ✨
          </span>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-100 flex items-center gap-1">
              <span>Mot du jour</span>
              <span className="text-white/60">·</span>
              <span>{currentLang.flag} {currentLang.name}</span>
            </div>
            <div className="text-xs font-semibold text-white/90">
              Enrichissez votre vocabulaire
            </div>
          </div>
        </div>

        {/* Shuffle / Next Word button */}
        {languageWords.length > 1 && (
          <button
            onClick={handleNextWord}
            className="flex items-center gap-1 text-[11px] font-semibold bg-white/15 hover:bg-white/25 active:bg-white/30 text-white px-2.5 py-1 rounded-full transition-colors cursor-pointer border border-white/20"
            title="Découvrir un autre mot"
          >
            <RotateCw className="w-3 h-3" />
            <span>Changer</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-3">
        {/* Term & Pronunciation Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {currentWord.term}
              </h3>
              {currentWord.partOfSpeech && (
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full italic">
                  {currentWord.partOfSpeech}
                </span>
              )}
            </div>

            {currentWord.phonetic && (
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                [{currentWord.phonetic}]
              </div>
            )}
          </div>

          {/* Audio Pronunciation Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Normal speed */}
            <button
              onClick={(e) => handleAudio(e, 0.95)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isPlayingAudio
                  ? 'bg-[#004ac6] text-white border-[#004ac6] shadow-sm'
                  : 'bg-blue-50/80 text-[#004ac6] border-blue-200/70 hover:bg-blue-100'
              }`}
              title="Écouter la prononciation"
              aria-label="Écouter la prononciation"
            >
              <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
            </button>

            {/* Slow speed (0.75x) */}
            <button
              onClick={(e) => handleAudio(e, 0.72)}
              className={`px-2 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-0.5 ${
                isSlowAudio
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Écouter lentement (0.75x)"
              aria-label="Écouter lentement"
            >
              <span>🐢</span>
            </button>
          </div>
        </div>

        {/* Translation & Cultural Explanation */}
        <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100 space-y-1.5">
          <div className="text-sm font-bold text-[#004ac6]">
            {currentWord.translation}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {currentWord.explanation}
          </p>
        </div>

        {/* Example in Context */}
        <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100/70 text-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
            Exemple en contexte :
          </div>
          <div className="font-semibold text-slate-900 italic">
            "{currentWord.exampleSentence}"
          </div>
          <div className="text-slate-500 text-[11px] mt-0.5">
            "{currentWord.exampleTranslation}"
          </div>
        </div>

        {/* Action Button: Add to VocabReview */}
        <div className="pt-1 flex items-center justify-between gap-2">
          {isSaved ? (
            <div className="w-full flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-3.5 py-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Ajouté à vos révisions</span>
              </div>
              {onOpenVocabReview && (
                <button
                  onClick={onOpenVocabReview}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>Réviser</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="w-full btn-3d-primary text-white rounded-xl py-3 px-4 font-semibold text-xs md:text-sm shadow-md hover:bg-[#0053db] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>Ajouter aux révisions</span>
              <span className="bg-white/20 px-1.5 py-0.2 rounded text-[10px] font-bold">
                +10 XP
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
