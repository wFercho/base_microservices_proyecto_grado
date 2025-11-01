# db/schemas/mine_zone.py
from pydantic import BaseModel, ConfigDict
import uuid
from typing import List, Optional
from datetime import datetime
from app.db.schemas.iot_gateway import IoTGatewayResponse



# Schemas para MineZone
class MineZoneBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: Optional[str] = None
    zone_type: str
    status: Optional[str] = 'active'
    mine_type: Optional[str] = None
    coordinates: Optional[str] = None
    depth: Optional[str] = None
    area: Optional[str] = None

class MineZoneCreate(MineZoneBase):
    pass

class MineZoneUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    zone_type: Optional[str] = None
    status: Optional[str] = None
    mine_type: Optional[str] = None
    coordinates: Optional[str] = None
    depth: Optional[str] = None
    area: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class MineZoneResponse(MineZoneBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    iot_gateways: List[IoTGatewayResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class PaginatedMineZoneResponse(BaseModel):
    total: int
    page: int
    per_page: int
    items: List[MineZoneResponse]

class IoTZonesIdResponse(BaseModel):
    """Modelo para respuesta que solo contiene IDs de IoT Zones"""
    ids: List[str]  

    class Config:
        from_attributes = True