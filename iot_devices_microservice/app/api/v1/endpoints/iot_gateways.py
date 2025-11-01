# routers/iot_gateway.py
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.services.iot_gateway import IoTGatewayService
from app.db.schemas.iot_gateway import (
    IoTGatewayCreate,
    IoTGatewayResponse,
    IoTGatewaySIdResponse,
    IoTGatewayUpdate,
    PaginatedResponse
)
from app.db.session import get_db

router = APIRouter()

@router.post("/", response_model=IoTGatewayResponse, status_code=201)
def create_iot_gateway(gateway: IoTGatewayCreate, db: Session = Depends(get_db)):
    """Crea un nuevo IoT Gateway."""
    return IoTGatewayService.create_iot_gateway(gateway, db)

@router.get("/", response_model=List[IoTGatewayResponse])
def list_iot_gateways(db: Session = Depends(get_db)):
    """Lista todos los IoT Gateways."""
    return IoTGatewayService.list_iot_gateways(db)

@router.get("/ids", response_model=IoTGatewaySIdResponse)
def get_iot_gateway_ids(db: Session = Depends(get_db)):
    """Obtiene una lista de ids de IoT Gateways."""
    return IoTGatewayService.list_iot_gateways_ids(db)

@router.get("/paginated/", response_model=PaginatedResponse)
def list_iot_gateways_paginated(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Lista IoT Gateways con paginación."""
    return IoTGatewayService.list_iot_gateways_paginated(db, page, per_page)

@router.get("/{gateway_id}", response_model=IoTGatewayResponse)
def get_iot_gateway(gateway_id: int, db: Session = Depends(get_db)):
    """Obtiene un IoT Gateway específico con todos sus nodos sensores y sensores."""
    return IoTGatewayService.get_iot_gateway(gateway_id, db)

@router.put("/{gateway_id}", response_model=IoTGatewayResponse)
def update_iot_gateway(
    gateway_id: int,
    gateway: IoTGatewayUpdate,
    db: Session = Depends(get_db)
):
    """Actualiza un IoT Gateway existente."""
    return IoTGatewayService.update_iot_gateway(gateway_id, gateway, db)

@router.delete("/{gateway_id}", status_code=204)
def delete_iot_gateway(gateway_id: int, db: Session = Depends(get_db)):
    """Elimina un IoT Gateway existente."""
    IoTGatewayService.delete_iot_gateway(gateway_id, db)