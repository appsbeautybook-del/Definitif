FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    git curl build-essential && \
    rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/jamiepine/voicebox.git .

WORKDIR /app/backend

RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir --no-deps chatterbox-tts && \
    pip install --no-cache-dir --no-deps hume-tada && \
    pip install --no-cache-dir git+https://github.com/QwenLM/Qwen3-TTS.git

EXPOSE 17493

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "17493", "--workers", "1"]
