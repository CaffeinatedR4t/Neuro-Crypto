require("dotenv").config();
const express    = require("express");
const cors       = require("cors");
const morgan     = require("morgan");
const connectDB  = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const cryptoRoutes = require("./routes/cryptoRoutes");
const { startWorker } = require("./workers/priceWorker");

// ── Connect DB ────────────────────────────────────────────────────────────────
connectDB();

// ── App ───────────────────────────────────────────────────────────────────────
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status:      "ok",
    message:     "Neuro Crypto API is running",
    timestamp:   new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/crypto", cryptoRoutes);

// ── 404 + Error ───────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║       Neuro Crypto API Running       ║
  ║   http://localhost:${PORT}             ║
  ╚══════════════════════════════════════╝
  `);

  // Start background price polling
  startWorker();
});

module.exports = app;
