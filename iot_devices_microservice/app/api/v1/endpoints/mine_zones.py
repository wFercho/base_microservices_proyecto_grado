# routers/mine_zone.py
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.services.mine_zone import MineZoneService
from app.db.schemas.mine_zone import (
    IoTZonesIdResponse,
    MineZoneCreate,
    MineZoneResponse,
    MineZoneUpdate,
    PaginatedMineZoneResponse
)
from app.db.session import get_db
import uuid

router = APIRouter()

@router.post("/", response_model=MineZoneResponse, status_code=201)
def create_mine_zone(mine_zone: MineZoneCreate, db: Session = Depends(get_db)):
    """Crea una nueva Mina."""
    return MineZoneService.create_mine_zone(mine_zone, db)

@router.get("/", response_model=List[MineZoneResponse])
def list_mine_zones(db: Session = Depends(get_db)):
    """Lista todas las Minas."""
    return MineZoneService.list_mine_zones(db)

@router.get("/ids", response_model=IoTZonesIdResponse)
def get_iot_gateway_ids(db: Session = Depends(get_db)):
    """Obtiene una lista de ids de IoT Gateways."""
    return MineZoneService.list_zones_ids(db)

@router.get("/paginated/", response_model=PaginatedMineZoneResponse)
def list_mine_zones_paginated(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filtrar por estado (active/inactive)"),
    db: Session = Depends(get_db)
):
    """Lista Minas con paginación y filtros opcionales."""
    return MineZoneService.list_mine_zones_paginated(
        db, 
        page=page, 
        per_page=per_page,
        status_filter=status
    )

@router.get("/{mine_id}", response_model=MineZoneResponse)
def get_mine_zone(mine_id: uuid.UUID, db: Session = Depends(get_db)):
    """Obtiene una Mina específica con todos sus gateways, nodos sensores y sensores."""
    return MineZoneService.get_mine_zone(mine_id, db)

@router.put("/{mine_id}", response_model=MineZoneResponse)
def update_mine_zone(
    mine_id: uuid.UUID,
    mine_zone: MineZoneUpdate,
    db: Session = Depends(get_db)
):
    """Actualiza una Mina existente."""
    return MineZoneService.update_mine_zone(mine_id, mine_zone, db)

@router.delete("/{mine_id}", status_code=204)
def delete_mine_zone(mine_id: uuid.UUID, db: Session = Depends(get_db)):
    """Elimina una Mina existente."""
    MineZoneService.delete_mine_zone(mine_id, db)