FROM python:3.11-slim

# Install system dependencies (curl required for docker-compose healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install PyTorch CPU first to leverage Docker caching (very large download)
RUN pip install --no-cache-dir torch==2.5.1 --index-url https://download.pytorch.org/whl/cpu

# Copy requirements and install other dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code and model weights/tokenizer
COPY backend /app/backend
COPY model /app/model

# Create data directory for SQLite persistent volume
RUN mkdir -p /app/backend/data

WORKDIR /app/backend

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
