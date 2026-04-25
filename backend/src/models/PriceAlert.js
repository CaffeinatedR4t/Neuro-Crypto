const mongoose = require("mongoose");

const priceAlertSchema = new mongoose.Schema(
  {
    coin:    { type: String, required: true },
    symbol:  { type: String, required: true },
    type:    { type: String, enum: ["spike_up", "spike_down", "ath_24h", "atl_24h"], required: true },
    message: { type: String, required: true },
    changePercent: { type: Number, default: 0 },
    priceAtAlert:  { type: Number, required: true },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

priceAlertSchema.index({ createdAt: -1 });

module.exports = mongoose.model("PriceAlert", priceAlertSchema);
