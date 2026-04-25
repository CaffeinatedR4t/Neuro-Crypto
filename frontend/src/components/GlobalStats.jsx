const fmtT = (n) => n ? `$${(n / 1e12).toFixed(2)}T` : "—";
const fmtB = (n) => n ? `$${(n / 1e9).toFixed(0)}B` : "—";

const Stat = ({ label, value, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 20px", borderRight: "1px solid #1c1c1c" }}>
    <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: "#4a4a4a", textTransform: "uppercase", letterSpacing: "0.08em" }}>
      {label}
    </span>
    <span className="mono" style={{ fontSize: 12, color: color || "#e2e2e2" }}>
      {value}
    </span>
  </div>
);

const GlobalStats = ({ global: g }) => {
  if (!g) return null;
  const capUp = g.marketCapChange24h >= 0;

  return (
    <div style={{
      display: "flex", alignItems: "center",
      borderBottom: "1px solid #1c1c1c",
      background: "#000",
      height: 34, overflowX: "auto",
    }}>
      <Stat label="Mkt Cap"    value={fmtT(g.totalMarketCap)} />
      <Stat label="24h"        value={`${g.marketCapChange24h?.toFixed(2)}%`} color={capUp ? "#00d26a" : "#ff3b5c"} />
      <Stat label="Vol 24h"    value={fmtB(g.totalVolume)} />
      <Stat label="BTC Dom"    value={`${g.btcDominance?.toFixed(1)}%`} color="#f5c518" />
      <Stat label="ETH Dom"    value={`${g.ethDominance?.toFixed(1)}%`} color="#4d9fff" />
      <Stat label="Cryptos"    value={g.activeCryptos?.toLocaleString()} />
    </div>
  );
};

export default GlobalStats;
