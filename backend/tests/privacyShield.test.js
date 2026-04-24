import { redactSensitiveData, formatRedactionSummary } from "../src/utils/privacyShield.js";

describe("Privacy Shield — Redaction Engine", () => {
  describe("OpenAI API Keys", () => {
    test("should redact standard OpenAI keys", () => {
      const input = 'const key = "sk-abc123def456ghi789jklmnopqrst";';
      const { sanitized, redactions } = redactSensitiveData(input);
      expect(sanitized).toContain("[REDACTED_OPENAI_KEY]");
      expect(sanitized).not.toContain("sk-abc123");
      expect(redactions.length).toBeGreaterThan(0);
    });

    test("should redact project-scoped OpenAI keys", () => {
      const input = "sk-proj-abcdefghijklmnopqrstuvwxyz1234567890";
      const { sanitized } = redactSensitiveData(input);
      expect(sanitized).toContain("[REDACTED");
      expect(sanitized).not.toContain("sk-proj-abc");
    });
  });

  describe("AWS Credentials", () => {
    test("should redact AWS Access Key IDs", () => {
      const input = "AKIAIOSFODNN7EXAMPLE";
      const { sanitized, redactions } = redactSensitiveData(input);
      expect(sanitized).toContain("[REDACTED_AWS_ACCESS_KEY]");
      expect(redactions.some((r) => r.rule === "AWS Access Key ID")).toBe(true);
    });
  });

  describe("GitHub Tokens", () => {
    test("should redact classic GitHub tokens", () => {
      const input = "ghp_FAKEFAKEFAKEFAKEFAKEFAKEFAKEFAKEFAKE12";
      const { sanitized } = redactSensitiveData(input);
      expect(sanitized).toContain("[REDACTED_GITHUB_TOKEN]");
    });

    test("should redact fine-grained GitHub tokens", () => {
      const input = "github_pat_abcdefg1234567890_hijklmnopq";
      const { sanitized } = redactSensitiveData(input);
      expect(sanitized).toContain("[REDACTED_GITHUB_PAT]");
    });
  });

  describe("Stripe Keys", () => {
    test("should redact Stripe secret keys", () => {
      const input = "sk_live_TESTDUMMYKEY1234567890ab";
      const { sanitized } = redactSensitiveData(input);
      expect(sanitized).toContain("[REDACTED_STRIPE_KEY]");
    });
  });

  describe("Database URIs", () => {
    test("should redact MongoDB URIs", () => {
      const input = 'const uri = "mongodb+srv://admin:pass123@cluster.mongodb.net/mydb";';
      const { sanitized } = redactSensitiveData(input);
      expect(sanitized).toContain("[REDACTED_MONGODB_URI]");
      expect(sanitized).not.toContain("admin:pass123");
    });

    test("should redact PostgreSQL URIs", () => {
      const input = "postgresql://user:secret@localhost:5432/mydb";
      const { sanitized } = redactSensitiveData(input);
      expect(sanitized).toContain("[REDACTED_POSTGRES_URI]");
    });

    test("should redact MySQL URIs", () => {
      const input = "mysql://root:password@localhost:3306/app";
      const { sanitized } = redactSensitiveData(input);
      expect(sanitized).toContain("[REDACTED_MYSQL_URI]");
    });

    test("should redact Redis URIs", () => {
      const input = "redis://user:pass@redis.host:6379";
      const { sanitized } = redactSensitiveData(input);
      expect(sanitized).toContain("[REDACTED_REDIS_URI]");
    });
  });

  describe("Passwords", () => {
    test("should redact hardcoded password assignments", () => {
      const input = 'password = "SuperSecret123!"';
      const { sanitized } = redactSensitiveData(input);
      expect(sanitized).toContain("[REDACTED_PASSWORD]");
      expect(sanitized).not.toContain("SuperSecret123");
    });

    test("should redact DB_PASSWORD env vars", () => {
      const input = "DB_PASSWORD=my_database_password_123";
      const { sanitized } = redactSensitiveData(input);
      expect(sanitized).toContain("[REDACTED_PASSWORD]");
    });
  });

  describe("PII — Personal Identifiable Information", () => {
    test("should redact email addresses", () => {
      const input = 'const email = "john.doe@company.com";';
      const { sanitized } = redactSensitiveData(input);
      expect(sanitized).toContain("[REDACTED_EMAIL]");
      expect(sanitized).not.toContain("john.doe@company.com");
    });

    test("should redact US Social Security Numbers", () => {
      const input = "SSN: 123-45-6789";
      const { sanitized } = redactSensitiveData(input);
      expect(sanitized).toContain("[REDACTED_SSN]");
    });

    test("should redact credit card numbers", () => {
      const input = "card: 4111-1111-1111-1111";
      const { sanitized } = redactSensitiveData(input);
      expect(sanitized).toContain("[REDACTED_CREDIT_CARD]");
    });

    test("should redact IPv4 addresses", () => {
      const input = "server: 192.168.1.100";
      const { sanitized } = redactSensitiveData(input);
      expect(sanitized).toContain("[REDACTED_IP]");
    });
  });

  describe("Tokens", () => {
    test("should redact JWT tokens", () => {
      const input =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";
      const { sanitized } = redactSensitiveData(input);
      expect(sanitized).toContain("[REDACTED_JWT]");
    });

    test("should redact Bearer tokens", () => {
      const input = "Authorization: Bearer abc123def456ghi789jklmnopqrstuvwxyz";
      const { sanitized } = redactSensitiveData(input);
      expect(sanitized).toContain("[REDACTED_TOKEN]");
    });
  });

  describe("Private Keys", () => {
    test("should redact RSA private key blocks", () => {
      const input = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA0Z3VS5JJcds3xfn/ygWyF8PbnGy5AoD
-----END RSA PRIVATE KEY-----`;
      const { sanitized } = redactSensitiveData(input);
      expect(sanitized).toContain("[REDACTED_PRIVATE_KEY]");
    });
  });

  describe("Multiple patterns", () => {
    test("should redact multiple types in same input", () => {
      const input = `
        const apiKey = "sk-abcdefghijklmnopqrstuvwx12345";
        const db = "mongodb://admin:pass@host/db";
        const email = "test@example.com";
      `;
      const { sanitized, redactions } = redactSensitiveData(input);
      expect(redactions.length).toBeGreaterThanOrEqual(3);
      expect(sanitized).not.toContain("sk-abc");
      expect(sanitized).not.toContain("admin:pass");
      expect(sanitized).not.toContain("test@example.com");
    });
  });

  describe("Edge cases", () => {
    test("should handle null input", () => {
      const { sanitized, redactions } = redactSensitiveData(null);
      expect(sanitized).toBe("");
      expect(redactions).toEqual([]);
    });

    test("should handle empty string", () => {
      const { sanitized, redactions } = redactSensitiveData("");
      expect(sanitized).toBe("");
      expect(redactions).toEqual([]);
    });

    test("should not modify clean code", () => {
      const input = 'function add(a, b) { return a + b; }';
      const { sanitized, redactions } = redactSensitiveData(input);
      expect(sanitized).toBe(input);
      expect(redactions).toEqual([]);
    });
  });

  describe("formatRedactionSummary", () => {
    test("should return no-data message for empty redactions", () => {
      const summary = formatRedactionSummary([]);
      expect(summary).toBe("No sensitive data detected.");
    });

    test("should format redaction summary correctly", () => {
      const redactions = [
        { rule: "OpenAI API Key", count: 1 },
        { rule: "Email Address", count: 3 },
      ];
      const summary = formatRedactionSummary(redactions);
      expect(summary).toContain("2 pattern type(s)");
      expect(summary).toContain("OpenAI API Key");
      expect(summary).toContain("3 instance(s)");
    });
  });
});
