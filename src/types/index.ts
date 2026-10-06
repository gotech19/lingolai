export type LanguageCode = 'es' | 'en' | 'fr' | 'de' | 'it' | 'ja' | 'zh' | 'ar';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  voiceLang: string;
  sampleGreeting: string;
  isRtl?: boolean;
}

export interface UserStats {
  streakDays: number;
  streakActiveToday: boolean;
  xp: number;
  gems: number;
  hearts: number;
  maxHearts: number;
  level: number;
  cefrLevel: CEFRLevel;
  selectedLanguage: LanguageCode;
  dailyGoalMinutes: number;
  todayMinutesPracticed: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  provider: 'google' | 'guest';
  isAuthenticated: boolean;
}

export interface WordChip {
  id: string;
  text: string;
}

export interface LessonQuestion {
  id: string;
  type: 'translate_to_target' | 'translate_to_english' | 'listen_and_build' | 'fill_in_blank';
  prompt: string;
  subPrompt?: string;
  targetAudioText?: string;
  targetAudioLang?: string;
  correctAnswer: string[];
  options: string[];
  explanation: string;
}

export interface UnitLesson {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  questions: LessonQuestion[];
  isCompleted: boolean;
  isLocked: boolean;
  stars: number;
}

export interface Unit {
  id: string;
  number: number;
  title: string;
  description: string;
  color: string;
  lessons: UnitLesson[];
}

export interface ChatMessage {
  id: string;
  sender: 'lina' | 'user';
  text: string;
  translation?: string;
  grammarTip?: string;
  correction?: string;
  audioText?: string;
  timestamp: string;
  isGenerating?: boolean;
}

export interface Flashcard {
  id: string;
  term: string;
  phonetic?: string;
  translation: string;
  exampleSentence: string;
  exampleTranslation: string;
  mastery: number; // 0-100
  languageCode?: LanguageCode;
  category?: string;
  isFavorite?: boolean;
}

export interface WordOfTheDay {
  id: string;
  languageCode: LanguageCode;
  term: string;
  phonetic?: string;
  translation: string;
  explanation: string;
  exampleSentence: string;
  exampleTranslation: string;
  partOfSpeech?: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  isCurrentUser?: boolean;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  rewardXp: number;
  rewardGems: number;
  isCompleted: boolean;
  icon: string;
}

export interface DailyPlanItem {
  id: string;
  title: string;
  type: 'vocabulary' | 'listening' | 'speaking' | 'grammar';
  durationMin: number;
  isCompleted: boolean;
}

export interface SpeakingEvaluation {
  pronunciationScore: number;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  intelligibilityScore: number;
  wpm: number;
  feedback: string;
  transcription: string;
  recordedAudioUrl?: string;
}
