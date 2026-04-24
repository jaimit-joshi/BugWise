describe("Generate Tests — Input Validation", () => {
  describe("Code input validation", () => {
    test("should reject empty input", () => {
      const validate = (code) =>
        code && typeof code === "string" && code.trim().length >= 10;
      expect(validate("")).toBe(false);
      expect(validate(null)).toBe(false);
      expect(validate(undefined)).toBe(false);
    });

    test("should reject input under 10 characters", () => {
      const validate = (code) =>
        code && typeof code === "string" && code.trim().length >= 10;
      expect(validate("short")).toBe(false);
      expect(validate("123456789")).toBe(false);
      expect(validate("1234567890")).toBe(true);
    });

    test("should reject input over 15000 characters", () => {
      const validate = (code) =>
        code && typeof code === "string" && code.trim().length <= 15000;
      expect(validate("a".repeat(15001))).toBe(false);
      expect(validate("a".repeat(15000))).toBe(true);
    });

    test("should accept valid code snippets", () => {
      const validate = (code) =>
        code &&
        typeof code === "string" &&
        code.trim().length >= 10 &&
        code.trim().length <= 15000;
      expect(validate('function hello() { return "world"; }')).toBe(true);
      expect(
        validate("As a user, I want to log in so that I can access my account")
      ).toBe(true);
    });
  });

  describe("Input type validation", () => {
    test("should accept valid input types", () => {
      const validTypes = ["code", "userStory"];
      expect(validTypes.includes("code")).toBe(true);
      expect(validTypes.includes("userStory")).toBe(true);
    });

    test("should default to 'code' for invalid types", () => {
      const getType = (t) =>
        ["code", "userStory"].includes(t) ? t : "code";
      expect(getType("invalid")).toBe("code");
      expect(getType("")).toBe("code");
      expect(getType(null)).toBe("code");
    });
  });

  describe("Response structure validation", () => {
    test("should validate complete response structure", () => {
      const validResponse = {
        testPlan: { title: "Test Plan", objective: "Test objective" },
        manualTestCases: [
          { id: "TC-001", title: "Test Case 1", priority: "High" },
        ],
        gherkinScripts: [
          { feature: "Login", gherkin: "Feature: Login" },
        ],
        metadata: {
          coverageSummary: { totalTestCases: 1 },
        },
      };

      const hasTestPlan = !!validResponse.testPlan;
      const hasCases =
        Array.isArray(validResponse.manualTestCases) &&
        validResponse.manualTestCases.length > 0;
      const hasGherkin =
        Array.isArray(validResponse.gherkinScripts) &&
        validResponse.gherkinScripts.length > 0;

      expect(hasTestPlan).toBe(true);
      expect(hasCases).toBe(true);
      expect(hasGherkin).toBe(true);
    });

    test("should reject empty response structure", () => {
      const emptyResponse = {};
      const hasTestPlan = !!emptyResponse.testPlan;
      const hasCases =
        Array.isArray(emptyResponse.manualTestCases) &&
        emptyResponse.manualTestCases.length > 0;
      const hasGherkin =
        Array.isArray(emptyResponse.gherkinScripts) &&
        emptyResponse.gherkinScripts.length > 0;

      expect(hasTestPlan || hasCases || hasGherkin).toBe(false);
    });

    test("should handle malformed JSON gracefully", () => {
      const malformedJSON = "{ not valid json }}}";
      let parsed = null;
      let error = null;

      try {
        parsed = JSON.parse(malformedJSON);
      } catch (e) {
        error = e;
      }

      expect(parsed).toBeNull();
      expect(error).not.toBeNull();
    });

    test("should validate test case structure", () => {
      const validateTestCase = (tc) => {
        return (
          tc.id &&
          tc.title &&
          tc.priority &&
          tc.type &&
          Array.isArray(tc.steps) &&
          tc.steps.length > 0 &&
          tc.steps.every((s) => s.step && s.action && s.expectedResult)
        );
      };

      const validTC = {
        id: "TC-001",
        title: "Valid Login",
        priority: "High",
        type: "Positive",
        steps: [
          {
            step: 1,
            action: "Enter email",
            expectedResult: "Email field populated",
          },
        ],
      };

      const invalidTC = {
        id: "TC-002",
        title: "Missing steps",
        priority: "Low",
        type: "Negative",
        steps: [],
      };

      expect(validateTestCase(validTC)).toBe(true);
      expect(validateTestCase(invalidTC)).toBe(false);
    });
  });

  describe("Coverage summary validation", () => {
    test("should count test case types correctly", () => {
      const cases = [
        { type: "Positive" },
        { type: "Negative" },
        { type: "Negative" },
        { type: "Edge Case" },
        { type: "Security" },
        { type: "Boundary" },
      ];

      const counts = cases.reduce((acc, tc) => {
        acc[tc.type] = (acc[tc.type] || 0) + 1;
        return acc;
      }, {});

      expect(counts.Positive).toBe(1);
      expect(counts.Negative).toBe(2);
      expect(counts["Edge Case"]).toBe(1);
      expect(counts.Security).toBe(1);
      expect(counts.Boundary).toBe(1);
    });

    test("should verify 40%+ non-happy-path ratio", () => {
      const cases = [
        { type: "Positive" },
        { type: "Positive" },
        { type: "Negative" },
        { type: "Negative" },
        { type: "Edge Case" },
        { type: "Security" },
        { type: "Boundary" },
        { type: "Positive" },
        { type: "Negative" },
        { type: "Edge Case" },
      ];

      const total = cases.length;
      const nonHappy = cases.filter((c) => c.type !== "Positive").length;
      const ratio = nonHappy / total;

      expect(ratio).toBeGreaterThanOrEqual(0.4);
    });
  });
});
