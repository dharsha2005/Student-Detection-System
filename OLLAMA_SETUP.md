# Ollama Setup Guide

## Prerequisites

1. Install Ollama from https://ollama.ai/
2. Download the Llama3 model

## Installation Steps

### 1. Install Ollama

**Windows:**
- Download from https://ollama.ai/download
- Run the installer
- Ollama will start automatically

**Linux/Mac:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Download Llama3 Model

Open a terminal and run:
```bash
ollama pull llama3
```

This will download the Llama3 model (approximately 4.7GB).

### 3. Verify Installation

Test that Ollama is running:
```bash
ollama list
```

You should see `llama3` in the list.

Test the model:
```bash
ollama run llama3 "Hello, how are you?"
```

### 4. Configure Backend (Optional)

The backend is configured to use:
- **Ollama URL**: `http://localhost:11434` (default)
- **Model**: `llama3`

You can change these by setting environment variables:
```bash
export OLLAMA_BASE_URL=http://localhost:11434
export OLLAMA_MODEL=llama3
```

Or in Windows PowerShell:
```powershell
$env:OLLAMA_BASE_URL="http://localhost:11434"
$env:OLLAMA_MODEL="llama3"
```

## Starting the Application

1. **Start Ollama** (if not already running):
   - Windows: It should start automatically
   - Linux/Mac: Run `ollama serve`

2. **Start the Backend**:
   ```bash
   cd backend
   python run.py
   ```

3. **Start the Frontend**:
   ```bash
   cd frontend
   npm start
   ```

## Troubleshooting

### Ollama Connection Error

If you see "I encountered an error connecting to the AI model":
1. Make sure Ollama is running: `ollama list`
2. Check if the model is downloaded: `ollama list` should show `llama3`
3. Verify Ollama is accessible: Open `http://localhost:11434` in browser
4. Check the backend logs for detailed error messages

### Model Not Found

If you get "model not found" error:
```bash
ollama pull llama3
```

### Port Already in Use

If port 11434 is already in use:
1. Change Ollama port: `OLLAMA_HOST=0.0.0.0:11435 ollama serve`
2. Update backend environment variable: `OLLAMA_BASE_URL=http://localhost:11435`

## Testing the Chatbot

Once everything is set up:
1. Log in to the application
2. Go to the Dashboard
3. Scroll down to the "AI Assistant" section
4. Ask questions like:
   - "What is the average GPA of all students?"
   - "Which students are at risk?"
   - "Tell me about student performance trends"
   - "What insights can you provide about the data?"

The chatbot will query the database and use Llama3 to generate intelligent responses based on the actual data.

