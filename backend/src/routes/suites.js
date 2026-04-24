import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import Suite from "../models/Suite.js";
import {
  generatePDF,
  generateCSV,
  generateFeatureFile,
} from "../utils/exportEngine.js";

const router = Router();

// ── GET /api/suites — List all suites for user ────────────
router.get("/suites", authMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query = { user: req.userId };
    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const [suites, total] = await Promise.all([
      Suite.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .select("-inputCode -result")
        .lean(),
      Suite.countDocuments(query),
    ]);

    const enrichedSuites = suites.map((s) => ({
      ...s,
      testCaseCount: 0,
      gherkinCount: 0,
    }));

    res.status(200).json({
      success: true,
      data: enrichedSuites,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("[Suites] List error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch suites." });
  }
});

// ── GET /api/suites/stats — Dashboard statistics ──────────
router.get("/suites/stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const [totalSuites, suites, recentSuites] = await Promise.all([
      Suite.countDocuments({ user: userId }),
      Suite.find({ user: userId }).select("result processingTimeMs createdAt").lean(),
      Suite.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title createdAt inputType model processingTimeMs result")
        .lean(),
    ]);

    let totalTestCases = 0;
    let totalGherkin = 0;
    let typeCounts = {
      Positive: 0,
      Negative: 0,
      "Edge Case": 0,
      Security: 0,
      Boundary: 0,
      Performance: 0,
    };
    let totalProcessingTime = 0;

    suites.forEach((s) => {
      const cases = s.result?.manualTestCases || [];
      const gherkins = s.result?.gherkinScripts || [];
      totalTestCases += cases.length;
      totalGherkin += gherkins.length;
      totalProcessingTime += s.processingTimeMs || 0;

      cases.forEach((tc) => {
        if (tc.type && typeCounts.hasOwnProperty(tc.type)) {
          typeCounts[tc.type]++;
        }
      });
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyActivity = suites
      .filter((s) => new Date(s.createdAt) >= thirtyDaysAgo)
      .reduce((acc, s) => {
        const day = new Date(s.createdAt).toISOString().split("T")[0];
        const existing = acc.find((d) => d._id === day);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ _id: day, count: 1 });
        }
        return acc;
      }, [])
      .sort((a, b) => a._id.localeCompare(b._id));

    const enrichedRecent = recentSuites.map((s) => ({
      _id: s._id,
      title: s.title,
      createdAt: s.createdAt,
      inputType: s.inputType,
      model: s.model,
      processingTimeMs: s.processingTimeMs,
      testCaseCount: s.result?.manualTestCases?.length || 0,
      gherkinCount: s.result?.gherkinScripts?.length || 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalSuites,
        totalTestCases,
        totalGherkin,
        avgProcessingTime:
          totalSuites > 0
            ? Math.round(totalProcessingTime / totalSuites)
            : 0,
        typeCounts,
        dailyActivity,
        recentSuites: enrichedRecent,
      },
    });
  } catch (error) {
    console.error("[Suites] Stats error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch stats." });
  }
});

// ── GET /api/suites/diff/:id1/:id2 — Compare two suites ──
router.get("/suites/diff/:id1/:id2", authMiddleware, async (req, res) => {
  try {
    const { id1, id2 } = req.params;

    const [suite1, suite2] = await Promise.all([
      Suite.findOne({ _id: id1, user: req.userId }).lean(),
      Suite.findOne({ _id: id2, user: req.userId }).lean(),
    ]);

    if (!suite1 || !suite2) {
      return res.status(404).json({
        success: false,
        error: "One or both suites not found.",
      });
    }

    const cases1 = suite1.result?.manualTestCases || [];
    const cases2 = suite2.result?.manualTestCases || [];
    const titles1 = new Set(cases1.map((tc) => tc.title));
    const titles2 = new Set(cases2.map((tc) => tc.title));

    const addedCases = cases2.filter((tc) => !titles1.has(tc.title));
    const removedCases = cases1.filter((tc) => !titles2.has(tc.title));
    const commonCases = cases2.filter((tc) => titles1.has(tc.title));

    const gherkin1 = suite1.result?.gherkinScripts || [];
    const gherkin2 = suite2.result?.gherkinScripts || [];
    const gFeatures1 = new Set(gherkin1.map((g) => g.feature));
    const gFeatures2 = new Set(gherkin2.map((g) => g.feature));

    const addedGherkin = gherkin2.filter((g) => !gFeatures1.has(g.feature));
    const removedGherkin = gherkin1.filter((g) => !gFeatures2.has(g.feature));

    const risks1 = suite1.result?.testPlan?.riskAssessment || [];
    const risks2 = suite2.result?.testPlan?.riskAssessment || [];

    res.status(200).json({
      success: true,
      data: {
        suite1: {
          id: suite1._id,
          title: suite1.title,
          createdAt: suite1.createdAt,
          testCaseCount: cases1.length,
          gherkinCount: gherkin1.length,
        },
        suite2: {
          id: suite2._id,
          title: suite2.title,
          createdAt: suite2.createdAt,
          testCaseCount: cases2.length,
          gherkinCount: gherkin2.length,
        },
        diff: {
          testCases: {
            added: addedCases,
            removed: removedCases,
            common: commonCases.length,
            totalBefore: cases1.length,
            totalAfter: cases2.length,
          },
          gherkinScripts: {
            added: addedGherkin,
            removed: removedGherkin,
            totalBefore: gherkin1.length,
            totalAfter: gherkin2.length,
          },
          riskAssessment: {
            before: risks1.length,
            after: risks2.length,
          },
        },
      },
    });
  } catch (error) {
    console.error("[Suites] Diff error:", error.message);
    res.status(500).json({ success: false, error: "Failed to compare suites." });
  }
});

// ── GET /api/suites/:id — Get single suite ────────────────
router.get("/suites/:id", authMiddleware, async (req, res) => {
  try {
    const suite = await Suite.findOne({
      _id: req.params.id,
      user: req.userId,
    }).lean();

    if (!suite) {
      return res.status(404).json({
        success: false,
        error: "Suite not found.",
      });
    }

    res.status(200).json({ success: true, data: suite });
  } catch (error) {
    console.error("[Suites] Get error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch suite." });
  }
});

// ── DELETE /api/suites/:id — Delete a suite ───────────────
router.delete("/suites/:id", authMiddleware, async (req, res) => {
  try {
    const suite = await Suite.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!suite) {
      return res.status(404).json({
        success: false,
        error: "Suite not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Suite deleted successfully.",
    });
  } catch (error) {
    console.error("[Suites] Delete error:", error.message);
    res.status(500).json({ success: false, error: "Failed to delete suite." });
  }
});

// ── GET /api/suites/:id/export/:format — Export suite ─────
router.get(
  "/suites/:id/export/:format",
  authMiddleware,
  async (req, res) => {
    try {
      const { format } = req.params;

      if (!["pdf", "csv", "feature"].includes(format)) {
        return res.status(400).json({
          success: false,
          error: "Invalid format. Use: pdf, csv, or feature.",
        });
      }

      const suite = await Suite.findOne({
        _id: req.params.id,
        user: req.userId,
      }).lean();

      if (!suite) {
        return res.status(404).json({
          success: false,
          error: "Suite not found.",
        });
      }

      const safeName = (suite.title || "bugwise-export")
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .substring(0, 50);

      if (format === "pdf") {
        const pdfBuffer = await generatePDF(suite);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${safeName}.pdf"`
        );
        return res.send(pdfBuffer);
      }

      if (format === "csv") {
        const csvContent = generateCSV(suite);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${safeName}.csv"`
        );
        return res.send(csvContent);
      }

      if (format === "feature") {
        const featureContent = generateFeatureFile(suite);
        res.setHeader("Content-Type", "text/plain");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${safeName}.feature"`
        );
        return res.send(featureContent);
      }
    } catch (error) {
      console.error("[Suites] Export error:", error.message);
      res.status(500).json({ success: false, error: "Export failed." });
    }
  }
);

export default router;