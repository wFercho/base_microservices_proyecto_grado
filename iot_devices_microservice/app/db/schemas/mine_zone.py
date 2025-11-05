from pydantic import BaseModel, ConfigDict
import uuid
from typing import List, Optional
from datetime import datetime
from app.db.schemas.iot_gateway import IoTGatewayResponse

# Schemas para Mine
class MineBase(BaseModel):
    nombre: str
    ubicacion: Optional[str] = None
    provincia: Optional[str] = None
    latitud: Optional[str] = None
    longitud: Optional[str] = None
    direccion: Optional[str] = None
    empresa: Optional[str] = None
    contacto: Optional[str] = None
    estado: Optional[str] = 'activa' 

class MineCreate(MineBase):
    pass

class MineUpdate(BaseModel):
    nombre: Optional[str] = None
    ubicacion: Optional[str] = None
    provincia: Optional[str] = None
    latitud: Optional[str] = None
    longitud: Optional[str] = None
    direccion: Optional[str] = None
    empresa: Optional[str] = None
    contacto: Optional[str] = None
    estado: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class MineResponse(MineBase):
    id: uuid.UUID
    iot_gateways: List[IoTGatewayResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class PaginatedMineResponse(BaseModel):
    total: int
    page: int
    per_page: int
    items: List[MineResponse]

class MinesIdResponse(BaseModel):
    """Modelo para respuesta que solo contiene IDs de Mines"""
    ids: List[str]  

    model_config = ConfigDict(from_attributes=True)