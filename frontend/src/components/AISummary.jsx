import { useState } from "react";
import { fetchCoinSummary, fetchOverview } from "../services/api";

const COIN_COLORS = {
  bitcoin:     "#f5c518",
  ethereum:    "#4d9fff",
  tether:      "#50af95",
  binancecoin: "#f0b90b",
  ripple:      "#00aae4",
  "usd-coin":  "#2775ca",
  solana:      "#9945ff",
  tron:        "#ff0013",
  dogecoin:    "#c2a633",
  cardano:     "#0033ad",
};

const AISummary = ({ prices }) => {
  const [summary,  setSummary]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [active,   setActive]   = useState(null); // coin id or "overview"
  const [error,    setError]    = useState(null);

  const loadOverview = async () => {
    setLoading(true); setError(null); setActive("overview");
    try {
      const res = await fetchOverview();
      setSummary(res.data.summary);
    } catch (e) {
      setError("AI unavailable — quota may be exhausted");
    } finally { setLoading(false); }
  };

  const loadCoin = async (coinId) => {
    setLoading(true); setError(null); setActive(coinId);
    try {
      const res = await fetchCoinSummary(coinId);
      setSummary(res.data.summary);
    } catch (e) {
      setError("AI unavailable — quota may be exhausted");
    } finally { setLoading(false); }
  };

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #111", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#4d9fff" }}>◆</span>
          <p style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 600, color: "#4a4a4a", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            AI Analysis
          </p>
          <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: "#2a2a2a", letterSpacing: "0.05em" }}>
            Gemini 2.5
          </span>
        </div>
      </div>

      {/* Coin selector */}
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #0d0d0d", display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button onClick={loadOverview} style={{
          fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 600,
          padding: "3px 10px", borderRadius: 3, cursor: "pointer",
          border: "1px solid",
          borderColor: active === "overview" ? "#4d9fff44" : "#1c1c1c",
          background: active === "overview" ? "#4d9fff11" : "transparent",
          color: active === "overview" ? "#4d9fff" : "#4a4a4a",
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>
          Market
        </button>
        {prices.map(coin => (
          <button key={coin.id} onClick={() => loadCoin(coin.id)} style={{
            fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 600,
            padding: "3px 10px", borderRadius: 3, cursor: "pointer",
            border: "1px solid",
            borderColor: active === coin.id ? (COIN_COLORS[coin.id] + "44") : "#1c1c1c",
            background: active === coin.id ? (COIN_COLORS[coin.id] + "11") : "transparent",
            color: active === coin.id ? COIN_COLORS[coin.id] : "#4a4a4a",
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>
            {coin.symbol}
          </button>
        ))}
      </div>

      {/* Summary output */}
      <div style={{ padding: "16px", minHeight: 90 }}>
        {loading ? (
          <p className="mono cursor" style={{ fontSize: 11, color: "#4a4a4a" }}>Generating analysis</p>
        ) : error ? (
          <p className="mono" style={{ fontSize: 11, color: "#ff3b5c44" }}>{error}</p>
        ) : summary ? (
          <p style={{ fontFamily: "'Barlow'", fontSize: 13, color: "#888", lineHeight: 1.7, fontStyle: "italic" }}>
            "{summary}"
          </p>
        ) : (
          <p className="mono" style={{ fontSize: 11, color: "#2a2a2a" }}>
            Select Market or a coin above to generate AI analysis
          </p>
        )}
      </div>
    </div>
  );
};

export default AISummary;
