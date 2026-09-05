# AI Content Studio

A production-ready AI content creation platform that unifies content editing, AI generation, knowledge management, and model operations. Built with React + Vite, Node.js/Express, ChromaDB, and multiple AI inference engines.

## Features

- **Rich Text Editor** - TipTap WYSIWYG editor with autosave
- **AI Actions Panel** - Generate, summarize, rewrite, and translate with 5 interchangeable engines
- **Engine Compare** - Side-by-side comparison of AI model outputs
- **Knowledge Base** - Semantic search over documents with ChromaDB vector store
- **Data Collector** - Collect content from URLs and platforms (Agent Reach)
- **File Parser** - Parse PDF, HTML, EPUB, DOCX, PPTX, Markdown, JSON
- **Model Lab** - MiniMind training with live WebSocket log streaming
- **Model Builder** - Convert and quantize models (GGUF, ONNX, etc.)
- **Multi-format Export** - PDF, HTML, EPUB, DOCX, PPTX, Markdown, JSON

## Project Structure

```
ai-content-studio/
├── frontend/                  # React + Vite SPA
│   └── src/
│       ├── api/               # Axios API clients
│       ├── components/        # Feature components
│       ├── hooks/             # Custom hooks
│       └── App.jsx            # Routes
├── backend/                   # Node.js + Express API
│   └── src/
│       ├── routes/            # API route handlers
│       ├── services/          # Business logic
│       └── utils/             # Helpers
├── python-service/            # FastAPI (HF Transformers + llama.cpp)
├── docker-compose.yml         # All services
└── README.md
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- Docker & Docker Compose
- git

## Quick Start

### 1. Clone and install dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

# Python service
cd ../python-service
pip install -r requirements.txt
```

### 2. Configure environment variables

Backend (`backend/.env`):
```env
PORT=5000
CHROMA_URL=http://localhost:8000
OPENROUTER_API_KEY=your-key-here
OLLAMA_URL=http://localhost:11434
LLAMACPP_URL=http://localhost:8080
HF_SERVICE_URL=http://localhost:8001
NVIDIA_NIM_ENDPOINT=http://localhost:8002/v1
NVIDIA_API_KEY=your-key-here
```

Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
```

### 3. Start infrastructure with Docker

```bash
docker-compose up -d
```

This starts:
- **ChromaDB** at `http://localhost:8000`
- **Ollama** at `http://localhost:11434`

Pull a model into Ollama if needed:
```bash
docker exec -it ai-content-studio-ollama-1 ollama pull llama3.2
docker exec -it ai-content-studio-ollama-1 ollama pull nomic-embed-text
```

### 4. Start the Python service (optional, for Hugging Face)

```bash
cd python-service
python main.py
```

Or containerized:
```bash
docker build -t ai-python-service python-service
docker run -p 8001:8001 ai-python-service
```

### 5. Start backend and frontend

```bash
# Backend
cd backend
npm run dev

# Frontend (separate terminal)
cd frontend
npm run dev
```

Open http://localhost:5173

## AI Engine Configuration

| Engine | Description | Endpoint |
|--------|-------------|----------|
| **Ollama** | Local LLM server | `http://localhost:11434` |
| **llama.cpp** | Local GGUF inference | `http://localhost:8080` |
| **Hugging Face** | Full transformers (Python service) | `http://localhost:8001` |
| **NVIDIA NIM** | NVIDIA inference microservices | `http://localhost:8002/v1` |
| **OpenRouter** | Cloud API gateway | `https://openrouter.ai` |

Set the appropriate keys and endpoints in `backend/.env`.

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/run` | Execute AI action with selected engine |
| POST | `/api/ai/compare` | Compare multiple engines |
| POST | `/api/knowledge/add` | Add document to ChromaDB |
| GET | `/api/knowledge/search` | Semantic search |
| POST | `/api/editor/save` | Save editor content |
| GET | `/api/editor/load/:id` | Load content |
| POST | `/api/export/:format` | Export to format |
| POST | `/api/collector/scrape` | Run Agent Reach collection |
| POST | `/api/parser/upload` | Parse uploaded file |
| POST | `/api/modellab/start` | Start MiniMind training |
| GET | `/api/modellab/status` | Get training status |
| POST | `/api/builder/convert` | Convert/quantize model |
| GET | `/api/builder/status/:jobId` | Get conversion status |

## Export Formats

- **PDF** - Via Puppeteer (print-ready, custom styling)
- **HTML** - Static self-contained page
- **EPUB** - E-book format
- **DOCX** - Word document
- **PPTX** - PowerPoint presentation
- **Markdown** - Plain text markup
- **JSON** - Structured data with metadata

## Model Builder (Conversion)

The model builder supports converting Hugging Face models to:
- **GGUF** - With quantization options (q2_k to q8_0)
- **ONNX** - Via `optimum-cli`
- **GGML** - Legacy format
- **SafeTensors** - Safe tensor format

## Training (Model Lab)

The Model Lab interfaces with MiniMind for training small language models, streaming progress via WebSocket for:
- Real-time training loss
- Epoch progress
- Log output

Set `MINIMIND_PATH` in `backend/.env`.

## Data Collection

The Data Collector uses Agent Reach to:
- Scrape specific URLs
- Collect from platforms (Twitter/X, LinkedIn, GitHub, Reddit)
- Configure depth and output format

Set `AGENT_REACH_PATH` in `backend/.env`.

## Troubleshooting

**ChromaDB connection issues:**
```bash
curl http://localhost:8000/api/v1/heartbeat
```

**Ollama not responding:**
```bash
docker logs ai-content-studio-ollama-1
```

**Puppeteer missing browser:**
```bash
cd backend
npx puppeteer browsers install chrome
```

## License

MIT

## Notes

- For production, add authentication (e.g., JWT) and rate limiting
- NIM requires an NGC account and API key
- All inference engines are interchangeable through the router
