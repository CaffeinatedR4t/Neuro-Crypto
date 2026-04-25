/**
 * IntegrateIQ - AWS Lambda Processor
 *
 * This function is triggered by the Express backend when a webhook arrives.
 * It transforms/enriches the payload and returns a processed result.
 *
 * Deploy this in AWS Lambda:
 * 1. Go to AWS Console → Lambda → Create Function
 * 2. Runtime: Node.js 20.x
 * 3. Paste this code
 * 4. Enable Function URL (Auth: NONE for dev)
 * 5. Copy the Function URL into your .env as LAMBDA_FUNCTION_URL
 */

exports.handler = async (event) => {
  console.log("📨 Lambda received event:", JSON.stringify(event, null, 2));

  try {
    // Parse the incoming body (Function URL wraps it differently than API Gateway)
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event;

    const { traceId, source, payload } = body;

    // ── Process the payload ────────────────────────────────────────────────
    const processed = transformPayload(source, payload);

    const result = {
      traceId,
      source,
      processedAt: new Date().toISOString(),
      originalPayload: payload,
      processedPayload: processed,
      lambdaVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION || "local",
    };

    console.log("✅ Lambda processed successfully:", result);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("❌ Lambda error:", error);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

/**
 * Transform/enrich payload based on source
 * This is where you'd add business logic — normalize fields, route events, etc.
 */
function transformPayload(source, payload) {
  const base = {
    normalizedAt: new Date().toISOString(),
    source,
  };

  switch (source) {
    case "webhook":
      return {
        ...base,
        eventType: payload?.event || "unknown",
        hasData: !!payload?.data,
        dataKeys: payload?.data ? Object.keys(payload.data) : [],
        severity: determineSeverity(payload?.event),
      };

    default:
      return {
        ...base,
        raw: payload,
        note: "No specific transformer for this source",
      };
  }
}

/**
 * Simple severity classifier based on event name
 */
function determineSeverity(eventName = "") {
  if (eventName.includes("error") || eventName.includes("fail")) return "high";
  if (eventName.includes("warn") || eventName.includes("delete")) return "medium";
  return "low";
}
