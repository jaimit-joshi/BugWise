import React from "react";
import { Code2, BookOpen, Sparkles, RotateCcw } from "lucide-react";

const INPUT_TYPES = [
  { value: "code", label: "Code Snippet", icon: Code2 },
  { value: "userStory", label: "User Story", icon: BookOpen },
];

const PLACEHOLDER_CODE = `// Paste your code here. Example:
function authenticateUser(email, password) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  const user = db.findUserByEmail(email);
  if (!user) throw new Error("User not found");
  const isMatch = bcrypt.compareSync(password, user.hashedPassword);
  if (!isMatch) throw new Error("Invalid credentials");
  return { token: generateJWT(user.id), user: { id: user.id, email: user.email } };
}`;

const PLACEHOLDER_STORY = `As a registered user,
I want to be able to reset my password via email,
So that I can regain access to my account if I forget my password.

Acceptance Criteria:
- User clicks "Forgot Password" on the login page
- System asks for their registered email address
- System sends a password reset link valid for 15 minutes
- User clicks the link and enters a new password (min 8 chars, 1 uppercase, 1 number)
- System confirms the password change and invalidates old sessions`;

export default function CodeInput({ code, setCode, inputType, setInputType, onGenerate, onReset, loading, hasResults }) {
  const charCount = code.length;
  const isValid = code.trim().length >= 10;
  const placeholder = inputType === "code" ? PLACEHOLDER_CODE : PLACEHOLDER_STORY;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {INPUT_TYPES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setInputType(value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              inputType === value
                ? "bg-accent/10 text-accent border border-accent/30"
                : "bg-surface-800/50 text-surface-400 border border-surface-700 hover:border-surface-500 hover:text-surface-200"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          className="w-full h-72 px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 text-surface-100 font-mono text-sm leading-relaxed placeholder:text-surface-600 focus:outline-none focus:border-accent/50 resize-y min-h-[200px] transition-all duration-200"
        />
        <div className="absolute bottom-3 right-3">
          <span className={`text-xs font-mono ${charCount > 15000 ? "text-danger" : charCount > 12000 ? "text-warn" : "text-surface-500"}`}>
            {charCount.toLocaleString()} / 15,000
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onGenerate(code, inputType)}
          disabled={loading || !isValid}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            loading || !isValid
              ? "bg-surface-700 text-surface-500 cursor-not-allowed"
              : "bg-accent text-surface-950 hover:bg-accent-light shadow-lg shadow-accent/20 hover:shadow-accent/40"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {loading ? "Generating..." : "Generate Test Artifacts"}
        </button>
        {hasResults && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-surface-400 bg-surface-800 border border-surface-700 hover:border-surface-500 hover:text-surface-200 transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
