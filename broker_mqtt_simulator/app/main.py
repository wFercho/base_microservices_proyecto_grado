from fastapi import FastAPI, WebSocket
from contextlib import asynccontextmanager
import asyncio
from mqtt_client import start_mqtt, register_websocket, process_messages
from simulator import simulate_data
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Maneja el ciclo de vida de la aplicación (startup y shutdown)."""
    # Crear tareas para los servicios que deben ejecutarse en segundo plano
    print("🚀 Iniciando aplicación...")
    
    # Es importante primero iniciar el procesamiento de mensajes
    task_process_messages = asyncio.create_task(process_messages())
    print("📨 Procesador de mensajes MQTT iniciado")
    
    # Luego iniciar el cliente MQTT
    task_mqtt = asyncio.create_task(start_mqtt())
    print("🔌 Cliente MQTT iniciado")
    
    # Finalmente iniciar el simulador de datos
    await asyncio.sleep(2)  # Pequeña pausa para asegurar que todo está listo
    task_simulator = asyncio.create_task(simulate_data())
    print("📊 Simulador de datos iniciado")

    yield  # 🔹 FastAPI ejecuta la app mientras estas tareas corren en segundo plano.

    # 🔴 Apagar servicios al cerrar la aplicación
    task_simulator.cancel()
    task_mqtt.cancel()
    task_process_messages.cancel()
    
    # Intentar finalizar las tareas limpiamente
    try:
        await asyncio.gather(task_simulator, task_mqtt, task_process_messages, 
                           return_exceptions=True)
    except asyncio.CancelledError:
        pass
    
    print("🚀 Aplicación apagándose...")

app = FastAPI(lifespan=lifespan)

# Habilitar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """Ruta raíz para verificar que el servicio está en ejecución."""
    return {"message": "IoT Gateway is running"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Maneja conexiones WebSocket."""
    await register_websocket(websocket)