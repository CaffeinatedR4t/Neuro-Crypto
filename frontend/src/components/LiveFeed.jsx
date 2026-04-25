import { useState, useEffect, useRef } from "react";
import { fetchPrices } from "../services/api";

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

const LiveFeed = () => {
  const [events,  setEvents]  = useState([]);
  const [paused,  setPaused]  = useState(false);
  const prevPrices            = useRef({});
  const bottomRef             = useRef(null);

  const poll = async () => {
    if (paused) return;
    try {
      const res   = await fetchPrices();
      const coins = res.data.data;
      const newEvents = [];

      coins.forEach(coin => {
        const prev = prevPrices.current[coin.id];
        if (prev && prev !== coin.priceUsd) {
          const diff    = coin.priceUsd - prev;
          const pct     = ((diff / prev) * 100).toFixed(3);
          const up      = diff > 0;
          newEvents.push({
            id:     `${coin.id}-${Date.now()}`,
            symbol: coin.symbol,
            coin:   coin.id,
            price:  coin.priceUsd,
            diff:   Math.abs(diff),
            pct,
            up,
            time:   new Date(),
          });
        }
        prevPrices.current[coin.id] = coin.priceUsd;
      });

      if (newEvents.length) {
        setEvents(prev => [...newEvents, ...prev].slice(0, 50));
      }
    } catch (e) { /* silent */ }
  };

  useEffect(() => { poll(); }, []);
  useEffect(() => {
    const t = setInterval(poll, 15000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #111", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: paused ? "#2a2a2a" : "#00d26a",
            boxShadow: paused ? "none" : "0 0 6px #00d26a",
          }} />
          <p style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 600, color: "#4a4a4a", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Live Feed
          </p>
          <span className="mono" style={{ fontSize: 9, color: "#2a2a2a" }}>
            {paused ? "paused" : "15s"}
          </span>
        </div>
        <button onClick={() => setPaused(p => !p)} style={{
          fontFamily: "'Space Mono'", fontSize: 10,
          padding: "3px 8px", borderRadius: 3,
          border: "1px solid #1c1c1c", background: "transparent",
          color: "#4a4a4a", cursor: "pointer",
        }}>
          {paused ? "▶" : "⏸"}
        </button>
      </div>

      {/* Feed */}
      <div style={{ height: 240, overflowY: "auto" }}>
        {!events.length ? (
          <div style={{ padding: "30px 16px", textAlign: "center" }}>
            <p className="mono" style={{ fontSize: 10, color: "#2a2a2a" }}>
              Waiting for price movements...
            </p>
          </div>
        ) : (
          events.map((e) => {
            const color = COIN_COLORS[e.coin] || "#888";
            return (
              <div key={e.id} style={{
                padding: "7px 16px", borderBottom: "1px solid #0a0a0a",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span className="mono" style={{ fontSize: 9, color: "#2a2a2a", flexShrink: 0, width: 50 }}>
                  {e.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
                <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 700, color, width: 36, flexShrink: 0 }}>
                  {e.symbol}
                </span>
                <span className="mono" style={{ fontSize: 11, color: "#888", flex: 1 }}>
                  ${e.price?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span className="mono" style={{ fontSize: 11, color: e.up ? "#00d26a" : "#ff3b5c", flexShrink: 0 }}>
                  {e.up ? "▲" : "▼"} {e.pct}%
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default LiveFeed;
