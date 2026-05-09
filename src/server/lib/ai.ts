import { GoogleGenerativeAI } from '@google/generative-ai';
import type { StockQuote, StockRecommendation } from '../../shared/types.js';
import { getCache, setCache } from './cache.js';

const LLM_PROVIDER = process.env.LLM_PROVIDER ?? 'gemini';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const MODEL_NAME = process.env.GOOGLE_MODEL ?? 'gemini-1.5-flash';

function extractJson(text: string): string | null {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }
  return null;
}

function buildRecommendationPrompt(symbol: string, quote: StockQuote) {
  return `You are a financial analyst. Provide a concise investment recommendation for ${symbol}.

Use the data below in your reasoning:
- Current price: ${quote.currentPrice}
- Change: ${quote.change} (${quote.percentChange}%)
- Market: ${quote.exchange}
- Last update: ${quote.updatedAt}

Return ONLY valid JSON with the following keys:
{
  "action": "BUY|SELL|HOLD",
  "confidence": "high|medium|low",
  "targetPrice": number,
  "stopLoss": number,
  "rationale": string,
  "bullCase": string,
  "bearCase": string,
  "riskSummary": string,
  "upsidePercent": number
}

Keep the tone professional, clear, and suitable for retail investors.`;
}

async function generateFromProvider(prompt: string): Promise<string> {
  if (LLM_PROVIDER === 'gemini' && GOOGLE_API_KEY) {
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent({
      prompt,
      temperature: 0.3,
      candidateCount: 1
    });
    return result.response.text();
  }

  throw new Error('LLM provider is not configured.');
}

export async function generateStockRecommendation(symbol: string, quote: StockQuote): Promise<StockRecommendation> {
  const cacheKey = `recommendation:${symbol.toUpperCase()}`;
  const cached = getCache<StockRecommendation>(cacheKey);
  if (cached) return cached;

  const prompt = buildRecommendationPrompt(symbol, quote);
  let jsonOutput: string | null = null;
  let aiText = '';

  try {
    aiText = await generateFromProvider(prompt);
    jsonOutput = extractJson(aiText);
  } catch (error) {
    console.warn('LLM request failed:', error);
  }

  let recommendation: StockRecommendation = {
    action: 'HOLD',
    confidence: 'medium',
    targetPrice: quote.currentPrice * 1.05,
    stopLoss: quote.currentPrice * 0.95,
    rationale: `Use caution on ${symbol}. Market conditions are mixed and fundamentals should be reviewed before acting.`,
    bullCase: 'Reasonable growth outlook if the company keeps execution on track.',
    bearCase: 'Volatility and macro uncertainty could pressure performance.',
    riskSummary: 'Moderate with a balanced risk/reward profile.',
    upsidePercent: 5
  };

  if (jsonOutput) {
    try {
      const parsed = JSON.parse(jsonOutput);
      recommendation = {
        action: parsed.action ?? recommendation.action,
        confidence: parsed.confidence ?? recommendation.confidence,
        targetPrice: typeof parsed.targetPrice === 'number' ? parsed.targetPrice : recommendation.targetPrice,
        stopLoss: typeof parsed.stopLoss === 'number' ? parsed.stopLoss : recommendation.stopLoss,
        rationale: typeof parsed.rationale === 'string' ? parsed.rationale : recommendation.rationale,
        bullCase: typeof parsed.bullCase === 'string' ? parsed.bullCase : recommendation.bullCase,
        bearCase: typeof parsed.bearCase === 'string' ? parsed.bearCase : recommendation.bearCase,
        riskSummary: typeof parsed.riskSummary === 'string' ? parsed.riskSummary : recommendation.riskSummary,
        upsidePercent: typeof parsed.upsidePercent === 'number' ? parsed.upsidePercent : recommendation.upsidePercent
      };
    } catch (error) {
      console.warn('Failed to parse LLM JSON:', error, aiText);
    }
  }

  setCache(cacheKey, recommendation, 60 * 60 * 4);
  return recommendation;
}

export async function callLLM(prompt: string): Promise<string> {
  if (LLM_PROVIDER === 'gemini' && GOOGLE_API_KEY) {
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent({
      prompt,
      temperature: 0.55,
      candidateCount: 1
    });
    return result.response.text();
  }

  return Promise.resolve('AI provider not configured.');
}
