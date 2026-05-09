---
name: ai-integration
description: "AI integration best practices for src/server/lib/ai.ts—research generation, digest synthesis, and prompt engineering"
applyTo: "src/server/lib/ai.ts"
---

# AI Integration (src/server/lib/ai.ts)

This file handles all OpenAI interactions: stock research generation, market digest synthesis, and prompt engineering. Follow these guidelines to maintain consistency and quality.

## Principles

- **Prompt Quality**: Clear, structured prompts yield better results—invest in prompt engineering
- **Error Resilience**: API calls can fail; always provide graceful fallbacks
- **Cost Awareness**: Cache results aggressively; batch requests when possible
- **Output Validation**: Validate AI responses before returning to client (parsing, structure)
- **Type Safety**: Strongly type AI responses using shared types from `src/shared/types.ts`

## Patterns

### 1. Research Generation

When generating research for a stock, use a structured prompt that guides the AI:

```typescript
const generateStockResearch = async (ticker: string) => {
  const prompt = `
    You are a financial analyst. Research the stock ${ticker}.
    Provide a structured analysis covering:
    1. Current Price & Performance
    2. Company Overview
    3. Key Financial Metrics
    4. Growth Prospects
    5. Key Risks
    6. Investment Thesis
    
    Format as JSON with clear sections.
  `;
  
  // Call OpenAI with temperature ~0.7 (balanced creativity/accuracy)
  // Validate response structure before returning
  // Catch API errors and return null or cached fallback
};
```

### 2. Digest Synthesis

Market digests summarize multiple stocks into a cohesive narrative:

```typescript
const generateDigest = async (stocks: StockData[]) => {
  const prompt = `
    Synthesize these stocks into a 3-5 paragraph market digest.
    Identify themes, correlations, and investment angles.
    Tone: Professional, accessible to retail investors.
  `;
  
  // Batch research if stocks not yet analyzed
  // Synthesize into one response
  // Cache result (market digests are expensive)
};
```

### 3. Prompt Engineering Tips

- **Be Specific**: Vague prompts → vague outputs. Specify format, tone, and constraints.
- **Provide Context**: Include relevant data (price, sector, fundamentals) in the prompt
- **Structured Output**: Ask for JSON, bullet points, or specific formats—easier to parse
- **Temperature**: Use 0.7 for analysis (balanced), 0.3 for factual tasks (consistent)
- **Tokens**: Monitor token usage; long prompts + long outputs = higher cost

### 4. Caching & Performance

```typescript
// Check cache before calling OpenAI
const cachedResearch = await cache.get(`research:${ticker}`);
if (cachedResearch) return cachedResearch;

// Call OpenAI
const research = await openai.chat.completions.create({...});

// Cache for 1 hour (stock data doesn't change rapidly)
await cache.set(`research:${ticker}`, research, 3600);

return research;
```

### 5. Error Handling

```typescript
try {
  const response = await openai.chat.completions.create({...});
  
  // Validate response structure
  if (!response.choices[0]?.message?.content) {
    throw new Error("Invalid API response");
  }
  
  // Parse and validate JSON if needed
  const parsed = JSON.parse(response.choices[0].message.content);
  // Validate schema...
  
  return parsed;
} catch (error) {
  if (error instanceof APIError) {
    // Rate limit, quota exceeded, auth failure
    logger.error("OpenAI API error", error);
    return getFallbackResearch(ticker); // Return cached/generic fallback
  }
  throw error;
}
```

## Types & Contracts

All AI-generated data should conform to types in `src/shared/types.ts`:

```typescript
interface StockResearch {
  ticker: string;
  summary: string;
  fundamentals: {
    pe: number;
    eps: number;
    revenue: number;
    // ...
  };
  thesis: string;
  risks: string[];
  generatedAt: Date;
}

interface MarketDigest {
  title: string;
  summary: string;
  themes: string[];
  stocks: StockResearch[];
  generatedAt: Date;
}
```

## Testing & Validation

Before shipping AI features:
1. **Test Parsing**: Ensure JSON responses parse without errors
2. **Validate Schema**: Check that response matches expected type
3. **Check Edge Cases**: Empty inputs, invalid tickers, API failures
4. **Monitor Costs**: Track token usage and cache hit rates
5. **Review Output**: Manually verify 2-3 responses for quality and accuracy

## Common Pitfalls

- **No Cache**: Calling OpenAI for the same stock repeatedly = wasted money + slow responses
- **Weak Prompts**: Ambiguous prompts lead to inconsistent, low-quality outputs
- **No Fallback**: When API fails, user gets an error instead of cached/generic data
- **Silent Failures**: Parsing JSON without validation crashes the server
- **Leaking Tokens**: Long conversations without truncation = exponential cost growth

---

*Related Files:*
- `src/server/lib/cache.ts` — Caching layer (Redis/in-memory)
- `src/shared/types.ts` — Shared type definitions
- `.env.example` — OpenAI API key configuration
