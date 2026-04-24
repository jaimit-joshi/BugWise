import jwt from "jsonwebtoken";

// Test JWT token generation and verification logic
describe("Authentication — Token Logic", () => {
  const SECRET = "test-secret-key-for-jest";

  describe("Token Generation", () => {
    test("should generate a valid JWT token", () => {
      const userId = "507f1f77bcf86cd799439011";
      const token = jwt.sign({ userId }, SECRET, { expiresIn: "7d" });
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3);
    });

    test("should include userId in token payload", () => {
      const userId = "507f1f77bcf86cd799439011";
      const token = jwt.sign({ userId }, SECRET, { expiresIn: "7d" });
      const decoded = jwt.verify(token, SECRET);
      expect(decoded.userId).toBe(userId);
    });

    test("should set expiration on token", () => {
      const userId = "507f1f77bcf86cd799439011";
      const token = jwt.sign({ userId }, SECRET, { expiresIn: "1h" });
      const decoded = jwt.verify(token, SECRET);
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe("Token Verification", () => {
    test("should reject token with wrong secret", () => {
      const token = jwt.sign({ userId: "123" }, SECRET);
      expect(() => jwt.verify(token, "wrong-secret")).toThrow();
    });

    test("should reject expired token", () => {
      const token = jwt.sign({ userId: "123" }, SECRET, {
        expiresIn: "-1s",
      });
      expect(() => jwt.verify(token, SECRET)).toThrow("jwt expired");
    });

    test("should reject malformed token", () => {
      expect(() => jwt.verify("not.a.valid.token", SECRET)).toThrow();
    });

    test("should reject empty token", () => {
      expect(() => jwt.verify("", SECRET)).toThrow();
    });
  });

  describe("Input Validation Rules", () => {
    test("email regex should match valid emails", () => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(regex.test("user@example.com")).toBe(true);
      expect(regex.test("a.b@c.co")).toBe(true);
      expect(regex.test("test+label@domain.org")).toBe(true);
    });

    test("email regex should reject invalid emails", () => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(regex.test("notanemail")).toBe(false);
      expect(regex.test("missing@domain")).toBe(false);
      expect(regex.test("@nodomain.com")).toBe(false);
      expect(regex.test("spaces in@email.com")).toBe(false);
    });

    test("password must be at least 8 characters", () => {
      const validate = (pw) => typeof pw === "string" && pw.length >= 8;
      expect(validate("12345678")).toBe(true);
      expect(validate("abcdefghij")).toBe(true);
      expect(validate("short")).toBe(false);
      expect(validate("1234567")).toBe(false);
      expect(validate("")).toBe(false);
    });

    test("name must be 2-50 characters", () => {
      const validate = (n) =>
        typeof n === "string" && n.trim().length >= 2 && n.trim().length <= 50;
      expect(validate("Jo")).toBe(true);
      expect(validate("Jaimit Joshi")).toBe(true);
      expect(validate("A")).toBe(false);
      expect(validate("A".repeat(51))).toBe(false);
    });
  });
});
