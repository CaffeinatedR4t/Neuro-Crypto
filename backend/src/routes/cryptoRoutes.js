const express  = require("express");
const router   = express.Router();
const { getLatestPrices }        = require("../workers/priceWorker");
const { fetchCoinHistory, fetchGlobalStats, fetchTrending } = require("../services/coinGeckoService");
const { generateCoinSummary, generateMarketOverview, analyzeNewsSentiment }       = require("../services/aiService");
const { fetchLatestNews } = require("../services/cryptoCompareService");
const PriceSnapshot = require("../models/PriceSnapshot");
const PriceAlert    = require("../models/PriceAlert");

/**
 * GET /api/crypto/prices
 * Returns latest cached prices for all 5 coins + global stats
 */
router.get("/prices", async (req, res) => {
  try {
    const { prices, lastFetched } = getLatestPrices();

    if (!prices.length) {
      return res.status(503).json({ success: false, message: "Price data not yet available, please wait..." });
    }

    return res.json({ success: true, lastFetched, data: prices });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/crypto/global
 * Returns global market stats
 */
router.get("/global", async (req, res) => {
  try {
    const stats = await fetchGlobalStats();
    return res.json({ success: true, data: stats });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/crypto/trending
 * Returns trending coins on CoinGecko
 */
router.get("/trending", async (req, res) => {
  try {
    const trending = await fetchTrending();
    return res.json({ success: true, data: trending });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/crypto/alerts
 * Returns recent price alerts
 */
router.get("/alerts", async (req, res) => {
  try {
    const alerts = await PriceAlert.find()
      .sort({ createdAt: -1 })
      .limit(20);
    return res.json({ success: true, data: alerts });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/crypto/:coin/history
 * Returns price history from MongoDB snapshots
 * Query: ?days=1|7|30
 */
router.get("/:coin/history", async (req, res) => {
  try {
    const { coin } = req.params;
    const days     = parseInt(req.query.days) || 7;
    const since    = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // First try MongoDB snapshots (our own collected data)
    const snapshots = await PriceSnapshot.find({
      coin,
      createdAt: { $gte: since },
    }).sort({ createdAt: 1 }).select("priceUsd createdAt");

    if (snapshots.length > 10) {
      const history = snapshots.map((s) => ({
        timestamp: new Date(s.createdAt).getTime(),
        price:     s.priceUsd,
        date:      s.createdAt,
      }));
      return res.json({ success: true, source: "mongodb", data: history });
    }

    // Fall back to CoinGecko API
    const history = await fetchCoinHistory(coin, days);
    return res.json({ success: true, source: "coingecko", data: history });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/crypto/:coin/summary
 * Returns AI-generated market summary for a coin
 */
router.get("/:coin/summary", async (req, res) => {
  try {
    const { coin }    = req.params;
    const { prices }  = getLatestPrices();
    const coinData    = prices.find((p) => p.id === coin);

    if (!coinData) {
      return res.status(404).json({ success: false, message: "Coin not found or prices not loaded yet" });
    }

    const summary = await generateCoinSummary(coinData);
    return res.json({ success: true, coin, summary });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/crypto/overview/summary
 * Returns AI-generated overall market overview
 */
router.get("/overview/summary", async (req, res) => {
  try {
    const { prices } = getLatestPrices();
    const globalStats = await fetchGlobalStats();
    const summary = await generateMarketOverview(prices, globalStats);
    return res.json({ success: true, summary });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/crypto/news
 * Returns raw news feed from CryptoCompare
 */
router.get("/news", async (req, res) => {
  try {
    const news = await fetchLatestNews();
    return res.json({ success: true, data: news });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/crypto/news/sentiment
 * Returns sentiment analysis for a headline
 */
router.post("/news/sentiment", async (req, res) => {
  try {
    const { headline } = req.body;
    if (!headline) {
      return res.status(400).json({ success: false, error: "Headline is required" });
    }
    const sentiment = await analyzeNewsSentiment(headline);
    return res.json({ success: true, sentiment });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
