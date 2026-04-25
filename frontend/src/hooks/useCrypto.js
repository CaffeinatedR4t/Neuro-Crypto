import { useState, useEffect, useCallback } from "react";
import { fetchPrices, fetchGlobal, fetchAlerts, checkHealth } from "../services/api";

export const useCrypto = () => {
  const [prices,   setPrices]   = useState([]);
  const [global,   setGlobal]   = useState(null);
  const [alerts,   setAlerts]   = useState([]);
  const [status,   setStatus]   = useState("checking");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    try {
      const [priceRes, globalRes, alertRes] = await Promise.all([
        fetchPrices(),
        fetchGlobal(),
        fetchAlerts(),
      ]);
      setPrices(priceRes.data.data);
      setGlobal(globalRes.data.data);
      setAlerts(alertRes.data.data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (e) {
      console.error("Data fetch error:", e.message);
    }
  }, []);

  useEffect(() => {
    checkHealth().then(() => setStatus("online")).catch(() => setStatus("offline"));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Refresh every 30s to match backend worker
  useEffect(() => {
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  return { prices, global, alerts, status, lastUpdate, loading, refresh: load };
};
