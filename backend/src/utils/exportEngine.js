/**
 * Export Engine — PDF, CSV, and Gherkin .feature file generation
 */

import PDFDocument from "pdfkit";

/**
 * Generate a PDF buffer from a suite's test artifacts
 */
export async function generatePDF(suite) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        info: {
          Title: suite.title || "Bug-Wise Test Suite",
          Author: "Bug-Wise QA Co-Pilot",
        },
      });

      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      const result = suite.result || {};

      // ── Title Page ──────────────────────────────────────
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("Bug-Wise Test Suite", { align: "center" });

      doc.moveDown(0.5);
      doc
        .fontSize(14)
        .font("Helvetica")
        .fillColor("#666666")
        .text(suite.title || "Untitled Suite", { align: "center" });

      doc.moveDown(0.3);
      doc
        .fontSize(10)
        .text(`Generated: ${new Date(suite.createdAt).toLocaleString()}`, {
          align: "center",
        });
      doc.text(`Input Type: ${suite.inputType}`, { align: "center" });
      doc.text(`Model: ${suite.model}`, { align: "center" });

      doc.moveDown(2);
      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .strokeColor("#cccccc")
        .stroke();
      doc.moveDown(1);

      // ── Test Plan Section ───────────────────────────────
      if (result.testPlan) {
        const tp = result.testPlan;
        doc.fillColor("#000000");
        doc.fontSize(18).font("Helvetica-Bold").text("1. Test Plan");
        doc.moveDown(0.5);

        if (tp.objective) {
          doc.fontSize(11).font("Helvetica-Bold").text("Objective:");
          doc.fontSize(10).font("Helvetica").text(tp.objective);
          doc.moveDown(0.5);
        }

        if (tp.testStrategy) {
          doc.fontSize(11).font("Helvetica-Bold").text("Strategy:");
          doc.fontSize(10).font("Helvetica").text(tp.testStrategy);
          doc.moveDown(0.5);
        }

        if (tp.scope) {
          doc.fontSize(11).font("Helvetica-Bold").text("In Scope:");
          (tp.scope.inScope || []).forEach((item) => {
            doc.fontSize(10).font("Helvetica").text(`  • ${item}`);
          });
          doc.moveDown(0.3);
          doc.fontSize(11).font("Helvetica-Bold").text("Out of Scope:");
          (tp.scope.outOfScope || []).forEach((item) => {
            doc.fontSize(10).font("Helvetica").text(`  • ${item}`);
          });
          doc.moveDown(0.5);
        }

        if (tp.riskAssessment?.length > 0) {
          doc.fontSize(11).font("Helvetica-Bold").text("Risk Assessment:");
          tp.riskAssessment.forEach((r, i) => {
            doc
              .fontSize(10)
              .font("Helvetica")
              .text(
                `  ${i + 1}. ${r.risk} [Likelihood: ${r.likelihood}, Impact: ${r.impact}]`
              );
            doc.text(`     Mitigation: ${r.mitigation}`);
          });
          doc.moveDown(0.5);
        }

        if (tp.estimatedEffort) {
          doc.fontSize(11).font("Helvetica-Bold").text("Estimated Effort:");
          doc.fontSize(10).font("Helvetica").text(`  ${tp.estimatedEffort}`);
        }

        doc.moveDown(1);
      }

      // ── Manual Test Cases Section ───────────────────────
      if (result.manualTestCases?.length > 0) {
        doc.addPage();
        doc
          .fontSize(18)
          .font("Helvetica-Bold")
          .fillColor("#000000")
          .text("2. Manual Test Cases");
        doc.moveDown(0.5);

        result.manualTestCases.forEach((tc, idx) => {
          // Check if we need a new page
          if (doc.y > 680) doc.addPage();

          doc
            .fontSize(12)
            .font("Helvetica-Bold")
            .text(`${tc.id || `TC-${String(idx + 1).padStart(3, "0")}`}: ${tc.title}`);

          doc
            .fontSize(9)
            .font("Helvetica")
            .fillColor("#666666")
            .text(`Priority: ${tc.priority} | Type: ${tc.type}`);

          doc.fillColor("#000000");

          if (tc.preconditions?.length > 0) {
            doc.fontSize(9).font("Helvetica-Bold").text("Preconditions:");
            tc.preconditions.forEach((pre) => {
              doc.fontSize(9).font("Helvetica").text(`  • ${pre}`);
            });
          }

          if (tc.steps?.length > 0) {
            doc.fontSize(9).font("Helvetica-Bold").text("Steps:");
            tc.steps.forEach((s) => {
              doc
                .fontSize(9)
                .font("Helvetica")
                .text(`  ${s.step}. ${s.action}`);
              doc.text(`     → Expected: ${s.expectedResult}`);
            });
          }

          if (tc.testData) {
            doc.fontSize(9).font("Helvetica-Bold").text("Test Data:");
            doc.fontSize(9).font("Helvetica").text(`  ${tc.testData}`);
          }

          doc.moveDown(0.8);
        });
      }

      // ── Gherkin Scripts Section ─────────────────────────
      if (result.gherkinScripts?.length > 0) {
        doc.addPage();
        doc
          .fontSize(18)
          .font("Helvetica-Bold")
          .fillColor("#000000")
          .text("3. Gherkin Automation Scripts");
        doc.moveDown(0.5);

        result.gherkinScripts.forEach((script) => {
          if (doc.y > 650) doc.addPage();

          doc
            .fontSize(11)
            .font("Helvetica-Bold")
            .text(script.feature || script.scenario || "Scenario");

          if (script.tags?.length > 0) {
            doc
              .fontSize(8)
              .font("Helvetica")
              .fillColor("#666666")
              .text(`Tags: ${script.tags.join(", ")}`);
          }

          doc.fillColor("#000000").moveDown(0.3);
          doc.fontSize(9).font("Courier").text(script.gherkin || "");
          doc.moveDown(1);
        });
      }

      // ── Footer ──────────────────────────────────────────
      doc.moveDown(2);
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#999999")
        .text("Generated by Bug-Wise QA Co-Pilot", { align: "center" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate CSV string from manual test cases
 */
export function generateCSV(suite) {
  const cases = suite.result?.manualTestCases || [];

  if (cases.length === 0) {
    return "No test cases to export.";
  }

  const headers = [
    "ID",
    "Title",
    "Priority",
    "Type",
    "Preconditions",
    "Steps",
    "Expected Results",
    "Test Data",
    "Postconditions",
  ];

  const rows = cases.map((tc) => {
    const steps = (tc.steps || [])
      .map((s) => `${s.step}. ${s.action}`)
      .join(" | ");
    const expected = (tc.steps || [])
      .map((s) => `${s.step}. ${s.expectedResult}`)
      .join(" | ");
    const preconditions = (tc.preconditions || []).join("; ");

    return [
      tc.id || "",
      `"${(tc.title || "").replace(/"/g, '""')}"`,
      tc.priority || "",
      tc.type || "",
      `"${preconditions.replace(/"/g, '""')}"`,
      `"${steps.replace(/"/g, '""')}"`,
      `"${expected.replace(/"/g, '""')}"`,
      `"${(tc.testData || "").replace(/"/g, '""')}"`,
      `"${(tc.postconditions || "").replace(/"/g, '""')}"`,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * Generate concatenated .feature file content from Gherkin scripts
 */
export function generateFeatureFile(suite) {
  const scripts = suite.result?.gherkinScripts || [];

  if (scripts.length === 0) {
    return "# No Gherkin scripts to export.";
  }

  const sections = scripts.map((script) => {
    let block = "";
    if (script.tags?.length > 0) {
      block += script.tags.join(" ") + "\n";
    }
    block += script.gherkin || "";
    return block;
  });

  return sections.join("\n\n# ────────────────────────────────────\n\n");
}
