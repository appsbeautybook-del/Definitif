# Voicebox Dockerfile — GPU-accelerated TTS server
FROM nvidia/cuda:12.4.0-runtime-ubuntu22.04

# Dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv \
    curl git \
    && rm -rf /var/lib/apt/lists/*

# Clone Voicebox
WORKDIR /app
RUN git clone https://github.com/jamiepine/voicebox.git .

# Setup backend
WORKDIR /app/backend
RUN python3 -m venv venv && \
    . venv/bin/activate && \
    pip install --upgrade pip && \
    pip install -r requirements.txt && \
    pip install --no-deps chatterbox-tts && \
    pip install --no-deps hume-tada && \
    pip install git+https://github.com/QwenLM/Qwen3-TTS.git

# Expose port
EXPOSE 17493

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:17493/api/health || exit 1

# Start server
CMD [". venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 17493"]
