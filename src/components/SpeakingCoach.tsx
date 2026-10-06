import React, { useState, useEffect, useRef } from 'react';
import { LanguageCode, SpeakingEvaluation } from '../types';
import { LANGUAGES } from '../data/mockData';
import { playTapSound, playCorrectSound, speakText, stopSpeech } from '../utils/audio';
import {
  Mic,
  MicOff,
  Volume2,
  Square,
  Sparkles,
  RotateCcw,
  Radio,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

interface SpeakingCoachProps {
  selectedLanguage: LanguageCode;
  onXpEarned?: (xp: number) => void;
}

type PracticeMode = 'pronunciation' | 'shadowing' | 'free' | 'roleplay';

export const SpeakingCoach: React.FC<SpeakingCoachProps> = ({
  selectedLanguage,
  onXpEarned,
}) => {
  const currentLang = LANGUAGES.find((l) => l.code === selectedLanguage) || LANGUAGES[0];

  const [activeMode, setActiveMode] = useState<PracticeMode>('pronunciation');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [isPlayingReference, setIsPlayingReference] = useState(false);
  const [evaluation, setEvaluation] = useState<SpeakingEvaluation | null>(null);
  const [micNotice, setMicNotice] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const samplePrompts = {
    pronunciation: {
      phrase: currentLang.code === 'es' ? 'Buenos días, quisiera un café con leche por favor.' : currentLang.sampleGreeting,
      phonetic: currentLang.code === 'es' ? 'BWEH-nos DEE-as, kee-SYEH-rah oon kah-FEH kon LEH-cheh por fah-VOR' : '',
      translation: 'Good morning, I would like a coffee with milk please.',
    },
    shadowing: {
      phrase: currentLang.code === 'es' ? 'El tren de alta velocidad con destino a Barcelona saldrá de la vía cuatro.' : 'The high-speed express train is departing from platform four.',
      phonetic: '',
      translation: 'The high-speed train bound for Barcelona will depart from track four.',
    },
    free: {
      topic: 'Parlez de votre plat préféré ou de votre ville natale',
      suggestion: 'Décrivez les ingrédients, les saveurs et pourquoi vous l\'aimez.',
    },
    roleplay: {
      scenario: 'À la réception de l\'hôtel à Madrid',
      prompt: 'Demandez à réserver une chambre pour deux nuits avec petit-déjeuner inclus.',
    },
  };

  useEffect(() => {
    if (isRecording) {
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handlePlayReference = () => {
    playTapSound();
    const textToSpeak =
      activeMode === 'pronunciation'
        ? samplePrompts.pronunciation.phrase
        : activeMode === 'shadowing'
        ? samplePrompts.shadowing.phrase
        : currentLang.sampleGreeting;

    setIsPlayingReference(true);
    speakText(textToSpeak, currentLang.voiceLang, () => setIsPlayingReference(false));
  };

  const startCoachRecording = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicNotice('Reconnaissance vocale non disponible sur ce navigateur. Vous pouvez simuler l\'évaluation ci-dessous.');
      return;
    }

    try {
      stopSpeech();
      setIsPlayingReference(false);
      setMicNotice(null);
      setTranscription('');
      setEvaluation(null);

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = currentLang.voiceLang;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let text = '';
        for (let i = 0; i < event.results.length; ++i) {
          text += event.results[i][0].transcript;
        }
        setTranscription(text);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (err: any) => {
        console.warn('Coach mic error:', err);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  };

  const stopCoachRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
    calculateEvaluation();
  };

  const calculateEvaluation = () => {
    playCorrectSound();
    const simulatedTrans = transcription.trim() || samplePrompts.pronunciation.phrase;
    const isGood = simulatedTrans.length > 10;

    const evalResult: SpeakingEvaluation = {
      pronunciationScore: isGood ? Math.floor(88 + Math.random() * 10) : 76,
      fluencyScore: isGood ? Math.floor(84 + Math.random() * 12) : 72,
      grammarScore: 94,
      vocabularyScore: 90,
      intelligibilityScore: 92,
      wpm: 114,
      transcription: simulatedTrans,
      feedback:
        'Excellente clarté sur les voyelles ouvertes. Veillez à bien lier les syllabes pour fluidifier le rythme naturel de la phrase.',
    };

    setEvaluation(evalResult);
    if (onXpEarned) {
      onXpEarned(25);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full pb-20 md:pb-8 pt-1 space-y-6">
      {/* Header with Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488] dark:text-teal-400">
              Studio Vocal LinGoL
            </span>
            <span className="text-[10px] bg-teal-100 dark:bg-teal-900/60 text-[#0D9488] dark:text-teal-300 font-extrabold px-2 py-0.5 rounded-full">
              IA Audio 24/7
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Coach de Prononciation & Expression
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Pratiquez votre accent, votre rythme et votre fluidité en {currentLang.name} avec évaluation IA immédiate.
          </p>
        </div>

        {/* Practice Mode Selector Pills */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
          {[
            { id: 'pronunciation', label: 'Prononciation' },
            { id: 'shadowing', label: 'Shadowing' },
            { id: 'free', label: 'Libre' },
            { id: 'roleplay', label: 'Jeu de rôle' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                playTapSound();
                setActiveMode(mode.id as PracticeMode);
                setEvaluation(null);
                setTranscription('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeMode === mode.id
                  ? 'bg-white dark:bg-slate-900 text-[#2563EB] dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {micNotice && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{micNotice}</span>
          </div>
          <button onClick={() => setMicNotice(null)} className="font-bold px-2">✕</button>
        </div>
      )}

      {/* IMMERSIVE RECORDING ARENA CENTERED AROUND THE MICROPHONE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Recording & Target Phrase Arena (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-xs flex flex-col items-center justify-between min-h-[380px] text-center relative overflow-hidden">
            {/* Top Challenge Prompt */}
            <div className="w-full text-left space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                {activeMode === 'pronunciation' && 'Phrase Cible à Répéter'}
                {activeMode === 'shadowing' && 'Écoutez puis répétez simultanément'}
                {activeMode === 'free' && 'Sujet d\'Expression Libre (30s)'}
                {activeMode === 'roleplay' && 'Mise en Situation Réelle'}
              </span>

              {activeMode === 'pronunciation' && (
                <div className="space-y-2">
                  <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                    « {samplePrompts.pronunciation.phrase} »
                  </div>
                  {samplePrompts.pronunciation.phonetic && (
                    <div className="text-xs text-slate-400 font-mono">
                      /{samplePrompts.pronunciation.phonetic}/
                    </div>
                  )}
                  <div className="text-xs text-slate-500 italic">
                    {samplePrompts.pronunciation.translation}
                  </div>
                </div>
              )}

              {activeMode === 'shadowing' && (
                <div className="space-y-1">
                  <div className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
                    « {samplePrompts.shadowing.phrase} »
                  </div>
                  <div className="text-xs text-slate-500">{samplePrompts.shadowing.translation}</div>
                </div>
              )}

              {activeMode === 'free' && (
                <div className="space-y-1">
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {samplePrompts.free.topic}
                  </div>
                  <div className="text-xs text-slate-500">{samplePrompts.free.suggestion}</div>
                </div>
              )}

              {activeMode === 'roleplay' && (
                <div className="space-y-1">
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {samplePrompts.roleplay.scenario}
                  </div>
                  <div className="text-xs text-slate-500">{samplePrompts.roleplay.prompt}</div>
                </div>
              )}
            </div>

            {/* Audio Wave Visualizer & Live Timer during Recording */}
            <div className="my-auto py-6 flex flex-col items-center space-y-4">
              {isRecording ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-1.5 h-12">
                    <span className="w-1.5 bg-[#2563EB] rounded-full h-4 animate-pulse" />
                    <span className="w-2 bg-[#0D9488] rounded-full h-8 animate-bounce" />
                    <span className="w-1.5 bg-[#2563EB] rounded-full h-11 animate-pulse" />
                    <span className="w-2 bg-amber-400 rounded-full h-7 animate-bounce" />
                    <span className="w-1.5 bg-[#2563EB] rounded-full h-10 animate-pulse" />
                    <span className="w-2 bg-[#0D9488] rounded-full h-6 animate-bounce" />
                    <span className="w-1.5 bg-[#2563EB] rounded-full h-4 animate-pulse" />
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm font-black text-[#2563EB] dark:text-blue-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span>Enregistrement en direct : {formatTimer(recordSeconds)}</span>
                  </div>

                  {transcription && (
                    <div className="max-w-md bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-100 italic border border-slate-200 dark:border-slate-700">
                      « {transcription} »
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-400">
                  Appuyez sur le micro pour démarrer votre analyse vocale
                </div>
              )}

              {/* HUGE INTERACTIVE MICROPHONE BUTTON */}
              <button
                onClick={() => {
                  playTapSound();
                  if (isRecording) {
                    stopCoachRecording();
                  } else {
                    startCoachRecording();
                  }
                }}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-200 dark:ring-rose-950'
                    : 'bg-gradient-to-tr from-[#2563EB] to-[#0D9488] text-white hover:scale-105 active:scale-95 ring-8 ring-blue-100 dark:ring-blue-950/50'
                }`}
                title={isRecording ? 'Arrêter et évaluer' : 'Parler au micro'}
              >
                {isRecording ? <Square className="w-9 h-9 fill-current" /> : <Mic className="w-10 h-10" />}
              </button>
            </div>

            {/* Bottom Actions Row */}
            <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={handlePlayReference}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-[#2563EB] dark:text-blue-300 font-bold hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <Volume2 className={`w-4 h-4 ${isPlayingReference ? 'animate-bounce text-emerald-500' : ''}`} />
                <span>Écouter la voix modèle</span>
              </button>

              {isRecording ? (
                <button
                  onClick={stopCoachRecording}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 text-white font-bold cursor-pointer"
                >
                  Terminer l'évaluation
                </button>
              ) : (
                <button
                  onClick={calculateEvaluation}
                  className="text-slate-400 hover:text-[#2563EB] font-semibold"
                >
                  Simuler un test
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Speaking Evaluation Metrics Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Évaluation & Scores IA
                </h3>
              </div>
              <span className="text-xs font-bold text-[#0D9488]">Temps réel</span>
            </div>

            {evaluation ? (
              <div className="space-y-4 animate-fadeIn">
                {/* Global Pronunciation Score Ring */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Score Global</span>
                    <div className="text-2xl font-black text-[#2563EB] dark:text-blue-400">
                      {evaluation.pronunciationScore}%
                    </div>
                    <span className="text-xs font-semibold text-emerald-600">✓ Compréhensible & fluide</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Débit verbal</span>
                    <div className="text-xl font-bold text-slate-800 dark:text-white">
                      {evaluation.wpm} <span className="text-xs text-slate-400 font-normal">mots/min</span>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Bars */}
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Prononciation des sons</span>
                      <span>{evaluation.pronunciationScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#2563EB] h-full rounded-full" style={{ width: `${evaluation.pronunciationScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Fluidité & Rythme</span>
                      <span>{evaluation.fluencyScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#0D9488] h-full rounded-full" style={{ width: `${evaluation.fluencyScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Grammaire orale</span>
                      <span>{evaluation.grammarScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${evaluation.grammarScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Intelligibilité</span>
                      <span>{evaluation.intelligibilityScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${evaluation.intelligibilityScore}%` }} />
                    </div>
                  </div>
                </div>

                {/* Feedback Box */}
                <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <div className="font-bold text-[#2563EB] dark:text-blue-400 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Retour du Coach :</span>
                  </div>
                  {evaluation.feedback}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Radio className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 animate-pulse" />
                <p className="text-xs">
                  Enregistrez votre voix pour afficher votre score de prononciation, WPM et feedback détaillé.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
