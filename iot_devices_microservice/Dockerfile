FROM python:3.9

WORKDIR /app

# Establecer variables de entorno
ENV PYTHONPATH=/app \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1
# 1. Copiar requirements e instalar
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2. Copiar estructura completa
COPY . .

# 3. Configurar entorno
ENV PYTHONPATH=/app

CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8001"]