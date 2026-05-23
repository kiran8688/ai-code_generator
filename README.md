# AI Code Generator (Code Studio)

An elegant, full-stack AI-powered code generation and analysis assistant built with **Flask (Python)** on the backend and **React 19 + Vite 7 + Tailwind CSS v4** on the frontend. 

It provides real-time streaming code generation using OpenAI's API, syntax highlighting, and a post-generation analysis dashboard that grades generated code based on accuracy, completeness, efficiency, and test cases.

---

## 🚀 Features

- **Real-Time Streaming Generation**: Visual streaming progress bar indicating token output speed and completion percentage using Server-Sent Events (SSE).
- **Intelligent Code Analysis**: Grades code quality on accuracy, test coverage, completeness, and runtime efficiency, returning specific issues and optimization suggestions.
- **Integrated History Panel**: Local persistent storage (`localStorage`) of generation history, featuring custom datetime relative formatting and expandable code previews.
- **Multilingual Support**: Tailored code generation presets for Python, JavaScript, and Java.
- **Architectural Presets**: Specialized prompt structure presets for Functions, APIs, Databases, and Algorithms.
- **Utility Integrations**: One-click clipboard copy, automatic file download format mapping (`.py`, `.js`, `.java`), and backend health monitoring (30s polling).
- **Secure by Design**: Automatic local configuration caching and strict `.gitignore` filters keeping developer credentials safe.

---

## 🛠️ Technology Stack

### Backend
- **Core Framework**: Python Flask (multi-threaded, CORS-enabled)
- **AI Orchestration**: OpenAI v0.28.1 (GPT-3.5-Turbo API style)
- **Configuration & Utilities**: `python-dotenv`, `requests`, SSE stream wrappers, MD5-based query caching.

### Frontend
- **Framework**: React 19 + Vite 7 (ECMAScript Module structure)
- **Styling**: Tailwind CSS v4 + Modern Glassmorphism/Dark UI design guidelines
- **Code Highlighting**: Highlight.js (safe HTML sanitizing & language-specific CSS themes)
- **Icons**: Lucide React + React Icons
- **HTTP Client**: Axios

---

## 📂 Project Structure

```text
ai-code-generator/
│
├── backend/                  # Flask Backend Application
│   ├── app/
│   │   └── app.py            # Primary Flask server and streaming logic
│   ├── .env                  # Environment Variables (API key - gitignored)
│   ├── .env.example          # Template environment config
│   ├── .gitignore            # Backend-specific ignore list
│   └── requirements.txt      # Backend Python dependencies
│
├── frontend/                 # React Frontend Application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── assets/           # React SVG templates
│   │   ├── components/       # UI Components
│   │   │   ├── codeAnalyzer.jsx   # Code metrics & issues card
│   │   │   ├── codeGenerator.jsx  # Main prompt form & streaming editor
│   │   │   └── historyPanel.jsx   # Past generations logs
│   │   ├── styles/
│   │   │   └── globals.css   # Main stylesheet
│   │   ├── App.css           # Styling rules
│   │   ├── App.jsx           # Global State, Health Checker, and Layout
│   │   ├── index.css         # Baseline css rules
│   │   └── main.jsx          # DOM Entry point
│   ├── .gitignore            # Frontend-specific ignore list
│   ├── eslint.config.js      # Linting configuration
│   ├── package.json          # Frontend packages and scripts
│   └── vite.config.js        # Vite compilation configuration
│
├── .gitignore                # Workspace root-level gitignore
└── README.md                 # Project documentation (this file)
```

---

## ⚙️ Getting Started

### Prerequisites
- [Python 3.8+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- An OpenAI API Key

---

### Setup Instructions

#### 1. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables:
   - Create a `.env` file inside the `backend/` folder (duplicate `.env.example`).
   - Add your OpenAI API key:
     ```env
     OPENAI_API_KEY=sk-proj-yourOpenAiApiKeyHere
     SECRET_KEY=your-flask-secret-key
     ```

#### 2. Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```

---

### Running the Project

For local development, you need both the backend server and frontend development server running concurrently.

#### Start the Backend (Port 5000)
From the `backend/` folder:
```bash
python app/app.py
```
*The API will start running at `http://localhost:5000`.*

#### Start the Frontend (Port 5173 / default Vite)
From the `frontend/` folder:
```bash
npm run dev
```
*Open your browser and navigate to `http://localhost:5173` (or the address printed by Vite).*

---

## 🔌 API Endpoints Summary

### `GET /`
Returns general metadata, API version, and python environment specifications.

### `GET /api/health`
Monitors backend status and checks if the OpenAI API credential is correctly initialized.

### `GET /api/stream-generate`
- **Parameters**: `language` (string), `devType` (string), `prompt` (string), `complexity` (string).
- **Response**: `text/event-stream` sending SSE chunks of tokens, culminating in a `complete` token indicating successful code cache.

### `POST /api/analyze-code`
- **Payload**:
  ```json
  {
    "code": "...",
    "prompt": "...",
    "testInput": "...",
    "expectedOutput": "..."
  }
  ```
- **Response**: Detailed JSON feedback metrics containing accuracy rating, coverage percentage, completeness score, runtime efficiency index, and lists of issues/suggestions.

---

## 🔒 Security Practices

- **API Keys Protection**: The OpenAI API credential is only kept inside `backend/.env`.
- **Git Safeguards**: Root and sub-directory `.gitignore` files are explicitly configured to prevent staging `.env`, `.env.*` variants, node modules, venv folders, caches, or error log files.
- **Safe Output Rendering**: Custom string escaping is enforced prior to Highlight.js parsing to block Cross-Site Scripting (XSS) via generated content.
