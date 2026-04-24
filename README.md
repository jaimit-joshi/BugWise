# 🐛 Bug-Wise — AI-Powered QA Co-Pilot for Enterprise Teams

> Analyze code. Generate tests. Track coverage. Ship with confidence.

Bug-Wise is a full-stack intelligent QA platform that combines AI-powered test generation with suite management, version tracking, and team collaboration. Engineers paste code or user stories and receive structured **Test Plans**, **Manual Test Cases**, and **Gherkin Automation Scripts** — then save, compare, export, and iterate on them over time.

Built with a privacy-first architecture where sensitive data is redacted before it ever leaves the server, and a stateful backend that lets teams build a living test knowledge base across sprints.

---

## ✨ Feature Overview

### 🤖 AI Test Generation Engine
The core generation pipeline accepts raw code snippets or user stories and produces three structured artifacts through a configurable LLM provider: a detailed Test Plan with risk assessment, 8–12 Manual Test Cases with strong emphasis on negative/edge/boundary/security scenarios (40%+ non-happy-path), and BDD-ready Gherkin automation scripts with proper Feature/Scenario/Given/When/Then syntax. Supports both Groq (free) and OpenAI as backend providers via a single environment variable swap.

### 🛡️ Privacy Shield (Pre-Processing Layer)
Every input passes through a Regex-powered redaction engine **before** reaching the AI. The engine scans for 20+ sensitive patterns including API keys (OpenAI, AWS, Stripe, GitHub, Slack), database connection URIs (MongoDB, PostgreSQL, MySQL, Redis), hardcoded passwords, PII (emails, SSNs, phone numbers, credit cards), JWT tokens, Bearer tokens, and private key blocks. All matches are replaced with descriptive [REDACTED_*] tokens so code structure is preserved without exposing secrets.

### 🔐 User Authentication
JWT-based authentication with bcrypt password hashing, secure session management, and protected routes. Users sign up, log in, and have their test generation history tied to their account. Tokens are issued on login and validated via middleware on every protected request.

### 📚 Test Suite History and Dashboard
Every generation is persisted to MongoDB with full metadata — input code, generated artifacts, model used, processing time, privacy shield results, and timestamps. Users can browse their history, search by keyword, filter by date range, and revisit any past generation. The dashboard surfaces usage stats including total suites generated, test case type distribution, and generation trends over time.

### 🔀 Version Diff Comparison
When users regenerate tests for updated code, Bug-Wise stores both versions and provides a side-by-side diff view highlighting what changed between test suites — new test cases added, removed scenarios, updated steps, and modified risk assessments. This is critical for regression tracking across code iterations.

### 📤 Multi-Format Export
Generated test artifacts can be exported in multiple formats for integration with existing QA workflows:
- **PDF** — Formatted test plan and manual cases for stakeholder review
- **CSV** — Tabular test case data for import into Jira, TestRail, or spreadsheets
- **.feature files** — Gherkin scripts ready to drop into Cucumber, Behave, or SpecFlow projects

### 🧪 Self-Testing (Jest Test Suite)
The project includes its own unit and integration tests — because a test generation tool with zero tests would be ironic. Jest covers the Privacy Shield regex patterns (validating detection and redaction across all 20+ pattern types), API input validation, authentication middleware, and response structure validation.

### 🐳 Dockerized Deployment
Full Docker Compose setup with three containers: React frontend (Nginx), Express backend (Node), and MongoDB. One command spins up the entire stack for development, demo, or deployment.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 (Vite), Tailwind CSS, Axios, Lucide React, React Router, React Markdown |
| **Backend** | Node.js, Express.js, Mongoose ODM, JSON Web Tokens, bcrypt |
| **Database** | MongoDB (document store for users, test suites, generation history) |
| **AI Integration** | OpenAI-compatible SDK, Groq (Llama 3.3 70B) or OpenAI (GPT-4o-mini), structured JSON output mode |
| **Privacy** | Custom Regex redaction engine — 20+ patterns, zero external dependencies |
| **Testing** | Jest, Supertest (API integration tests) |
| **DevOps** | Docker, Docker Compose, Nginx, dotenv environment management |

---

## 🏗️ Architecture

    ┌─────────────────────────────────────────────────────────┐
    │                    React Frontend                       │
    │   Login/Signup → Dashboard → Generator → History → Diff │
    └─────────────────────────┬───────────────────────────────┘
                              │ Axios (JWT in headers)
                              ↓
    ┌─────────────────────────────────────────────────────────┐
    │                   Express Backend                        │
    │                                                          │
    │  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
    │  │ Auth      │  │ Privacy      │  │ Generation        │  │
    │  │ Middleware │→ │ Shield       │→ │ Route             │  │
    │  │ (JWT)     │  │ (Redaction)  │  │ (LLM API Call)    │  │
    │  └──────────┘  └──────────────┘  └────────┬──────────┘  │
    │                                            │             │
    │  ┌──────────────────────────────────────────┘            │
    │  │                                                       │
    │  ↓                                                       │
    │  ┌────────────────┐  ┌─────────────┐  ┌──────────────┐  │
    │  │ Suite Storage   │  │ User CRUD   │  │ Export Engine │  │
    │  │ (Save/Retrieve) │  │ (Auth/Prefs) │  │ (PDF/CSV)    │  │
    │  └───────┬────────┘  └──────┬──────┘  └──────────────┘  │
    └──────────┼──────────────────┼────────────────────────────┘
               │                  │
               ↓                  ↓
    ┌─────────────────────────────────────────────────────────┐
    │                     MongoDB                              │
    │   users collection │ suites collection │ sessions        │
    └─────────────────────────────────────────────────────────┘

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB (local install or MongoDB Atlas free tier)
- A Groq API key (free) — get one at https://console.groq.com or an OpenAI API key (paid) from https://platform.openai.com/api-keys
- Docker and Docker Compose (optional, for containerized setup)

### Option A — Run with Docker (Recommended)

    cp backend/.env.example backend/.env
    # Edit backend/.env and add your API key, MONGO_URI, and JWT_SECRET

    docker-compose up --build

Frontend runs at http://localhost:3000, backend at http://localhost:5001, MongoDB at port 27017.

### Option B — Run Locally

**Step 1 — Start MongoDB**

If using a local MongoDB install:

    mongod --dbpath /path/to/your/data

Or use a free MongoDB Atlas cluster and grab the connection string.

**Step 2 — Start the Backend**

    cd backend
    cp .env.example .env

Edit the .env file with your credentials:

    OPENAI_API_KEY=gsk_your-groq-key-here
    OPENAI_BASE_URL=https://api.groq.com/openai/v1
    OPENAI_MODEL=llama-3.3-70b-versatile
    MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/bugwise
    JWT_SECRET=your-secret-key-here
    PORT=5001

Install and run:

    npm install
    npm run dev

Backend starts at http://localhost:5001

**Step 3 — Start the Frontend**

    cd frontend
    npm install
    npm run dev

Frontend starts at http://localhost:5173

**Step 4 — Run Tests**

    cd backend
    npm test

---

## 🔄 Supported AI Providers

Bug-Wise uses the OpenAI SDK with a configurable base URL, allowing you to swap between providers with zero code changes. Just update three lines in your .env file.

| Provider | Cost | .env Configuration |
|----------|------|-------------------|
| **Groq (Default)** | Free | OPENAI_API_KEY=gsk_... / OPENAI_BASE_URL=https://api.groq.com/openai/v1 / OPENAI_MODEL=llama-3.3-70b-versatile |
| **OpenAI** | Paid | OPENAI_API_KEY=sk-... / (remove OPENAI_BASE_URL) / OPENAI_MODEL=gpt-4o-mini |

---

## 🔒 Privacy Shield — Detection Patterns

| Category | Patterns Detected |
|----------|------------------|
| API Keys | OpenAI (sk-...), Stripe (sk_live_..., pk_live_...), GitHub (ghp_..., github_pat_...), Slack (xox...) |
| Cloud Credentials | AWS Access Key ID (AKIA...), AWS Secret Access Keys |
| Database URIs | MongoDB, PostgreSQL, MySQL, Redis connection strings with credentials |
| Passwords | Hardcoded password/passwd/pwd assignments, DB_PASSWORD env vars |
| Personal Data | Email addresses, US Social Security Numbers, phone numbers, credit card numbers (Visa/MC/Amex/Discover) |
| Tokens | JWT tokens (eyJ...), Bearer tokens, generic API key assignments |
| Certificates | RSA, EC, and DSA private key PEM blocks |
| Network | IPv4 addresses |

All matches are replaced with descriptive tokens like [REDACTED_OPENAI_KEY] or [REDACTED_EMAIL] so the AI model understands what type of data was present without seeing the actual values.

---

## ⚙️ Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| OPENAI_API_KEY | Yes | — | API key for your AI provider (Groq or OpenAI) |
| OPENAI_BASE_URL | No | — | Base URL for the AI provider (set to https://api.groq.com/openai/v1 for Groq, leave empty for OpenAI) |
| OPENAI_MODEL | No | llama-3.3-70b-versatile | Model to use (llama-3.3-70b-versatile for Groq, gpt-4o-mini for OpenAI) |
| MONGO_URI | Yes | — | MongoDB connection string |
| JWT_SECRET | Yes | — | Secret key for signing JSON Web Tokens |
| PORT | No | 5001 | Backend server port |
| JWT_EXPIRES_IN | No | 7d | JWT token expiration duration |
| NODE_ENV | No | development | Runtime environment |

---

## 📌 API Reference

### Authentication

**POST /api/auth/signup** — Create a new account

**POST /api/auth/login** — Login and receive JWT token

**GET /api/auth/me** — Get current user profile (protected)

### Test Generation

**POST /api/generate-tests** — Generate test artifacts from code or user story (protected)

Request body accepts "code" (the input text) and "inputType" (either "code" or "userStory"). Returns structured JSON with testPlan, manualTestCases, gherkinScripts, metadata, and privacyShield results.

### Suite Management

**GET /api/suites** — List all saved test suites for the authenticated user (protected)

**GET /api/suites/:id** — Get a specific suite by ID (protected)

**DELETE /api/suites/:id** — Delete a suite (protected)

**GET /api/suites/:id/export/:format** — Export a suite as PDF, CSV, or .feature file (protected)

### Diff Comparison

**GET /api/suites/diff/:id1/:id2** — Compare two test suites side by side (protected)

### Health

**GET /api/health** — Server health check and uptime

---

## 🧠 Design Decisions

**Why MongoDB over SQL?** Test artifacts are deeply nested JSON documents (arrays of test cases with sub-arrays of steps, metadata objects, tags). MongoDB's document model maps naturally to this structure without requiring complex joins or ORMs.

**Why regex over ML for redaction?** Deterministic behavior matters for security. Regex gives zero false negatives on well-known credential formats, runs in sub-millisecond time, requires no external API calls, and is fully auditable. Every pattern is transparent and testable.

**Why structured JSON output?** Using response_format: { type: "json_object" } eliminates the most common failure mode with LLM integrations — malformed output. Combined with a highly specific system prompt, this guarantees parseable, structured responses every time.

**Why provider-agnostic architecture?** The AI client uses a lazy initialization pattern with a configurable base URL via the OpenAI-compatible SDK. Swapping between Groq (free, Llama 3.3 70B) and OpenAI (paid, GPT-4o-mini) requires zero code changes — just three environment variables. This makes the project accessible to developers without paid API access.

**Why 40%+ edge/negative case emphasis?** Most AI-generated tests are happy-path only. The system prompt specifically instructs the model to prioritize negative, boundary, edge, and security scenarios — the test categories that catch real production bugs but get skipped under time pressure.

**Why JWT over sessions?** Stateless authentication scales cleanly, works naturally with the React SPA architecture, and avoids server-side session storage. Tokens are short-lived and validated on every protected request.

---

## 📁 Project Structure

    bug-wise/
    │
    ├── backend/
    │   ├── src/
    │   │   ├── server.js
    │   │   ├── config/
    │   │   │   └── db.js
    │   │   ├── models/
    │   │   │   ├── User.js
    │   │   │   └── Suite.js
    │   │   ├── routes/
    │   │   │   ├── auth.js
    │   │   │   ├── generateTests.js
    │   │   │   ├── suites.js
    │   │   │   └── health.js
    │   │   ├── middleware/
    │   │   │   ├── authMiddleware.js
    │   │   │   └── privacyShield.js
    │   │   ├── utils/
    │   │   │   ├── privacyShield.js
    │   │   │   └── exportEngine.js
    │   │   └── prompts/
    │   │       └── qaSystemPrompt.js
    │   ├── tests/
    │   │   ├── privacyShield.test.js
    │   │   ├── auth.test.js
    │   │   └── generateTests.test.js
    │   ├── .env.example
    │   ├── Dockerfile
    │   └── package.json
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── App.jsx
    │   │   ├── main.jsx
    │   │   ├── index.css
    │   │   ├── pages/
    │   │   │   ├── LoginPage.jsx
    │   │   │   ├── SignupPage.jsx
    │   │   │   ├── DashboardPage.jsx
    │   │   │   ├── GeneratorPage.jsx
    │   │   │   ├── HistoryPage.jsx
    │   │   │   └── DiffPage.jsx
    │   │   ├── components/
    │   │   │   ├── Header.jsx
    │   │   │   ├── PrivacyToggle.jsx
    │   │   │   ├── CodeInput.jsx
    │   │   │   ├── LoadingState.jsx
    │   │   │   ├── ErrorDisplay.jsx
    │   │   │   ├── ResultsPanel.jsx
    │   │   │   ├── PrivacyBanner.jsx
    │   │   │   ├── SuiteCard.jsx
    │   │   │   ├── DiffViewer.jsx
    │   │   │   ├── ExportMenu.jsx
    │   │   │   └── StatsOverview.jsx
    │   │   ├── hooks/
    │   │   │   ├── useGenerateTests.js
    │   │   │   ├── useAuth.js
    │   │   │   └── useSuites.js
    │   │   └── context/
    │   │       └── AuthContext.jsx
    │   ├── index.html
    │   ├── Dockerfile
    │   └── package.json
    │
    ├── docker-compose.yml
    ├── nginx.conf
    └── README.md

---

## 🗓️ Development Timeline

| Sprint | Focus Area | Deliverables |
|--------|-----------|-------------|
| **Week 1** | Foundation and AI Integration | Project setup, Express API, LLM integration with provider-agnostic architecture, system prompt engineering, Privacy Shield regex engine, basic React UI with code input and tabbed results |
| **Week 2** | Database and Authentication | MongoDB schema design (User, Suite models), Mongoose ODM integration, JWT auth flow, signup/login pages, protected routes, session management |
| **Week 3** | Suite Management and Export | CRUD operations for saved suites, history page with search/filter, PDF/CSV/.feature export engine, dashboard with usage statistics, version diff comparison |
| **Week 4** | Testing, Polish, and Deployment | Jest unit tests for Privacy Shield and API validation, integration tests with Supertest, Docker containerization, UI refinements, responsive design pass, documentation |

---

## 🤝 Future Enhancements

- Team workspaces with role-based access control
- Webhook integration for CI/CD pipelines (auto-generate tests on PR)
- Support for additional LLM providers (Anthropic Claude, Google Gemini)
- Test case prioritization using historical defect data
- Integration with Jira and TestRail for direct test case sync

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

**Built by Jaimit Joshi**
Northeastern University — MS Software Engineering Systems
