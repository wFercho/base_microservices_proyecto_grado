# Imagen base de Python
FROM python:3.9

# Configurar para evitar buffering en salida estándar
ENV PYTHONUNBUFFERED=1

# Actualizar el sistema e instalar herramientas de red necesarias
RUN apt update && apt install -y \
    iputils-ping \
    netcat-openbsd \
    telnet \
    mosquitto-clients && \
    rm -rf /var/lib/apt/lists/*

# Crear y establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos del proyecto
COPY ./app .

# Instalar dependencias del proyecto
RUN pip install --no-cache-dir -r requirements.txt

# Exponer el puerto de FastAPI
EXPOSE 8000

# Comando para ejecutar la aplicación con -u para evitar buffering
CMD ["python", "-u", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]