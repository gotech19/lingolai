import React, { useState, useEffect } from 'react';
import { UnitLesson, LessonQuestion } from '../types';
import {
  playTapSound,
  playCorrectSound,
  playWrongSound,
  playFanfareSound,
  speakText,
} from '../utils/audio';
import confetti from 'canvas-confetti';
import { X, Volume2, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

interface LessonModalProps {
  lesson: UnitLesson;
  onClose: () => void;
  onComplete: (xpEarned: number) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lesson,
  onClose,
  onComplete,
}) => {
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);
  const [checkedState, setCheckedState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [isFinished, setIsFinished] = useState(false);
  const [heartsLeft, setHeartsLeft] = useState(5);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const currentQuestion: LessonQuestion | undefined = lesson.questions[questionIdx];

  useEffect(() => {
    if (currentQuestion) {
      setAvailableTokens([...currentQuestion.options]);
      setSelectedTokens([]);
      setCheckedState('idle');

      // Auto play audio if listen question
      if (currentQuestion.type === 'listen_and_build' && currentQuestion.targetAudioText) {
        handlePlayAudio(currentQuestion.targetAudioText, currentQuestion.targetAudioLang);
      }
    }
  }, [questionIdx, lesson]);

  const handlePlayAudio = (text?: string, lang = 'es-ES') => {
    if (!text) return;
    playTapSound();
    setIsPlayingAudio(true);
    speakText(text, lang, () => setIsPlayingAudio(false));
  };

  const handleSelectToken = (token: string, index: number) => {
    if (checkedState !== 'idle') return;
    playTapSound();
    setSelectedTokens([...selectedTokens, token]);
    const updated = [...availableTokens];
    updated.splice(index, 1);
    setAvailableTokens(updated);
  };

  const handleDeselectToken = (token: string, index: number) => {
    if (checkedState !== 'idle') return;
    playTapSound();
    const updatedSelected = [...selectedTokens];
    updatedSelected.splice(index, 1);
    setSelectedTokens(updatedSelected);
    setAvailableTokens([...availableTokens, token]);
  };

  const handleCheck = () => {
    if (!currentQuestion || selectedTokens.length === 0) return;

    const userSentence = selectedTokens.join(' ').trim().toLowerCase();
    const targetSentence = currentQuestion.correctAnswer.join(' ').trim().toLowerCase();

    if (userSentence === targetSentence) {
      setCheckedState('correct');
      playCorrectSound();
    } else {
      setCheckedState('wrong');
      playWrongSound();
      setHeartsLeft((prev) => Math.max(0, prev - 1));
    }
  };

  const handleContinue = () => {
    playTapSound();
    if (questionIdx < lesson.questions.length - 1) {
      setQuestionIdx(questionIdx + 1);
    } else {
      // Completed lesson!
      setIsFinished(true);
      playFanfareSound();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const progressPercent = currentQuestion
    ? ((questionIdx + (checkedState === 'correct' ? 1 : 0)) / lesson.questions.length) * 100
    : 100;

  if (isFinished) {
    return (
      <div className="fixed inset-0 z-50 bg-[#f8f9ff] flex flex-col justify-between max-w-md mx-auto p-6 animate-fadeIn">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-amber-100 border-4 border-amber-300 flex items-center justify-center text-5xl mb-4 shadow-lg animate-bounce">
            🎉
          </div>
          <h2
            className="text-2xl md:text-3xl font-bold text-[#004ac6] mb-2"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Lesson Complete!
          </h2>
          <p className="text-slate-600 text-sm mb-6 max-w-xs">
            You practiced real-life conversation phrases and earned mastery points!
          </p>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-6">
            <div className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-sm text-center">
              <div className="text-[11px] font-bold text-slate-400 uppercase">XP Earned</div>
              <div className="text-2xl font-extrabold text-[#004ac6]">+{lesson.xpReward}</div>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-amber-100 shadow-sm text-center">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Gems Bonus</div>
              <div className="text-2xl font-extrabold text-amber-500">+10 💎</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => onComplete(lesson.xpReward)}
          className="w-full btn-3d-primary text-white py-4 rounded-xl font-bold text-base shadow-lg cursor-pointer"
        >
          Collect Rewards & Continue
        </button>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#f8f9ff] flex flex-col max-w-md mx-auto h-full">
      {/* Top Bar with thick progress bar & hearts */}
      <header className="px-4 py-3 flex items-center gap-3 border-b border-slate-200/70 bg-white">
        <button
          onClick={() => {
            playTapSound();
            onClose();
          }}
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
          aria-label="Close lesson"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 12px Thick Progress Bar as in Design System */}
        <div className="flex-1 bg-slate-200 h-3 rounded-full overflow-hidden">
          <div
            className="bg-[#004ac6] h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Hearts indicator */}
        <div className="flex items-center gap-1 text-rose-500 font-bold text-sm">
          <span>❤️</span>
          <span>{heartsLeft}</span>
        </div>
      </header>

      {/* Main Exercise Area */}
      <main className="flex-1 overflow-y-auto px-5 py-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#004ac6] bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {currentQuestion.type === 'listen_and_build' ? 'Listening' : 'Translation'}
            </span>
          </div>

          <h2
            className="text-lg md:text-xl font-bold text-slate-900"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {currentQuestion.prompt}
          </h2>

          {/* Sub prompt / Foreign phrase */}
          <div className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            {currentQuestion.targetAudioText && (
              <button
                onClick={() =>
                  handlePlayAudio(currentQuestion.targetAudioText, currentQuestion.targetAudioLang)
                }
                className="w-10 h-10 rounded-full bg-[#004ac6] text-white flex items-center justify-center shrink-0 hover:bg-[#0053db] active:scale-95 transition-all cursor-pointer shadow-sm"
                title="Listen to native speaker"
              >
                <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
              </button>
            )}
            <div className="text-base md:text-lg font-semibold text-slate-800">
              {currentQuestion.subPrompt}
            </div>
          </div>

          {/* User Sentence Construction Drop Zone */}
          <div className="min-h-[72px] p-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 flex flex-wrap gap-2 items-center">
            {selectedTokens.length === 0 ? (
              <span className="text-xs text-slate-400 italic">
                Tap words below to construct your answer...
              </span>
            ) : (
              selectedTokens.map((token, idx) => (
                <button
                  key={`${token}-${idx}`}
                  onClick={() => handleDeselectToken(token, idx)}
                  className="tactile-chip selected px-3.5 py-2 rounded-xl text-sm font-semibold cursor-pointer"
                >
                  {token}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Word Bank: Tactile 3D Chips in Bottom 40% (Ergonomic Reach Zone) */}
        <div className="pt-6">
          <div className="flex flex-wrap gap-2.5 justify-center py-4">
            {availableTokens.map((token, idx) => (
              <button
                key={`${token}-${idx}`}
                onClick={() => handleSelectToken(token, idx)}
                disabled={checkedState !== 'idle'}
                className="tactile-chip px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 cursor-pointer"
              >
                {token}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Sticky Action Area */}
      <footer
        className={`p-4 border-t transition-colors ${
          checkedState === 'correct'
            ? 'bg-emerald-50 border-emerald-200'
            : checkedState === 'wrong'
            ? 'bg-rose-50 border-rose-200'
            : 'bg-white border-slate-200'
        }`}
      >
        {checkedState === 'idle' ? (
          <button
            onClick={handleCheck}
            disabled={selectedTokens.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-sm md:text-base transition-all cursor-pointer ${
              selectedTokens.length > 0
                ? 'btn-3d-primary text-white shadow-md'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Check Answer
          </button>
        ) : checkedState === 'correct' ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold">¡Excelente! Correct!</div>
                <div className="text-xs text-emerald-700 mt-0.5">{currentQuestion.explanation}</div>
              </div>
            </div>
            <button
              onClick={handleContinue}
              className="w-full btn-3d-green text-white py-3.5 rounded-xl font-bold text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 text-rose-800">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold">Not quite right</div>
                <div className="text-xs text-rose-700 mt-0.5">
                  Correct solution:{' '}
                  <span className="font-semibold">{currentQuestion.correctAnswer.join(' ')}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleContinue}
              className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-bold text-sm cursor-pointer shadow-md hover:bg-rose-700 flex items-center justify-center gap-2"
            >
              <span>Got it</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};
