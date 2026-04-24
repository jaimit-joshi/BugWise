import {
  redactSensitiveData,
  formatRedactionSummary,
} from "../utils/privacyShield.js";

export function privacyShieldMiddleware(req, res, next) {
  try {
    const { code } = req.body;

    if (!code || typeof code !== "string") {
      return next();
    }

    const { sanitized, redactions } = redactSensitiveData(code);

    req.body.code = sanitized;
    req.privacyShield = {
      applied: true,
      redactions,
      summary: formatRedactionSummary(redactions),
      originalLength: code.length,
      sanitizedLength: sanitized.length,
    };

    if (redactions.length > 0) {
      console.log(`[Privacy Shield] ${formatRedactionSummary(redactions)}`);
    }

    next();
  } catch (error) {
    console.error("[Privacy Shield] Error in middleware:", error);
    req.privacyShield = { applied: false, error: error.message };
    next();
  }
}
