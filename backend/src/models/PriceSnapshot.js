const mongoose = require("mongoose");

const priceSnapshotSchema = new mongoose.Schema(
  {
    coin: {
      type: String,
      enum: ["bitcoin", "ethereum", "solana", "binancecoin", "ripple"],
      required: true,
    },
    symbol: { type: String, required: true }, // BTC, ETH, etc.
    priceUsd: { type: Number, required: true },
    change24h: { type: Number, default: 0 },
    marketCap: { type: Number, default: 0 },
    volume24h: { type: Number, default: 0 },
    high24h:   { type: Number, default: 0 },
    low24h:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

priceSnapshotSchema.index({ coin: 1, createdAt: -1 });

module.exports = mongoose.model("PriceSnapshot", priceSnapshotSchema);
