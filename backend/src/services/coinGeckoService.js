const axios = require("axios");

const BASE = "https://api.coingecko.com/api/v3";

const COINS = ["bitcoin", "ethereum", "tether", "binancecoin", "ripple", "usd-coin", "solana", "tron", "dogecoin", "cardano"];

const SYMBOL_MAP = {
  bitcoin:     "BTC",
  ethereum:    "ETH",
  tether:      "USDT",
  binancecoin: "BNB",
  ripple:      "XRP",
  "usd-coin":  "USDC",
  solana:      "SOL",
  tron:        "TRX",
  dogecoin:    "DOGE",
  cardano:     "ADA",
};

const NAME_MAP = {
  bitcoin:     "Bitcoin",
  ethereum:    "Ethereum",
  tether:      "Tether",
  binancecoin: "BNB",
  ripple:      "XRP",
  "usd-coin":  "USD Coin",
  solana:      "Solana",
  tron:        "TRON",
  dogecoin:    "Dogecoin",
  cardano:     "Cardano",
};

const client = axios.create({
  baseURL: BASE,
  timeout: 10000,
  headers: { Accept: "application/json" },
});

/**
 * Fetch live prices + market data for all 5 coins
 */
const fetchAllPrices = async () => {
  const response = await client.get("/coins/markets", {
    params: {
      vs_currency:            "usd",
      ids:                    COINS.join(","),
      order:                  "market_cap_desc",
      per_page:               10,
      page:                   1,
      sparkline:              false,
      price_change_percentage: "1h,24h,7d",
    },
  });

  return response.data.map((coin) => ({
    id:          coin.id,
    symbol:      SYMBOL_MAP[coin.id] || coin.symbol.toUpperCase(),
    name:        NAME_MAP[coin.id]   || coin.name,
    priceUsd:    coin.current_price,
    change1h:    coin.price_change_percentage_1h_in_currency || 0,
    change24h:   coin.price_change_percentage_24h || 0,
    change7d:    coin.price_change_percentage_7d_in_currency || 0,
    marketCap:   coin.market_cap,
    volume24h:   coin.total_volume,
    high24h:     coin.high_24h,
    low24h:      coin.low_24h,
    image:       coin.image,
    rank:        coin.market_cap_rank,
    ath:         coin.ath,
    athDate:     coin.ath_date,
    circulatingSupply: coin.circulating_supply,
  }));
};

/**
 * Fetch price history for a single coin (last 7 days, hourly)
 */
const fetchCoinHistory = async (coinId, days = 7) => {
  const response = await client.get(`/coins/${coinId}/market_chart`, {
    params: {
      vs_currency: "usd",
      days,
      interval: days <= 1 ? "hourly" : "daily",
    },
  });

  // Format: [[timestamp, price], ...]
  return response.data.prices.map(([timestamp, price]) => ({
    timestamp,
    price: parseFloat(price.toFixed(2)),
    date:  new Date(timestamp).toISOString(),
  }));
};

/**
 * Fetch global crypto market stats
 */
const fetchGlobalStats = async () => {
  try {
    const response = await client.get("/global");
    const data = response.data.data;
    return {
      totalMarketCap:    data.total_market_cap.usd,
      totalVolume:       data.total_volume.usd,
      btcDominance:      data.market_cap_percentage.btc,
      ethDominance:      data.market_cap_percentage.eth,
      activeCryptos:     data.active_cryptocurrencies,
      marketCapChange24h: data.market_cap_change_percentage_24h_usd,
    };
  } catch (error) {
    if (error.response) {
      console.error("CoinGecko API Error on /global:", error.response.status, error.response.data);
      throw new Error(`CoinGecko Global Stats Error: ${error.response.status}`);
    }
    console.error("CoinGecko API Error on /global:", error.message);
    throw error;
  }
};

/**
 * Fetch trending coins (top 7 trending on CoinGecko)
 */
const fetchTrending = async () => {
  const response = await client.get("/search/trending");
  return response.data.coins.slice(0, 5).map((c) => ({
    id:     c.item.id,
    name:   c.item.name,
    symbol: c.item.symbol,
    rank:   c.item.market_cap_rank,
    thumb:  c.item.thumb,
  }));
};

module.exports = {
  fetchAllPrices,
  fetchCoinHistory,
  fetchGlobalStats,
  fetchTrending,
  COINS,
  SYMBOL_MAP,
};
