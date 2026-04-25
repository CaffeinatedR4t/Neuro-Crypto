/**
 * Global error handler middleware
 * Catches any errors thrown in routes and returns a consistent JSON response
 */
const errorHandler = (err, req, res, next) => {
  console.error("💥 Unhandled Error:", err.stack);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Axios / external API error
  if (err.response) {
    return res.status(err.response.status || 502).json({
      success: false,
      message: "External API Error",
      error: err.response.data?.message || err.message,
    });
  }

  // Default server error
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  });
};

/**
 * 404 handler — catch any route that doesn't exist
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

module.exports = { errorHandler, notFound };
