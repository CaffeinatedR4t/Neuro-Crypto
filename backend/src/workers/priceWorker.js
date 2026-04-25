const { fetchAllPrices } = require("../services/coinGeckoService");
const { checkForAlerts }  = require("../services/alertService");
const PriceSnapshot       = require("../models/PriceSnapshot");

let isRunning = false;
let intervalId = null;

// Cache latest prices in memory for instant API responses
let latestPrices = [];
let lastFetched  = null;

const getLatestPrices = () => ({ prices: latestPrices, lastFetched });

const poll = async () => {
  try {
    const coins = await fetchAllPrices();

    // Update in-memory cache
    latestPrices = coins;
    lastFetched  = new Date().toISOString();

    // Save snapshot to MongoDB (for history charts)
    const snapshots = coins.map((coin) => ({
      coin:      coin.id,
      symbol:    coin.symbol,
      priceUsd:  coin.priceUsd,
      change24h: coin.change24h,
      marketCap: coin.marketCap,
      volume24h: coin.volume24h,
      high24h:   coin.high24h,
      low24h:    coin.low24h,
    }));

    await PriceSnapshot.insertMany(snapshots);

    // Check for price alerts
    await checkForAlerts(coins);

    console.log(`📊 Prices updated — BTC: $${coins.find(c => c.id === "bitcoin")?.priceUsd?.toLocaleString()}`);
  } catch (err) {
    console.error("⚠️ Price worker error:", err.message);
  }
};

const startWorker = () => {
  if (isRunning) return;
  isRunning = true;

  // Run immediately on start
  poll();

  // Then every 30 seconds
  intervalId = setInterval(poll, 30000);
  console.log("🚀 Price worker started — polling every 30s");
};

const stopWorker = () => {
  if (intervalId) clearInterval(intervalId);
  isRunning = false;
  console.log("🛑 Price worker stopped");
};

module.exports = { startWorker, stopWorker, getLatestPrices };
