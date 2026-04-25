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

const AlertFeed = ({ alerts }) => (
  <div className="card" style={{ overflow: "hidden" }}>
    <div style={{ padding: "12px 16px", borderBottom: "1px solid #111", display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff3b5c", boxShadow: "0 0 6px #ff3b5c" }} />
      <p style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 600, color: "#4a4a4a", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        Alerts
      </p>
    </div>

    <div style={{ maxHeight: 280, overflowY: "auto" }}>
      {!alerts.length ? (
        <div style={{ padding: "24px 16px", textAlign: "center" }}>
          <p className="mono" style={{ fontSize: 10, color: "#2a2a2a" }}>No alerts yet</p>
        </div>
      ) : (
        alerts.map((alert, i) => {
          const up    = alert.type === "spike_up";
          const color = COIN_COLORS[alert.coin] || "#e2e2e2";
          return (
            <div key={alert._id} style={{
              padding: "10px 16px",
              borderBottom: i < alerts.length - 1 ? "1px solid #0d0d0d" : "none",
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <div style={{
                width: 2, alignSelf: "stretch", flexShrink: 0,
                background: up ? "#00d26a" : "#ff3b5c",
                borderRadius: 2,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 700, color }}>
                    {alert.symbol}
                  </span>
                  <span className="mono" style={{ fontSize: 10, color: up ? "#00d26a" : "#ff3b5c" }}>
                    {up ? "▲" : "▼"} {Math.abs(alert.changePercent)?.toFixed(2)}%
                  </span>
                </div>
                <p style={{ fontFamily: "'Barlow'", fontSize: 11, color: "#888", lineHeight: 1.4 }}>
                  {alert.message}
                </p>
                <p className="mono" style={{ fontSize: 10, color: "#2a2a2a", marginTop: 3 }}>
                  {new Date(alert.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
);

export default AlertFeed;
