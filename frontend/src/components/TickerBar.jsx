const fmt = (n) => n?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtChange = (n) => `${n >= 0 ? "+" : ""}${n?.toFixed(2)}%`;

const TickerItem = ({ coin }) => {
  const up = coin.change24h >= 0;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "0 28px", borderRight: "1px solid #1c1c1c",
      whiteSpace: "nowrap",
    }}>
      <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 600, color: "#4a4a4a", letterSpacing: "0.05em" }}>
        {coin.symbol}
      </span>
      <span className="mono" style={{ fontSize: 12, color: "#e2e2e2" }}>
        ${fmt(coin.priceUsd)}
      </span>
      <span className="mono" style={{ fontSize: 11, color: up ? "#00d26a" : "#ff3b5c" }}>
        {fmtChange(coin.change24h)}
      </span>
    </div>
  );
};

const TickerBar = ({ prices }) => {
  if (!prices.length) return null;
  const doubled = [...prices, ...prices]; // duplicate for seamless loop

  return (
    <div style={{
      borderBottom: "1px solid #1c1c1c",
      overflow: "hidden",
      background: "#050505",
      height: 36,
      display: "flex",
      alignItems: "center",
    }}>
      <div className="ticker-track">
        {doubled.map((coin, i) => (
          <TickerItem key={`${coin.id}-${i}`} coin={coin} />
        ))}
      </div>
    </div>
  );
};

export default TickerBar;
