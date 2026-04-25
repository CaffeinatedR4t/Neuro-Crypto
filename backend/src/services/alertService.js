const PriceAlert = require("../models/PriceAlert");

// Track last known prices in memory for comparison
const lastPrices = {};

/**
 * Check for significant price movements and create alerts
 * Triggers when price moves > 2% in one polling cycle
 */
const checkForAlerts = async (coins) => {
  const newAlerts = [];

  for (const coin of coins) {
    const prev = lastPrices[coin.id];

    if (prev) {
      const changePercent = ((coin.priceUsd - prev) / prev) * 100;

      // Spike up > 2%
      if (changePercent >= 2) {
        const alert = await PriceAlert.create({
          coin:          coin.id,
          symbol:        coin.symbol,
          type:          "spike_up",
          message:       `${coin.symbol} surged +${changePercent.toFixed(2)}% to $${coin.priceUsd.toLocaleString()}`,
          changePercent,
          priceAtAlert:  coin.priceUsd,
        });
        newAlerts.push(alert);
      }

      // Spike down > 2%
      if (changePercent <= -2) {
        const alert = await PriceAlert.create({
          coin:          coin.id,
          symbol:        coin.symbol,
          type:          "spike_down",
          message:       `${coin.symbol} dropped ${changePercent.toFixed(2)}% to $${coin.priceUsd.toLocaleString()}`,
          changePercent,
          priceAtAlert:  coin.priceUsd,
        });
        newAlerts.push(alert);
      }
    }

    // Always check 24h change for notable moves
    if (Math.abs(coin.change24h) >= 5 && !prev) {
      const direction = coin.change24h > 0 ? "up" : "down";
      const alert = await PriceAlert.create({
        coin:          coin.id,
        symbol:        coin.symbol,
        type:          coin.change24h > 0 ? "spike_up" : "spike_down",
        message:       `${coin.symbol} is ${direction} ${Math.abs(coin.change24h).toFixed(2)}% in the last 24h`,
        changePercent: coin.change24h,
        priceAtAlert:  coin.priceUsd,
      });
      newAlerts.push(alert);
    }

    // Update last known price
    lastPrices[coin.id] = coin.priceUsd;
  }

  return newAlerts;
};

module.exports = { checkForAlerts };
