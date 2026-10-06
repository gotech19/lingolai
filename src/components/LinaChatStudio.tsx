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
  BookOpen,
  Sliders,
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
      setMicErrorNotice('Impossible de démarrer le micro. Vérifiez vos autorisations.');
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
      hello: 'bonjour',
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

  // Extract key words from recent Lina message
  const lastLinaMessage = [...messages].reverse().find((m) => m.sender === 'lina');
  const sampleWords = lastLinaMessage
    ? Array.from(new Set(lastLinaMessage.text.split(' ').map((w) => w.replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!]/g, '')).filter((w) => w.length > 3))).slice(0, 5)
    : ['café', 'leche', 'favor', 'gracias'];

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full w-full bg-[#f8f9ff] relative select-none overflow-hidden">
      {/* LEFT / CENTER: Main Interactive Voice & Chat Timeline */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-200/80">
        {/* Mobile Header Bar (hidden on large screens) */}
        <div className="lg:hidden px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs">
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
                <div className="text-[10px] uppercase font-bold text-[#004ac6] leading-none">Scénario</div>
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

          <div className="flex items-center gap-1.5">
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
              title="Mode vocal continu"
            >
              <Radio className={`w-3.5 h-3.5 ${continuousVoiceMode ? 'animate-pulse' : ''}`} />
              <span className="text-[11px]">Auto</span>
            </button>

            <button
              onClick={handleResetConversation}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Recommencer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mic Error Notice Banner */}
        {micErrorNotice && (
          <div className="mx-4 mt-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5 animate-fadeIn shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">{micErrorNotice}</span>
              <div className="mt-1 text-[11px] text-amber-700">
                Vous pouvez également cliquer sur les suggestions de réponses ci-dessous !
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

        {/* Word translation popup */}
        {selectedWordPopup && (
          <div className="mx-4 mt-2 z-30 bg-white rounded-2xl shadow-md border border-blue-100 p-3 flex items-center justify-between animate-fadeIn shrink-0">
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
                title="Prononcer"
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

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((msg) => {
            const isLina = msg.sender === 'lina';
            const isThisMsgPlaying = speakingMessageId === msg.id && isLinaSpeaking;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isLina ? 'items-start' : 'items-end'} animate-fadeIn`}
              >
                {isLina && (
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-blue-200">
                      <img src={LINA_AVATAR} alt="Lina" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">Lina AI</span>
                    {isThisMsgPlaying && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Lecture audio en cours
                      </span>
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[90%] md:max-w-[75%] rounded-3xl px-5 py-3.5 shadow-2xs text-sm relative group ${
                    isLina
                      ? 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-sm'
                      : 'bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white rounded-tr-sm shadow-blue-100 shadow-md'
                  }`}
                >
                  <div className="leading-relaxed text-sm md:text-base">
                    {msg.text.split(' ').map((word, wIdx) => (
                      <span
                        key={wIdx}
                        onClick={() => handleWordClick(word)}
                        className="cursor-pointer hover:bg-blue-100 hover:text-[#004ac6] rounded px-0.5 transition-colors"
                        title="Appuyer pour traduire"
                      >
                        {word}{' '}
                      </span>
                    ))}
                  </div>

                  {msg.translation && (
                    <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 italic">
                      {msg.translation}
                    </div>
                  )}

                  {msg.grammarTip && (
                    <div className="mt-2.5 p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{msg.grammarTip}</span>
                    </div>
                  )}

                  {msg.correction && (
                    <div className="mt-2.5 p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/60 text-xs text-emerald-900 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Formulation recommandée : </span>
                        {msg.correction}
                      </div>
                    </div>
                  )}

                  {isLina && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePlayMessageAudio(msg.id, msg.audioText || msg.text, 'normal')}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isThisMsgPlaying && speakingSpeed === 'normal'
                              ? 'bg-[#004ac6] text-white shadow-2xs'
                              : 'bg-blue-50 text-[#004ac6] hover:bg-blue-100'
                          }`}
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
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isThisMsgPlaying && speakingSpeed === 'slow'
                              ? 'bg-amber-500 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Écouter lentement (0.75x)"
                        >
                          <span>🐢</span>
                          <span>0.75x</span>
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-400 font-medium">LinGoL Audio</span>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            );
          })}

          {isLoadingAi && (
            <div className="flex items-start gap-2.5 animate-fadeIn">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-blue-200 shrink-0">
                <img src={LINA_AVATAR} alt="Lina" className="w-full h-full object-cover" />
              </div>
              <div className="bg-white text-slate-700 rounded-3xl rounded-tl-sm px-4 py-3 shadow-2xs border border-slate-200 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#004ac6] animate-spin" />
                <span className="text-xs font-medium">Lina prépare sa réponse vocale...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {dynamicQuickReplies.length > 0 && !isListening && (
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-200/70 shrink-0">
            <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#004ac6]" /> Idées de réponses :
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {dynamicQuickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(reply)}
                  disabled={isLoadingAi}
                  className="tactile-chip px-3 py-1.5 rounded-xl text-xs text-slate-700 whitespace-nowrap shrink-0 hover:text-[#004ac6] cursor-pointer disabled:opacity-50"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RECORDING DRAWER OR PROMINENT INPUT */}
        {isListening ? (
          <div className="p-4 bg-gradient-to-r from-blue-600 via-[#004ac6] to-indigo-700 text-white rounded-t-3xl shadow-xl border-t border-blue-300 animate-slideUp shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400 animate-ping" />
                <span className="font-bold text-sm">🎙️ Lina vous écoute...</span>
                <span className="text-xs text-blue-200 uppercase font-semibold">({currentLang.code})</span>
              </div>
              <button
                onClick={stopListening}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white cursor-pointer font-medium"
              >
                Annuler
              </button>
            </div>

            <div className="h-9 flex items-center justify-center gap-2 py-1">
              <span className="w-1.5 bg-white rounded-full h-3 animate-pulse" />
              <span className="w-2 bg-emerald-300 rounded-full h-7 animate-bounce" />
              <span className="w-1.5 bg-white rounded-full h-8 animate-pulse" />
              <span className="w-2 bg-emerald-200 rounded-full h-5 animate-bounce" />
              <span className="w-1.5 bg-white rounded-full h-7 animate-pulse" />
              <span className="w-2 bg-emerald-300 rounded-full h-4 animate-bounce" />
              <span className="w-1.5 bg-white rounded-full h-3 animate-pulse" />
            </div>

            <div className="bg-black/25 rounded-2xl p-3 text-xs md:text-sm min-h-[42px] flex items-center mb-3">
              {interimTranscript ? (
                <span className="font-bold text-white">« {interimTranscript} »</span>
              ) : (
                <span className="text-blue-200 italic">Parlez clairement dans votre micro...</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSendMessage(interimTranscript || inputText)}
                disabled={!interimTranscript && !inputText}
                className="flex-1 py-2.5 rounded-xl bg-white text-[#004ac6] font-black text-xs hover:bg-blue-50 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Envoyer à Lina</span>
              </button>
              <button
                onClick={stopListening}
                className="py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <MicOff className="w-4 h-4" />
                <span>Arrêter</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 md:p-4 bg-white border-t border-slate-200 space-y-2.5 shrink-0">
            {/* LARGE TACTILE MICROPHONE BUTTON */}
            <button
              onClick={toggleVoiceInput}
              disabled={isLoadingAi}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#004ac6] via-[#2563eb] to-[#004ac6] hover:opacity-95 active:scale-[0.99] text-white font-extrabold text-xs md:text-sm shadow-md flex items-center justify-center gap-2.5 cursor-pointer transition-all border border-blue-400/40"
              title="Parler à Lina au micro"
            >
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <span className="tracking-wide uppercase">🎙️ MICRO POUR PARLER À LINA</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Voix IA</span>
            </button>

            {/* Fallback Text Input */}
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
                    : `Ou tapez votre réponse en ${currentLang.name}...`
                }
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#004ac6] focus:bg-white transition-all disabled:opacity-60"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoadingAi}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  inputText.trim() && !isLoadingAi
                    ? 'btn-3d-primary text-white shadow-xs'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
                title="Envoyer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Desktop Studio Copilot Workspace (hidden on mobile, visible on desktop) */}
      <div className="hidden lg:flex flex-col w-80 xl:w-96 bg-white border-l border-slate-200/90 h-full p-4 overflow-y-auto space-y-4 shrink-0">
        {/* Scenario Card */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Scénario Actif
            </span>
            <span className="text-xl">{scenario.emoji}</span>
          </div>
          <h3 className="font-extrabold text-sm text-slate-800 mb-1">{scenario.title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">{scenario.description}</p>

          <div className="text-[11px] font-bold text-slate-400 mb-1.5">Changer de situation :</div>
          <div className="grid grid-cols-2 gap-1.5">
            {LINA_SCENARIOS.map((sc, idx) => (
              <button
                key={sc.id}
                onClick={() => {
                  playTapSound();
                  setActiveScenarioIdx(idx);
                }}
                className={`p-2 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer truncate ${
                  idx === activeScenarioIdx
                    ? 'border-[#004ac6] bg-blue-50 text-[#004ac6]'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="mr-1">{sc.emoji}</span>
                <span className="truncate">{sc.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Audio & Voice Settings Widget */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#004ac6]" />
            <span>Paramètres Vocaux</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Auto Voice / Continuous Mode */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Mode Vocal Continu</div>
                <div className="text-[10px] text-slate-500">Parler et écouter style appel</div>
              </div>
              <button
                onClick={() => {
                  playTapSound();
                  setContinuousVoiceMode(!continuousVoiceMode);
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  continuousVoiceMode ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    continuousVoiceMode ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Auto Read TTS */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <div className="font-bold text-slate-800">Lecture Audio Automatique</div>
                <div className="text-[10px] text-slate-500">Lina prononce chaque réponse</div>
              </div>
              <button
                onClick={() => {
                  playTapSound();
                  setAutoPlayVoice(!autoPlayVoice);
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  autoPlayVoice ? 'bg-[#004ac6]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    autoPlayVoice ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Test Voice Speed */}
            <div className="pt-2 border-t border-slate-100">
              <div className="font-bold text-slate-800 mb-1.5">Vitesse de prononciation</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    playTapSound();
                    speakText(scenario.initialMessage, currentLang.voiceLang, undefined, 1.0);
                  }}
                  className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3 h-3 text-[#004ac6]" />
                  <span>Normale (1x)</span>
                </button>
                <button
                  onClick={() => {
                    playTapSound();
                    speakText(scenario.initialMessage, currentLang.voiceLang, undefined, 0.75);
                  }}
                  className="py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-semibold text-amber-800 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>🐢 Lente (0.75x)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Vocabulary Detected in Conversation */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-[#004ac6]" /> Vocabulaire Détecté
            </span>
            <span className="text-[10px] text-blue-600 font-bold">Cliquez pour écouter</span>
          </div>

          <div className="space-y-1.5">
            {sampleWords.map((w, idx) => (
              <div
                key={idx}
                onClick={() => handleWordClick(w)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-blue-50 transition-colors border border-slate-100 cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 capitalize group-hover:text-[#004ac6]">
                    {w}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(w, currentLang.voiceLang);
                  }}
                  className="p-1 rounded-lg text-slate-400 group-hover:text-[#004ac6]"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Reset Conversation */}
        <button
          onClick={handleResetConversation}
          className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Recommencer cette conversation</span>
        </button>
      </div>
    </div>
  );
};
