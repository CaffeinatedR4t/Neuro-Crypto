const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <img src="/neuro.svg" alt="Neuro" style={{ width: 26, height: 26, objectFit: "contain" }} />
    <div>
      <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 16, color: "#e2e2e2", letterSpacing: "0.05em" }}>
        NEURO
      </span>
      <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: "#2a2a2a", letterSpacing: "0.1em", marginLeft: 8 }}>
        CRYPTO
      </span>
    </div>
  </div>
);

export default Logo;
