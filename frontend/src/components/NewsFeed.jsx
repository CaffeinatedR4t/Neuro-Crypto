import { useState, useEffect } from "react";
import { fetchNews, analyzeSentiment } from "../services/api";

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [sentiments, setSentiments] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadNews = async () => {
      try {
        const res = await fetchNews();
        if (mounted && res.data.success) {
          setNews(res.data.data);
          setLoading(false);
          
          // Asynchronously fetch sentiment for the top 10 headlines
          const topHeadlines = res.data.data.slice(0, 10);
          topHeadlines.forEach(async (article) => {
            try {
              const sentRes = await analyzeSentiment(article.title);
              if (mounted && sentRes.data.success) {
                setSentiments(prev => ({
                  ...prev,
                  [article.id]: sentRes.data.sentiment
                }));
              }
            } catch (err) {
              // Ignore sentiment errors
            }
          });
        }
      } catch (err) {
        setLoading(false);
      }
    };

    loadNews();
    const interval = setInterval(loadNews, 60000); // Poll every minute
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const getSentimentIcon = (sentiment) => {
    if (sentiment === "BULLISH") return "🟢";
    if (sentiment === "BEARISH") return "🔴";
    if (sentiment === "NEUTRAL") return "⚪";
    return "⏳"; // Loading/Pending
  };

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #111", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#f5c518" }}>⚡</span>
          <p style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 600, color: "#4a4a4a", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Real-Time News Feed
          </p>
          <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: "#2a2a2a", letterSpacing: "0.05em" }}>
            Powered by CryptoCompare & Gemini
          </span>
        </div>
      </div>

      {/* Feed List */}
      <div style={{ height: 300, overflowY: "auto", padding: "8px 0" }}>
        {loading ? (
          <div style={{ padding: "16px", textAlign: "center" }}>
            <p className="mono" style={{ fontSize: 10, color: "#2a2a2a" }}>Loading latest news...</p>
          </div>
        ) : news.length === 0 ? (
          <div style={{ padding: "16px", textAlign: "center" }}>
            <p className="mono" style={{ fontSize: 10, color: "#2a2a2a" }}>No news available.</p>
          </div>
        ) : (
          news.map((article) => {
            const sentiment = sentiments[article.id];
            return (
              <div key={article.id} style={{
                padding: "8px 16px", borderBottom: "1px solid #0d0d0d", display: "flex", alignItems: "flex-start", gap: 12,
                cursor: "pointer", transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#111"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              onClick={() => window.open(article.url, "_blank")}
              >
                <div style={{ flexShrink: 0, marginTop: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: 12 }}>{sentiment ? getSentimentIcon(sentiment) : getSentimentIcon(null)}</span>
                  <span className="mono" style={{ fontSize: 8, color: "#4a4a4a", marginTop: 4 }}>
                    {new Date(article.published_on).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, fontWeight: 600, color: "#00aae4", textTransform: "uppercase" }}>
                      {article.source}
                    </span>
                    <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: "#2a2a2a" }}>|</span>
                    <span style={{ fontFamily: "'Space Mono'", fontSize: 9, color: "#888" }}>
                      {article.tags.split("|").slice(0, 3).join(", ")}
                    </span>
                  </div>
                  <p style={{ fontFamily: "'Barlow'", fontSize: 13, color: "#ccc", lineHeight: 1.4, margin: 0, fontWeight: 500 }}>
                    {article.title}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
