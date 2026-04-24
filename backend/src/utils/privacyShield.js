/**
 * Privacy Shield — Sensitive Data Redaction Engine
 */

const REDACTION_RULES = [
  {
    name: "OpenAI API Key",
    pattern: /sk-[A-Za-z0-9_-]{20,}/g,
    replacement: "[REDACTED_OPENAI_KEY]",
  },
  {
    name: "OpenAI Project Key",
    pattern: /sk-proj-[A-Za-z0-9_-]{20,}/g,
    replacement: "[REDACTED_OPENAI_PROJECT_KEY]",
  },
  {
    name: "AWS Access Key ID",
    pattern: /AKIA[0-9A-Z]{16}/g,
    replacement: "[REDACTED_AWS_ACCESS_KEY]",
  },
  {
    name: "AWS Secret Access Key",
    pattern: /(?<=aws_secret_access_key\s*[=:]\s*)[A-Za-z0-9/+=]{40}/g,
    replacement: "[REDACTED_AWS_SECRET_KEY]",
  },
  {
    name: "Generic Secret Key",
    pattern: /(?:secret|SECRET|Secret)[_\s]*(?:key|KEY|Key)?[=:\s]+["']?([A-Za-z0-9/+=]{40})["']?/g,
    replacement: "[REDACTED_SECRET_KEY]",
  },
  {
    name: "GitHub Token (classic)",
    pattern: /ghp_[A-Za-z0-9]{36,}/g,
    replacement: "[REDACTED_GITHUB_TOKEN]",
  },
  {
    name: "GitHub Token (fine-grained)",
    pattern: /github_pat_[A-Za-z0-9_]{22,}/g,
    replacement: "[REDACTED_GITHUB_PAT]",
  },
  {
    name: "Stripe Secret Key",
    pattern: /sk_live_[A-Za-z0-9]{24,}/g,
    replacement: "[REDACTED_STRIPE_KEY]",
  },
  {
    name: "Stripe Publishable Key",
    pattern: /pk_live_[A-Za-z0-9]{24,}/g,
    replacement: "[REDACTED_STRIPE_PK]",
  },
  {
    name: "Slack Bot/User Token",
    pattern: /xox[bpras]-[A-Za-z0-9-]{10,}/g,
    replacement: "[REDACTED_SLACK_TOKEN]",
  },
  {
    name: "Generic Bearer Token",
    pattern: /Bearer\s+[A-Za-z0-9._~+/=-]{20,}/g,
    replacement: "Bearer [REDACTED_TOKEN]",
  },
  {
    name: "Generic API Key in assignment",
    pattern: /(?:api[_-]?key|apikey|API_KEY)\s*[=:]\s*["']?[A-Za-z0-9_-]{16,}["']?/gi,
    replacement: "API_KEY=[REDACTED_API_KEY]",
  },
  {
    name: "MongoDB URI",
    pattern: /mongodb(?:\+srv)?:\/\/[^\s"'`,;}{)(\]]+/g,
    replacement: "[REDACTED_MONGODB_URI]",
  },
  {
    name: "PostgreSQL URI",
    pattern: /postgres(?:ql)?:\/\/[^\s"'`,;}{)(\]]+/g,
    replacement: "[REDACTED_POSTGRES_URI]",
  },
  {
    name: "MySQL URI",
    pattern: /mysql:\/\/[^\s"'`,;}{)(\]]+/g,
    replacement: "[REDACTED_MYSQL_URI]",
  },
  {
    name: "Redis URI",
    pattern: /redis(?:s)?:\/\/[^\s"'`,;}{)(\]]+/g,
    replacement: "[REDACTED_REDIS_URI]",
  },
  {
    name: "Password in assignment",
    pattern: /(?:password|passwd|pass|pwd)\s*[=:]\s*["']([^"'\s]{3,})["']/gi,
    replacement: 'password="[REDACTED_PASSWORD]"',
  },
  {
    name: "Password in config/env",
    pattern: /(?:DB_PASSWORD|DATABASE_PASSWORD|MYSQL_PASSWORD|POSTGRES_PASSWORD|REDIS_PASSWORD)\s*=\s*\S+/gi,
    replacement: "DB_PASSWORD=[REDACTED_PASSWORD]",
  },
  {
    name: "Email Address",
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    replacement: "[REDACTED_EMAIL]",
  },
  {
    name: "US Social Security Number",
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    replacement: "[REDACTED_SSN]",
  },
  {
    name: "US Phone Number",
    pattern: /(?:\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    replacement: "[REDACTED_PHONE]",
  },
  {
    name: "Credit Card Number",
    pattern: /\b(?:4\d{3}|5[1-5]\d{2}|3[47]\d{2}|6011)[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    replacement: "[REDACTED_CREDIT_CARD]",
  },
  {
    name: "IPv4 Address",
    pattern: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
    replacement: "[REDACTED_IP]",
  },
  {
    name: "JWT Token",
    pattern: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
    replacement: "[REDACTED_JWT]",
  },
  {
    name: "Private Key Block",
    pattern: /-----BEGIN\s(?:RSA\s)?(?:EC\s)?(?:DSA\s)?PRIVATE KEY-----[\s\S]*?-----END\s(?:RSA\s)?(?:EC\s)?(?:DSA\s)?PRIVATE KEY-----/g,
    replacement: "[REDACTED_PRIVATE_KEY]",
  },
];

export function redactSensitiveData(text) {
  if (!text || typeof text !== "string") {
    return { sanitized: text || "", redactions: [] };
  }

  let sanitized = text;
  const redactions = [];

  for (const rule of REDACTION_RULES) {
    const matches = sanitized.match(rule.pattern);
    if (matches && matches.length > 0) {
      redactions.push({ rule: rule.name, count: matches.length });
      sanitized = sanitized.replace(rule.pattern, rule.replacement);
    }
  }

  return { sanitized, redactions };
}

export function formatRedactionSummary(redactions) {
  if (!redactions.length) return "No sensitive data detected.";
  const lines = redactions.map(
    (r) => `  • ${r.rule}: ${r.count} instance(s) redacted`
  );
  return `Privacy Shield caught ${redactions.length} pattern type(s):\n${lines.join("\n")}`;
}

// Export rules for testing
export { REDACTION_RULES };
