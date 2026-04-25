import axios from "axios";

const api = axios.create({ 
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000", 
  timeout: 15000 
});

export const fetchPrices       = ()         => api.get("/api/crypto/prices");
export const fetchGlobal       = ()         => api.get("/api/crypto/global");
export const fetchAlerts       = ()         => api.get("/api/crypto/alerts");
export const fetchTrending     = ()         => api.get("/api/crypto/trending");
export const fetchHistory      = (coin, days = 7) => api.get(`/api/crypto/${coin}/history?days=${days}`);
export const fetchCoinSummary  = (coin)     => api.get(`/api/crypto/${coin}/summary`);
export const fetchOverview     = ()         => api.get("/api/crypto/overview/summary");
export const checkHealth       = ()         => api.get("/health");
export const fetchNews         = ()         => api.get("/api/crypto/news");
export const analyzeSentiment  = (headline) => api.post("/api/crypto/news/sentiment", { headline });
