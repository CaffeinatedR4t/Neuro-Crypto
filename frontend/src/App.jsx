import { useState } from "react";
import { useCrypto }    from "./hooks/useCrypto";
import Logo             from "./components/Logo";
import TickerBar        from "./components/TickerBar";
import GlobalStats      from "./components/GlobalStats";
import CoinCard         from "./components/CoinCard";
import PriceChart       from "./components/PriceChart";
import AlertFeed        from "./components/AlertFeed";
import AISummary        from "./components/AISummary";
import NewsFeed         from "./components/NewsFeed";
import LiveFeed         from "./components/LiveFeed";
import "./index.css";

export default function App() {
  const { prices, global, alerts, status, lastUpdate, loading, refresh } = useCrypto();
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");

  const handleCoinClick = (coinId) => setSelectedCoin(coinId);

  return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", height: 48,
        borderBottom: "1px solid #1c1c1c", background: "#000",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <Logo />

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Last update */}
          {lastUpdate && (
            <span className="mono" style={{ fontSize: 10, color: "#2a2a2a" }}>
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}

          {/* Refresh */}
          <button onClick={refresh} style={{
            fontFamily: "'Space Mono'", fontSize: 10,
            padding: "5px 12px", borderRadius: 3,
            border: "1px solid #1c1c1c", background: "transparent",
            color: "#4a4a4a", cursor: "pointer",
          }}>
            ↻ Refresh
          </button>

          {/* Status */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: status === "online" ? "#00d26a" : status === "offline" ? "#ff3b5c" : "#f5c518",
              boxShadow: status === "online" ? "0 0 6px #00d26a" : "none",
            }} />
            <span className="mono" style={{ fontSize: 10, color: "#2a2a2a" }}>{status}</span>
          </div>
        </div>
      </div>

      {/* ── Ticker ───────────────────────────────────────────────────────── */}
      <TickerBar prices={prices} />

      {/* ── Global Stats ─────────────────────────────────────────────────── */}
      <GlobalStats global={global} />

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: "20px", maxWidth: 1400, width: "100%", margin: "0 auto" }}>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
            <p className="mono" style={{ fontSize: 12, color: "#2a2a2a" }}>
              Loading market data...
            </p>
          </div>
        ) : (
          <>
            {/* ── Coin Cards ─────────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 16 }}>
              {prices.map(coin => (
                <CoinCard
                  key={coin.id}
                  coin={coin}
                  selected={selectedCoin}
                  onClick={handleCoinClick}
                />
              ))}
            </div>

            {/* ── Chart + Right Panel ────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 10, marginBottom: 16 }}>
              <PriceChart coinId={selectedCoin} prices={prices} />

              {/* Right column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <AlertFeed alerts={alerts} />
                <LiveFeed />
              </div>
            </div>

            {/* ── AI Summary ─────────────────────────────────────────────── */}
            <AISummary prices={prices} />

            {/* ── News Feed ──────────────────────────────────────────────── */}
            <div style={{ marginTop: 16 }}>
              <NewsFeed />
            </div>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #0f0f0f" }}>
              <p className="mono" style={{ fontSize: 10, color: "#1c1c1c", textAlign: "center" }}>
                NEURO CRYPTO · Data: CoinGecko · AI: Gemini 2.5 · Serverless: Cloudflare Workers · DB: MongoDB
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
