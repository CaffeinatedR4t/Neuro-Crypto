const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const withTimeout = (promise, ms = 12000) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Gemini timeout")), ms)
  );
  return Promise.race([promise, timeout]);
};

/**
 * Generate a short market summary for a single coin
 */
const generateCoinSummary = async (coin) => {
  const prompt = `
You are a concise crypto market analyst. Give a 2-sentence market update for ${coin.name} (${coin.symbol}).

Current data:
- Price: $${coin.priceUsd?.toLocaleString()}
- 1h change: ${coin.change1h?.toFixed(2)}%
- 24h change: ${coin.change24h?.toFixed(2)}%
- 7d change: ${coin.change7d?.toFixed(2)}%
- 24h volume: $${(coin.volume24h / 1e9).toFixed(2)}B
- Market cap: $${(coin.marketCap / 1e9).toFixed(2)}B
- 24h High: $${coin.high24h?.toLocaleString()}
- 24h Low: $${coin.low24h?.toLocaleString()}

Be direct, data-driven, and professional. No fluff. Max 2 sentences.
  `.trim();

  const result = await withTimeout(model.generateContent(prompt));
  return result.response.text().trim();
};

/**
 * Generate overall market sentiment summary
 */
const generateMarketOverview = async (coins, globalStats) => {
  const coinSummary = coins.map(c =>
    `${c.symbol}: $${c.priceUsd?.toLocaleString()} (${c.change24h?.toFixed(2)}% 24h)`
  ).join(", ");

  const prompt = `
You are a concise crypto market analyst. Give a 3-sentence market overview.

Market data:
- Total market cap: $${(globalStats.totalMarketCap / 1e12).toFixed(2)}T
- 24h market cap change: ${globalStats.marketCapChange24h?.toFixed(2)}%
- BTC dominance: ${globalStats.btcDominance?.toFixed(1)}%
- ETH dominance: ${globalStats.ethDominance?.toFixed(1)}%
- Prices: ${coinSummary}

Be direct and professional. Max 3 sentences. Mention overall sentiment (bullish/bearish/neutral).
  `.trim();

  const result = await withTimeout(model.generateContent(prompt));
  return result.response.text().trim();
};

/**
 * Analyze sentiment of a news headline
 */
const analyzeNewsSentiment = async (headline) => {
  const prompt = `
Analyze the sentiment of this cryptocurrency news headline. 
Reply with exactly one word: BULLISH, BEARISH, or NEUTRAL.

Headline: "${headline}"
  `.trim();

  try {
    const result = await withTimeout(model.generateContent(prompt), 5000);
    const text = result.response.text().trim().toUpperCase();
    if (text.includes("BULLISH")) return "BULLISH";
    if (text.includes("BEARISH")) return "BEARISH";
    return "NEUTRAL";
  } catch (err) {
    return "NEUTRAL"; // Default on error/timeout
  }
};

module.exports = { generateCoinSummary, generateMarketOverview, analyzeNewsSentiment };
