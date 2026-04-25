const axios = require("axios");

const BASE = "https://min-api.cryptocompare.com/data/v2";
const API_KEY = process.env.CRYPTOCOMPARE_API_KEY;

const headers = { Accept: "application/json" };
if (API_KEY && API_KEY.trim() !== "" && API_KEY !== "undefined") {
  headers.Authorization = `Apikey ${API_KEY.trim()}`;
}

const client = axios.create({
  baseURL: BASE,
  timeout: 10000,
  headers: headers,
});

/**
 * Fetch latest crypto news for tracked categories
 */
const fetchLatestNews = async () => {
  try {
    const response = await client.get("/news/", {
      params: {
        lang: "EN",
        categories: "BTC,ETH,USDT,BNB,XRP,USDC,SOL,TRX,DOGE,ADA",
        sortOrder: "latest"
      }
    });

    if (!response.data || !response.data.Data || !Array.isArray(response.data.Data)) {
      console.error("CryptoCompare returned an unexpected structure:", response.data);
      throw new Error("Invalid response structure from CryptoCompare");
    }

    // Map to a consistent format for our frontend
    return response.data.Data.map((article) => ({
      id: article.id,
      title: article.title,
      source: article.source,
      url: article.url,
      body: article.body,
      tags: article.tags,
      published_on: article.published_on * 1000, // Convert to ms
      imageurl: article.imageurl
    }));
  } catch (error) {
    if (error.response) {
      console.error("CryptoCompare API Error:", error.response.status, error.response.data);
      throw new Error(`CryptoCompare API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    console.error("CryptoCompare API Error:", error.message);
    throw error;
  }
};

module.exports = {
  fetchLatestNews
};