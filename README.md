# Guardian AI - LLM Security Platform

Guardian AI is a comprehensive security platform designed to protect Large Language Models (LLMs) and AI Agents from various adversarial attacks, data leaks, and unauthorized actions. It provides a robust suite of tools for Red Teaming, PII (Personally Identifiable Information) protection, DLP (Data Loss Prevention), and Agent Safety monitoring.

## 🚀 Features

*   **🛡️ LLM Firewall & Security:** Real-time protection against prompt injections, jailbreaks, and other adversarial inputs.
*   **🔴 Red Teaming Suite:** Automated attack scenarios (e.g., DAN, System Prompt Override, SQL Injection) to test the robustness of your LLM models.
*   **🕵️ PII Scanner:** Advanced scanning and redaction of sensitive personal information in both prompts and model responses.
*   **🔒 Data Loss Prevention (DLP):** Monitors and prevents the leakage of confidential data.
*   **🤖 Agent Safety:** Monitors AI agent actions to prevent dangerous operations (e.g., unauthorized file access, system commands).
*   **🧪 RAG Poisoning Lab:** A dedicated environment to experiment with and understand Retrieval-Augmented Generation (RAG) poisoning attacks and mitigations.
*   **📊 Interactive Dashboard:** Visualizes security metrics, attack statistics, and system health.

## 🛠️ Tech Stack

### Backend
*   **Framework:** FastAPI (Python)
*   **Database:** SQLAlchemy (ORM), PostgreSQL/SQLite
*   **Authentication:** JWT (JSON Web Tokens)
*   **Security:** Passlib (Bcrypt), Python-Jose
*   **Utilities:** Pydantic, Uvicorn, PyPDF

### Frontend
*   **Framework:** React.js
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **Components:** Lucide React (Icons), Framer Motion (Animations)
*   **Charts:** Recharts
*   **HTTP Client:** Axios

## 📦 Installation & Setup

### Prerequisites
*   Python 3.8+
*   Node.js & npm
*   PostgreSQL (optional, depending on database configuration)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Guardian-AI
```

### 2. Backend Setup
Navigate to the `backend` directory and install the Python dependencies.

```bash
cd backend
# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

Run the backend server:
```bash
uvicorn main:app --reload
```
The backend API will be available at `http://localhost:8000` (or the port specified in your console).

### 3. Frontend Setup
Navigate to the `Frontend` directory and install the Node.js dependencies.

```bash
cd Frontend
npm install
```

Run the development server:
```bash
npm run dev
```
The frontend application will be available at `http://localhost:5173`.

## 📡 API Endpoints Overview

The backend exposes several key API endpoints for security operations:

### PII & DLP
*   `POST /api/pii/scan`: Scan text for PII and get a redacted version.
*   `GET /api/pii/stats`: Get statistics on PII detection.
*   `POST /api/dlp/scan`: Scan text against DLP rules.

### Red Team
*   `GET /api/red-team/scenarios`: List available attack scenarios.
*   `POST /api/red-team/run-suite`: Execute a suite of red team attacks against a connected LLM.
*   `GET /api/red-team/stats`: Get results and statistics from red team tests.

### Agent Safety
*   `GET /api/agent-safety/agents`: List connected AI agents.
*   `POST /api/agent-safety/test`: Test an agent's response to potentially dangerous inputs.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
