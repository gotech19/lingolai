import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ChatHistoryItem {
  sender: 'user' | 'lina';
  text: string;
}

// Conversation API Endpoint
app.post('/api/chat', async (req, res) => {
  const {
    message,
    history = [],
    targetLanguage = 'es',
    languageName = 'Spanish',
    scenario = 'Free Conversation',
  } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Format previous conversation context
  const conversationContext = (history as ChatHistoryItem[])
    .slice(-6)
    .map((item) => `${item.sender === 'user' ? 'Learner' : 'Lina'}: ${item.text}`)
    .join('\n');

  const systemInstruction = `You are Lina AI, a friendly, warm, empathetic language teacher and 24/7 conversational partner in the LinGoL language learning app.
The learner is practicing ${languageName} (code: ${targetLanguage}).
The active scenario is: "${scenario}".

Follow these rules:
1. Always reply in natural, authentic ${languageName} suited for learners (1 to 3 sentences).
2. Keep the conversation lively, encouraging, and ask engaging follow-up questions to keep the dialogue flowing.
3. If the learner made a grammar, vocabulary, or conjugational mistake in their last message, gently provide the corrected phrasing and a brief encouraging explanation in the "correction" field. If their message was correct or had no notable mistake, leave "correction" as an empty string.
4. In "translation", give a clear, accurate French or English translation of your reply for comprehension.
5. In "grammarTip", offer a short, practical language tip or cultural insight about the phrases used (e.g. colloquialisms, formal vs informal address, regional customs), or an empty string.
6. In "suggestedReplies", provide exactly 3 natural, short responses in ${languageName} that the learner could say next.`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const prompt = `Previous dialogue:\n${conversationContext || 'No previous history'}\n\nLearner: ${message}\n\nPlease respond as Lina in ${languageName}:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: `Lina's conversational response in ${languageName}.`,
            },
            translation: {
              type: Type.STRING,
              description: 'English translation of Lina\'s response.',
            },
            grammarTip: {
              type: Type.STRING,
              description: 'Brief linguistic or cultural tip, or empty string.',
            },
            correction: {
              type: Type.STRING,
              description: 'Gentle feedback/correction if user made a mistake, or empty string.',
            },
            suggestedReplies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: `3 short, natural suggested user replies in ${languageName}.`,
            },
          },
          required: ['reply', 'translation', 'suggestedReplies'],
        },
      },
    });

    const responseText = response.text?.trim();
    if (!responseText) {
      throw new Error('Empty response from model');
    }

    const parsed = JSON.parse(responseText);
    return res.json({
      reply: parsed.reply,
      translation: parsed.translation || '',
      grammarTip: parsed.grammarTip || undefined,
      correction: parsed.correction || undefined,
      suggestedReplies: Array.isArray(parsed.suggestedReplies) && parsed.suggestedReplies.length > 0
        ? parsed.suggestedReplies
        : ['¡Muchas gracias!', '¿Puedes repetirlo más despacio?', '¿Qué significa eso?'],
    });
  } catch (error) {
    console.warn('AI Chat fallback triggered:', error);

    // Smart contextual fallback when Gemini API is loading or unavailable
    const fallbackResponses: Record<string, { reply: string; translation: string; tip?: string; suggestions: string[] }> = {
      es: {
        reply: `¡Muy bien! Me gusta mucho cómo estás practicando tu español. Cuéntame un poco más sobre ti, ¿qué te gusta hacer en tu tiempo libre?`,
        translation: 'Very good! I really like how you are practicing your Spanish. Tell me a bit more about yourself, what do you like to do in your free time?',
        tip: 'Tip: "En tu tiempo libre" means "in your free time". Remember the preposition "en" is used here.',
        suggestions: ['Me gusta escuchar música y leer.', 'Suelo salir con mis amigos los fines de semana.', 'Me encanta viajar y conocer nuevas culturas.'],
      },
      fr: {
        reply: `C'est formidable ! Tu t'exprimes très bien en français. Raconte-moi, qu'est-ce que tu as prévu de faire aujourd'hui ?`,
        translation: "That's wonderful! You express yourself very well in French. Tell me, what do you have planned for today?",
        tip: 'Astuce : "Qu\'est-ce que tu as prévu" is a very natural way to ask about someone\'s plans.',
        suggestions: ['Je vais me promener au parc.', 'Je dois travailler un peu aujourd\'hui.', 'Je vais préparer un bon repas ce soir.'],
      },
      de: {
        reply: `Sehr gut gemacht! Dein Deutsch verbessert sich stetig. Was machst du heute noch Schönes?`,
        translation: 'Very well done! Your German is constantly improving. What nice things are you doing today?',
        tip: 'Tipp: "Sehr gut gemacht" is commonly used to praise someone\'s effort.',
        suggestions: ['Ich gehe heute spazieren.', 'Ich lerne weiter Deutsch!', 'Ich treffe mich mit Freunden.'],
      },
      it: {
        reply: `Bellissimo! Il tuo italiano sta migliorando molto. Che cosa ti piacerebbe fare oggi?`,
        translation: 'Beautiful! Your Italian is improving a lot. What would you like to do today?',
        tip: 'Consiglio: "Ti piacerebbe" is the polite conditional form of "would you like".',
        suggestions: ['Vorrei prendere un caffè.', 'Vado a fare una passeggiata.', 'Sto studiando con Lina AI!'],
      },
      ja: {
        reply: `素晴らしいですね！日本語の練習をとても頑張っていますね。今日のご予定は何ですか？`,
        translation: 'Wonderful! You are doing great practicing Japanese. What are your plans for today?',
        tip: 'ポイント: 「素晴らしい」(subarashii) expresses admiration for great progress.',
        suggestions: ['散歩に行く予定です。', '美味しいものを食べたいです。', '日本語をもっと勉強します！'],
      },
    };

    const fb = fallbackResponses[targetLanguage] || fallbackResponses.es;

    return res.json({
      reply: fb.reply,
      translation: fb.translation,
      grammarTip: fb.tip,
      suggestedReplies: fb.suggestions,
    });
  }
});

// Serve frontend in production or via Vite middlewares in development
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LinGoL Server with Gemini AI running on port ${PORT}`);
  });
}

startServer();
