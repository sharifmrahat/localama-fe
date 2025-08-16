# Localama | Frontend

**Localama** is a lightweight AI chat application for running [Ollama](https://ollama.com/) models locally. It provides a clean, responsive chat interface with real-time streaming, enabling seamless interaction with large language models directly on your machine.

## 📦 Installation

#### Prerequisites:

| Model Size | Minimum RAM |
| ---------- | ----------- |
| 7B         | 8 GB        |
| 13B        | 16 GB       |
| 33B        | 32 GB       |

- Install **Ollama** and download at least one model.
- Check [Ollama Documentation](https://ollama.com/download) or [GitHub Repository](https://github.com/ollama/ollama) for the latest updates.
- Install [Bun](https://bun.com/) to run frontend.

### 1️⃣ Step-1 : Install Ollama

Install Ollama in your machine from [here](https://ollama.com/download)

Test Run ollama:

```bash
ollama serve
```

_Note: Ollama should run in: `http://localhost:11434/`_

### 2️⃣ Step-2: Pull Model

Get Ollama model from [here](https://ollama.com/search)

Pull your model:

```bash
ollama pull <model-name>
```

Check available models (optional):

```bash
ollama list
```

Test run your model (optional):

```bash
ollama pull <model-name>
```

### 3️⃣ Step-3: Run Application

| Method     | Description                                          |
| ---------- | ---------------------------------------------------- |
| **Docker** | Run both frontend and backend together.              |
| **Manual** | Run frontend and backend separately on your machine. |

---

#### Method-1: Docker Setup (Recommended)

Run both frontend and backend together using Docker Compose. Install [Docker](https://docs.docker.com/get-docker/) and [ Docker Compose](https://docs.docker.com/compose/install/). And then Clone this repository for docker script:

```bash
git clone https://github.com/sharifmrahat/localama.git
cd localama

```

Run docker compose:

```bash
docker-compose up -d
```

Check the status:

```bash
docker ps
```

To stop the services:

```bash
docker-compose down
```

**Backend:** `http://localhost:5000/`

**Frontend:** `http://localhost:3000/`

---

#### Method-2: Manual Setup

Run the Frontend and Backend separately after cloning from GitHub.

_Note: To run the frontend with [Bun](https://bun.com/) you've to install it in your machine. You can also use NPM._

#### Backend Setup:

Clone backend repository:

```bash
git clone https://github.com/sharifmrahat/localama-api.git
cd localama-api
```

Install dependencies:

```bash
npm install
```

Run backend service:

```bash
npm run start:dev
```

**Backend:** `http://localhost:5000/`

---

#### Frontend setup:

Clone frontend repository:

```bash
git clone https://github.com/sharifmrahat/localama-fe.git
cd localama-fe
```

Install dependencies:

```bash
bun install
```

Run frontend:

```bash
bun run dev
```

**Frontend:** `http://localhost:5173/`

## 🚀 Tech Stack

- Ollama (LLM)
- Node.js
- NestJS
- SSE
- Bun
- Svelte
- Tailwind
- Shadcn
- TypeScript
- Vite
- Docker

## ✨ Features

- **AI-Powered Chat** – Interact seamlessly with large language models running locally.
- **Responsive UI/UX** – Clean, intuitive interface optimized for both desktop and mobile.
- **Streaming Communication** – Unidirectional real-time updates via Server-Sent Events (SSE).
- **Text-to-Speech** – Listen to AI responses in natural-sounding voice.
- **Voice-to-Text** – Speak your messages and let the app convert them to text.
- **In-Memory Chat History** – Keep conversations accessible during the session without persistent storage.
- **Fast and Lightweight** – Built with Bun for high performance and minimal overhead.
- **Local-First Privacy** – All processing happens on your machine, keeping your data private.
- **Multi-Model Support** – Easily experiment with different Ollama models running locally.

## 📈 Areas of Enhancement

- **Real-Time Streaming** – Improve the speed and reliability of live data updates.
- **Database Integration**: Store users and sessions in local database instead of using in-memory storage.
- **UI/UX Enhancements** – Add animations and interactive elements for a smoother user experience.
- **Testing & Reliability\*** – Implement comprehensive unit and integration tests to ensure stability.
- **Scalability** – Support larger models and multiple simultaneous sessions efficiently.
- **Voice Features** – Improve accuracy and responsiveness for text-to-speech and voice-to-text interactions.

## 🤝 Contribution

- Fork the repository
- Create a feature branch (git checkout -b feature-name)
- Commit changes (git commit -m 'Add feature')
- Push and create a PR

**Owner**: [Sharif](https://www.linkedin.com/in/sharifmrahat/)
