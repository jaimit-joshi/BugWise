import mongoose from "mongoose";

const suiteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "Untitled Suite",
      trim: true,
      maxlength: 200,
    },
    inputCode: {
      type: String,
      required: true,
    },
    inputType: {
      type: String,
      enum: ["code", "userStory"],
      default: "code",
    },
    result: {
      testPlan: { type: mongoose.Schema.Types.Mixed },
      manualTestCases: [{ type: mongoose.Schema.Types.Mixed }],
      gherkinScripts: [{ type: mongoose.Schema.Types.Mixed }],
      metadata: { type: mongoose.Schema.Types.Mixed },
    },
    privacyShield: {
      applied: { type: Boolean, default: false },
      redactions: [
        {
          rule: String,
          count: Number,
        },
      ],
    },
    model: {
      type: String,
      default: "gpt-3.5-turbo",
    },
    processingTimeMs: {
      type: Number,
    },
    tokenUsage: {
      promptTokens: Number,
      completionTokens: Number,
      totalTokens: Number,
    },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

// Text index for search
suiteSchema.index({ title: "text", inputCode: "text" });

// Virtual for test case count
suiteSchema.virtual("testCaseCount").get(function () {
  return this.result?.manualTestCases?.length || 0;
});

suiteSchema.virtual("gherkinCount").get(function () {
  return this.result?.gherkinScripts?.length || 0;
});

suiteSchema.set("toJSON", { virtuals: true });

const Suite = mongoose.model("Suite", suiteSchema);
export default Suite;
