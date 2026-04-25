import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fetchHistory } from "../services/api";

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

const DAYS = [
  { label: "1D", value: 1 },
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0f0f0f", border: "1px solid #1c1c1c", padding: "8px 12px", borderRadius: 3 }}>
      <p style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: "#4a4a4a", marginBottom: 4 }}>
        {new Date(label).toLocaleString()}
      </p>
      <p className="mono" style={{ fontSize: 13, color: "#e2e2e2" }}>
        ${payload[0].value?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
};

const PriceChart = ({ coinId, prices }) => {
  const [history, setHistory] = useState([]);
  const [days,    setDays]    = useState(7);
  const [loading, setLoading] = useState(true);

  const coin  = prices.find(p => p.id === coinId);
  const color = COIN_COLORS[coinId] || "#e2e2e2";

  useEffect(() => {
    if (!coinId) return;
    setLoading(true);
    fetchHistory(coinId, days)
      .then(r => { setHistory(r.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [coinId, days]);

  if (!coin) return null;

  const up = coin.change24h >= 0;
  const minPrice = history.length ? Math.min(...history.map(h => h.price)) : 0;
  const maxPrice = history.length ? Math.max(...history.map(h => h.price)) : 0;

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #111" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 3, height: 24, background: color, borderRadius: 2 }} />
          <div>
            <p style={{ fontFamily: "'Barlow Condensed'", fontSize: 18, fontWeight: 700, color, letterSpacing: "0.03em" }}>
              {coin.symbol} / USD
            </p>
            <p className="mono" style={{ fontSize: 11, color: "#4a4a4a" }}>{coin.name}</p>
          </div>
          <div style={{ marginLeft: 8 }}>
            <p className="mono" style={{ fontSize: 22, color: "#e2e2e2", letterSpacing: "-0.02em" }}>
              ${coin.priceUsd?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <span className="mono" style={{ fontSize: 13, color: up ? "#00d26a" : "#ff3b5c" }}>
            {up ? "▲" : "▼"} {Math.abs(coin.change24h)?.toFixed(2)}%
          </span>
        </div>

        {/* Day toggle */}
        <div style={{ display: "flex", gap: 2 }}>
          {DAYS.map(d => (
            <button key={d.value} onClick={() => setDays(d.value)}
              style={{
                fontFamily: "'Space Mono'", fontSize: 11,
                padding: "4px 10px", borderRadius: 3, cursor: "pointer",
                border: "1px solid",
                borderColor: days === d.value ? color + "44" : "#1c1c1c",
                background: days === d.value ? color + "11" : "transparent",
                color: days === d.value ? color : "#4a4a4a",
                transition: "all 0.15s",
              }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Range */}
      <div style={{ padding: "8px 20px", display: "flex", gap: 20, borderBottom: "1px solid #0f0f0f" }}>
        {[
          { label: "Range Lo", value: `$${minPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: "#ff3b5c" },
          { label: "Range Hi", value: `$${maxPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: "#00d26a" },
          { label: "ATH",      value: `$${coin.ath?.toLocaleString()}`, color: "#f5c518" },
        ].map(s => (
          <div key={s.label} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: "#4a4a4a", textTransform: "uppercase", letterSpacing: "0.07em" }}>{s.label}</span>
            <span className="mono" style={{ fontSize: 11, color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ height: 220, padding: "12px 8px 8px 0" }}>
        {loading ? (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p className="mono" style={{ fontSize: 11, color: "#2a2a2a" }}>Loading chart...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id={`main-grad-${coinId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="1 4" stroke="#111" vertical={false} />
              <XAxis dataKey="timestamp"
                tickFormatter={t => new Date(t).toLocaleDateString([], { month: "short", day: "numeric" })}
                tick={{ fontFamily: "'Space Mono'", fontSize: 9, fill: "#2a2a2a" }}
                axisLine={false} tickLine={false} interval="preserveStartEnd"
              />
              <YAxis
                domain={["auto", "auto"]}
                tickFormatter={v => `$${v >= 1000 ? (v/1000).toFixed(0)+"k" : v.toFixed(0)}`}
                tick={{ fontFamily: "'Space Mono'", fontSize: 9, fill: "#2a2a2a" }}
                axisLine={false} tickLine={false} width={52}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="price" stroke={color} strokeWidth={1.5}
                fill={`url(#main-grad-${coinId})`} dot={false} activeDot={{ r: 3, fill: color }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default PriceChart;
