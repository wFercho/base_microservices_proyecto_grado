from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import Config
from app.api.v1.router import api_router
from app.db.session import engine, Base
from app.db.models.mine_zone import MineZone
from app.db.models.iot_gateway import IoTGateway  
from app.db.models.sensor_node import SensorNode
from app.db.models.sensor import Sensor
from app.db.models.microservicios import MicroservicioDispositivosIoT, MicroservicioAlertas, MicroservicioStorage, MicroservicioMinas

if Config.ENVIRONMENT in ["development", "test"]:
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="IoT Devices API",
    description="API para gestionar dispositivos IoT en una mina subterránea",
    version="1.0.0",
    debug=Config.DEBUG
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def read_root():
    return {"message": f"IoT Devices API is running in {Config.ENVIRONMENT} mode!"}
