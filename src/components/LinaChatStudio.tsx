import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, LanguageCode } from '../types';
import { LINA_SCENARIOS, LANGUAGES } from '../data/mockData';
import { speakText, stopSpeech, playTapSound, playCorrectSound } from '../utils/audio';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Square,
  Sparkles,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Headphones,
  Radio,
} from 'lucide-react';

interface LinaChatStudioProps {
  selectedLanguage: LanguageCode;
  onPracticePointsEarned?: (xp: number) => void;
}

export const LinaChatStudio: React.FC<LinaChatStudioProps> = ({
  selectedLanguage,
  onPracticePointsEarned,
}) => {
  const LINA_AVATAR =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDdXxgRbR6p1YObD3z-MHkHW2UqxraFwup6ZPxOsuFoDdk0vaUr5gfHkFghpDvQdiL6BHVWAEiTHitEqgQ6bntX8LWJgWpowU4oGMgZgF4qt0wgEFh8YteRiUwcuxljLE9OiaAJVgHMNzl3CDdax3MdpCqyrFkOcTgYXU9pwFR1OOaARH-GJhqzNka3UZE0TYzb2vrTDM6EeFMjd1LtLJtvAv5SnWpGEkWS89KJwvFrn0MB5bPIxMqWAg';

  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLinaSpeaking, setIsLinaSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [micErrorNotice, setMicErrorNotice] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [selectedWordPopup, setSelectedWordPopup] = useState<{ word: string; translation: string } | null>(null);
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);
  const [dynamicQuickReplies, setDynamicQuickReplies] = useState<string[]>([]);
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const [continuousVoiceMode, setContinuousVoiceMode] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [speakingSpeed, setSpeakingSpeed] = useState<'normal' | 'slow'>('normal');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const scenario = LINA_SCENARIOS[activeScenarioIdx];
  const currentLang = LANGUAGES.find((l) => l.code === selectedLanguage) || LANGUAGES[0];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize scenario
  useEffect(() => {
    const initialMsgId = 'init-' + scenario.id;
    const initialMsg: ChatMessage = {
      id: initialMsgId,
      sender: 'lina',
      text: scenario.initialMessage,
      translation: scenario.initialTranslation,
      audioText: scenario.initialMessage,
      timestamp: 'À l\'instant',
    };
    setMessages([initialMsg]);
    setDynamicQuickReplies(scenario.quickReplies);

    if (autoPlayVoice) {
      setSpeakingMessageId(initialMsgId);
      setSpeakingSpeed('normal');
      speakText(scenario.initialMessage, currentLang.voiceLang, () => {
        setIsLinaSpeaking(false);
        setSpeakingMessageId(null);
      });
      setIsLinaSpeaking(true);
    }
  }, [activeScenarioIdx, selectedLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingAi, interimTranscript]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoadingAi) return;
    playTapSound();

    // Stop speech & recognition if running
    if (isListening) {
      stopListening();
    }
    stopSpeech();
    setIsLinaSpeaking(false);
    setSpeakingMessageId(null);

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: 'À l\'instant',
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputText('');
    setInterimTranscript('');
    setIsLoadingAi(true);

    // Reward XP for practice
    if (onPracticePointsEarned) {
      onPracticePointsEarned(5);
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: nextMessages.map((m) => ({ sender: m.sender, text: m.text })),
          targetLanguage: selectedLanguage,
          languageName: currentLang.name,
          scenario: scenario.title,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const linaReply: ChatMessage = {
        id: 'lina-' + Date.now(),
        sender: 'lina',
        text: data.reply,
        translation: data.translation,
        grammarTip: data.grammarTip,
        correction: data.correction,
        audioText: data.reply,
        timestamp: 'À l\'instant',
      };

      setMessages((prev) => [...prev, linaReply]);

      if (Array.isArray(data.suggestedReplies) && data.suggestedReplies.length > 0) {
        setDynamicQuickReplies(data.suggestedReplies);
      }

      playCorrectSound();

      if (autoPlayVoice) {
        setSpeakingMessageId(linaReply.id);
        setSpeakingSpeed('normal');
        setIsLinaSpeaking(true);
        speakText(data.reply, currentLang.voiceLang, () => {
          setIsLinaSpeaking(false);
          setSpeakingMessageId(null);
          // If continuous voice mode is on, resume listening automatically
          if (continuousVoiceMode) {
            startListening();
          }
        });
      }
    } catch (err) {
      console.error('Failed to communicate with AI server:', err);
      const fallbackReply: ChatMessage = {
        id: 'lina-err-' + Date.now(),
        sender: 'lina',
        text: '¡Muy bien dicho! Sigue practicando conmigo.',
        translation: 'Very well said! Keep practicing with me.',
        audioText: '¡Muy bien dicho!',
        timestamp: 'À l\'instant',
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handlePlayMessageAudio = (msgId: string, text: string, speed: 'normal' | 'slow' = 'normal') => {
    playTapSound();
    if (speakingMessageId === msgId && speakingSpeed === speed) {
      stopSpeech();
      setSpeakingMessageId(null);
      setIsLinaSpeaking(false);
      return;
    }

    setSpeakingMessageId(msgId);
    setSpeakingSpeed(speed);
    setIsLinaSpeaking(true);

    const rate = speed === 'slow' ? 0.75 : 1.0;
    speakText(
      text,
      currentLang.voiceLang,
      () => {
        setSpeakingMessageId(null);
        setIsLinaSpeaking(false);
      },
      rate
    );
  };

  // Start speech recognition
  const startListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicErrorNotice(
        'Votre navigateur ne prend pas en charge la reconnaissance vocale Web Speech. Utilisez Chrome, Edge ou Safari, ou tapez votre message !'
      );
      return;
    }

    try {
      stopSpeech();
      setIsLinaSpeaking(false);
      setSpeakingMessageId(null);

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = currentLang.voiceLang;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      setMicErrorNotice(null);
      setIsListening(true);
      setInterimTranscript('');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (final) {
          setInputText(final);
          setInterimTranscript(final);
        } else if (interim) {
          setInterimTranscript(interim);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        if (err.error === 'not-allowed') {
          setMicErrorNotice(
            'Microphone bloqué ou non autorisé. Veuillez autoriser l\'accès au micro dans votre navigateur.'
          );
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
      setMicErrorNotice('Impossible de démarrer le micro. Vérifiez vos permissions de micro.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  const toggleVoiceInput = () => {
    playTapSound();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleWordClick = (word: string) => {
    playTapSound();
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!]/g, '');
    const dictionary: Record<string, string> = {
      hola: 'bonjour / salut',
      bienvenido: 'bienvenue',
      café: 'café',
      leche: 'lait',
      por: 'pour / par',
      favor: 's\'il vous plaît',
      agua: 'eau',
      fría: 'fraîche / froide',
      pan: 'pain',
      queso: 'fromage',
      cuenta: 'l\'addition',
      estación: 'gare / station',
      metro: 'métro',
      gracias: 'merci',
      excelente: 'excellent',
      español: 'espagnol',
      mañana: 'matin / demain',
      derecha: 'droite',
      izquierda: 'gauche',
      bonjour: 'bonjour',
      comment: 'comment',
      merci: 'merci',
      oui: 'oui',
      non: 'non',
      hello: 'bonjour / salut',
      coffee: 'café',
      please: 's\'il vous plaît',
      thanks: 'merci',
    };

    const translation = dictionary[cleanWord.toLowerCase()] || `"${cleanWord}"`;
    setSelectedWordPopup({ word: cleanWord, translation });
  };

  const handleResetConversation = () => {
    playTapSound();
    const initialMsg: ChatMessage = {
      id: 'init-' + scenario.id + '-' + Date.now(),
      sender: 'lina',
      text: scenario.initialMessage,
      translation: scenario.initialTranslation,
      audioText: scenario.initialMessage,
      timestamp: 'À l\'instant',
    };
    setMessages([initialMsg]);
    setDynamicQuickReplies(scenario.quickReplies);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9ff] relative select-none">
      {/* LinGoL Header with Voice Status */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs">
        {/* Scenario selector */}
        <div className="relative">
          <button
            onClick={() => {
              playTapSound();
              setShowScenarioMenu(!showScenarioMenu);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 transition-colors border border-blue-200/60 cursor-pointer"
          >
            <span className="text-sm">{scenario.emoji}</span>
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold text-[#004ac6] leading-none">Scénario LinGoL</div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                {scenario.title}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </button>

          {showScenarioMenu && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-40 animate-fadeIn">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Choisir une situation
              </div>
              {LINA_SCENARIOS.map((sc, idx) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    playTapSound();
                    setActiveScenarioIdx(idx);
                    setShowScenarioMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                    idx === activeScenarioIdx ? 'bg-blue-50 text-[#004ac6] font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-lg">{sc.emoji}</span>
                  <div>
                    <div className="font-semibold">{sc.title}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{sc.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Toggles: Audio & Reset */}
        <div className="flex items-center gap-1.5">
          {/* Continuous Voice / Walkie-talkie mode toggle */}
          <button
            onClick={() => {
              playTapSound();
              setContinuousVoiceMode(!continuousVoiceMode);
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
              continuousVoiceMode
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
            title="Mode vocal continu : parle et écoute automatiquement"
          >
            <Radio className={`w-3.5 h-3.5 ${continuousVoiceMode ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline text-[11px]">Vocal auto</span>
          </button>

          {/* TTS auto-play toggle */}
          <button
            onClick={() => {
              playTapSound();
              setAutoPlayVoice(!autoPlayVoice);
            }}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              autoPlayVoice
                ? 'bg-blue-50 border-blue-200 text-[#004ac6]'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
            title={autoPlayVoice ? 'Voix de Lina activée' : 'Voix de Lina en sourdine'}
          >
            <Headphones className="w-3.5 h-3.5" />
          </button>

          {/* Reset chat */}
          <button
            onClick={handleResetConversation}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Recommencer la conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mic Error Notice Banner (No alert window!) */}
      {micErrorNotice && (
        <div className="mx-3 mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2 animate-fadeIn shrink-0">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">{micErrorNotice}</span>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[11px] text-amber-700">Vous pouvez aussi appuyer sur les suggestions ci-dessous :</span>
            </div>
          </div>
          <button
            onClick={() => setMicErrorNotice(null)}
            className="text-amber-500 hover:text-amber-700 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Word tap popup modal */}
      {selectedWordPopup && (
        <div className="absolute top-16 left-4 right-4 z-30 bg-white rounded-2xl shadow-xl border border-blue-100 p-3.5 flex items-center justify-between animate-fadeIn">
          <div>
            <div className="text-[10px] font-bold uppercase text-[#004ac6] flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Traduction LinGoL
            </div>
            <div className="font-bold text-sm text-slate-800 capitalize">{selectedWordPopup.word}</div>
            <div className="text-xs text-slate-600 mt-0.5">{selectedWordPopup.translation}</div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => speakText(selectedWordPopup.word, currentLang.voiceLang)}
              className="p-2 rounded-xl bg-blue-50 text-[#004ac6] hover:bg-blue-100 cursor-pointer"
              title="Prononcer le mot"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedWordPopup(null)}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isLina = msg.sender === 'lina';
          const isThisMsgPlaying = speakingMessageId === msg.id && isLinaSpeaking;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isLina ? 'items-start' : 'items-end'} animate-fadeIn`}
            >
              {/* Lina Name & Avatar */}
              {isLina && (
                <div className="flex items-center gap-2 mb-1 px-1">
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-blue-200">
                    <img src={LINA_AVATAR} alt="Lina" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Lina AI</span>
                  {isThisMsgPlaying && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Voix active
                    </span>
                  )}
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs text-sm relative group ${
                  isLina
                    ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                    : 'bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white rounded-tr-xs'
                }`}
              >
                {/* Text with clickable words */}
                <div className="leading-relaxed">
                  {msg.text.split(' ').map((word, wIdx) => (
                    <span
                      key={wIdx}
                      onClick={() => handleWordClick(word)}
                      className="cursor-pointer hover:bg-blue-100 hover:text-[#004ac6] rounded px-0.5 transition-colors"
                      title="Appuyer pour voir la traduction"
                    >
                      {word}{' '}
                    </span>
                  ))}
                </div>

                {/* Translation under message */}
                {msg.translation && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-100 text-xs text-slate-500 italic">
                    {msg.translation}
                  </div>
                )}

                {/* Grammar correction/tip if present */}
                {msg.grammarTip && (
                  <div className="mt-2 p-2 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{msg.grammarTip}</span>
                  </div>
                )}

                {msg.correction && (
                  <div className="mt-2 p-2 rounded-xl bg-emerald-50/80 border border-emerald-200/60 text-xs text-emerald-900 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Formulation naturelle : </span>
                      {msg.correction}
                    </div>
                  </div>
                )}

                {/* Pronunciation audio controls for Lina */}
                {isLina && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handlePlayMessageAudio(msg.id, msg.audioText || msg.text, 'normal')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isThisMsgPlaying && speakingSpeed === 'normal'
                            ? 'bg-[#004ac6] text-white shadow-xs'
                            : 'bg-blue-50 text-[#004ac6] hover:bg-blue-100'
                        }`}
                        title="Écouter la prononciation"
                      >
                        {isThisMsgPlaying && speakingSpeed === 'normal' ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Écouter</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handlePlayMessageAudio(msg.id, msg.audioText || msg.text, 'slow')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isThisMsgPlaying && speakingSpeed === 'slow'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Écouter lentement (0.75x) pour améliorer votre accent"
                      >
                        <span>🐢</span>
                        <span>0.75x</span>
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-400">LinGoL Audio</span>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isLoadingAi && (
          <div className="flex items-start gap-2 animate-fadeIn">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-blue-200 shrink-0">
              <img src={LINA_AVATAR} alt="Lina" className="w-full h-full object-cover" />
            </div>
            <div className="bg-white text-slate-700 rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-xs border border-slate-200 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#004ac6] animate-spin" />
              <span className="text-xs font-medium">Lina prépare sa réponse vocale...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested quick replies */}
      {dynamicQuickReplies.length > 0 && !isListening && (
        <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200/60 shrink-0">
          <div className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#004ac6]" /> Idées de réponses :
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {dynamicQuickReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(reply)}
                disabled={isLoadingAi}
                className="tactile-chip px-2.5 py-1 rounded-lg text-xs text-slate-700 whitespace-nowrap shrink-0 hover:text-[#004ac6] cursor-pointer disabled:opacity-50"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PROMINENT "MICRO POUR PARLER" BANNER & RECORDING VISUALIZER */}
      {isListening ? (
        /* Active Recording State */
        <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-3xl shadow-lg border-t border-blue-400 animate-slideUp">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400 animate-ping" />
              <span className="font-bold text-sm">🎙️ Lina vous écoute...</span>
              <span className="text-xs text-blue-200 uppercase font-semibold">({currentLang.code})</span>
            </div>
            <button
              onClick={stopListening}
              className="text-xs px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-white cursor-pointer"
            >
              Annuler
            </button>
          </div>

          {/* Sound Wave Animation Visualizer */}
          <div className="h-8 flex items-center justify-center gap-1.5 py-1">
            <span className="w-1 bg-white rounded-full h-3 animate-pulse" />
            <span className="w-1.5 bg-emerald-300 rounded-full h-6 animate-bounce" />
            <span className="w-1 bg-white rounded-full h-8 animate-pulse" />
            <span className="w-1.5 bg-emerald-200 rounded-full h-5 animate-bounce" />
            <span className="w-1 bg-white rounded-full h-7 animate-pulse" />
            <span className="w-1.5 bg-emerald-300 rounded-full h-4 animate-bounce" />
            <span className="w-1 bg-white rounded-full h-3 animate-pulse" />
          </div>

          {/* Live speech preview */}
          <div className="bg-black/20 rounded-xl p-2.5 text-xs min-h-[36px] flex items-center mb-2">
            {interimTranscript ? (
              <span className="font-semibold text-white">« {interimTranscript} »</span>
            ) : (
              <span className="text-blue-200 italic">Parlez clairement dans votre micro...</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSendMessage(interimTranscript || inputText)}
              disabled={!interimTranscript && !inputText}
              className="flex-1 py-2 rounded-xl bg-white text-[#004ac6] font-bold text-xs hover:bg-blue-50 transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Envoyer à Lina</span>
            </button>
            <button
              onClick={stopListening}
              className="py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <MicOff className="w-3.5 h-3.5" />
              <span>Arrêter</span>
            </button>
          </div>
        </div>
      ) : (
        /* Regular Input Controls with Prominent "MICRO POUR PARLER" Button */
        <div className="p-3 bg-white border-t border-slate-200 space-y-2 shrink-0">
          {/* HUGE "MICRO POUR PARLER" Call-To-Action Button */}
          <button
            onClick={toggleVoiceInput}
            disabled={isLoadingAi}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#004ac6] via-[#2563eb] to-[#004ac6] hover:opacity-95 active:scale-[0.99] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all border border-blue-400/40"
            title="Appuyez pour parler à Lina avec le microphone"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="tracking-wide">🎙️ MICRO POUR PARLER À LINA</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-medium">Voix</span>
          </button>

          {/* Fallback Text Input Row */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              disabled={isLoadingAi}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={
                isLoadingAi
                  ? 'Lina prépare sa réponse...'
                  : `Ou écrivez en ${currentLang.name}...`
              }
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#004ac6] focus:bg-white transition-all disabled:opacity-60"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoadingAi}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                inputText.trim() && !isLoadingAi
                  ? 'btn-3d-primary text-white shadow-xs'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
              title="Envoyer le message écrit"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
