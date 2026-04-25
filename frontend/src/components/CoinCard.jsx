import { useState, useEffect } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { fetchHistory } from "../services/api";

const fmt    = (n) => n?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtB   = (n) => n ? `$${(n / 1e9).toFixed(1)}B` : "—";
const fmtPct = (n, show = true) => show ? `${n >= 0 ? "+" : ""}${n?.toFixed(2)}%` : `${n?.toFixed(2)}%`;

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

const MiniTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0f0f0f", border: "1px solid #1c1c1c", padding: "4px 8px", borderRadius: 3 }}>
      <span className="mono" style={{ fontSize: 10, color: "#e2e2e2" }}>${payload[0].value?.toLocaleString()}</span>
    </div>
  );
};

const CoinCard = ({ coin, selected, onClick }) => {
  const [history, setHistory] = useState([]);
  const up    = coin.change24h >= 0;
  const color = COIN_COLORS[coin.id] || "#e2e2e2";
  const isSelected = selected === coin.id;

  useEffect(() => {
    fetchHistory(coin.id, 1)
      .then(r => setHistory(r.data.data.slice(-48)))
      .catch(() => {});
  }, [coin.id]);

  return (
    <div
      onClick={() => onClick(coin.id)}
      className="card"
      style={{
        cursor: "pointer", overflow: "hidden",
        borderColor: isSelected ? color + "44" : "#1c1c1c",
        transition: "border-color 0.2s",
      }}
    >
      {/* Header */}
      <div style={{ padding: "14px 16px 10px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 600, color: "#4a4a4a", letterSpacing: "0.1em" }}>
              #{coin.rank}
            </span>
            <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 700, color, letterSpacing: "0.05em" }}>
              {coin.symbol}
            </span>
            <span style={{ fontFamily: "'Barlow'", fontSize: 11, color: "#4a4a4a" }}>
              {coin.name}
            </span>
          </div>
          <p className="mono" style={{ fontSize: 20, fontWeight: 700, color: "#e2e2e2", letterSpacing: "-0.02em" }}>
            ${fmt(coin.priceUsd)}
          </p>
        </div>

        {/* 24h change badge */}
        <div style={{
          padding: "4px 8px", borderRadius: 3,
          background: up ? "rgba(0,210,106,0.08)" : "rgba(255,59,92,0.08)",
          border: `1px solid ${up ? "rgba(0,210,106,0.2)" : "rgba(255,59,92,0.2)"}`,
        }}>
          <span className="mono" style={{ fontSize: 12, color: up ? "#00d26a" : "#ff3b5c" }}>
            {fmtPct(coin.change24h)}
          </span>
        </div>
      </div>

      {/* Mini sparkline */}
      {history.length > 0 && (
        <div style={{ height: 48, margin: "0 -1px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${coin.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="price" stroke={color} strokeWidth={1.5}
                fill={`url(#grad-${coin.id})`} dot={false} />
              <Tooltip content={<MiniTooltip />} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Stats row */}
      <div style={{ padding: "10px 16px 12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 0", borderTop: "1px solid #111" }}>
        {[
          { label: "MCap",   value: fmtB(coin.marketCap) },
          { label: "Vol",    value: fmtB(coin.volume24h) },
          { label: "24h Hi", value: `$${fmt(coin.high24h)}` },
          { label: "24h Lo", value: `$${fmt(coin.low24h)}` },
        ].map(s => (
          <div key={s.label}>
            <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: "#4a4a4a", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {s.label}{" "}
            </span>
            <span className="mono" style={{ fontSize: 11, color: "#888" }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Change row */}
      <div style={{ padding: "6px 16px 12px", display: "flex", gap: 16 }}>
        {[
          { label: "1H",  value: coin.change1h  },
          { label: "24H", value: coin.change24h },
          { label: "7D",  value: coin.change7d  },
        ].map(c => (
          <div key={c.label} style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: "#4a4a4a" }}>{c.label}</span>
            <span className="mono" style={{ fontSize: 11, color: (c.value || 0) >= 0 ? "#00d26a" : "#ff3b5c" }}>
              {fmtPct(c.value, true)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoinCard;
