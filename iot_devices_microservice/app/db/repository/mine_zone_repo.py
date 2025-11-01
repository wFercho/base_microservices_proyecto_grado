# db/repository/mine_zone_repo.py
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.db.models.mine_zone import MineZone
from app.db.models.iot_gateway import IoTGateway
from app.db.models.sensor_node import SensorNode
from app.db.models.sensor import Sensor
from app.db.schemas.mine_zone import IoTZonesIdResponse, MineZoneCreate, MineZoneUpdate
from typing import Optional
import uuid

def create_mine_zone(db: Session, mine_data: MineZoneCreate) -> MineZone:
    """Crea una nueva Mina."""
    db_mine = MineZone(**mine_data.model_dump())
    db.add(db_mine)
    db.commit()
    db.refresh(db_mine)
    return db_mine


def get_zones_id(db: Session) -> IoTZonesIdResponse:
    """
    Obtiene solo los IDs de todos los nodos sensores.
    Retorna un objeto SensorNodeIdResponse con la lista de IDs.
    """
    ids = [str(id[0]) for id in db.query(MineZone.id).all()]
    if not ids:
        return IoTZonesIdResponse(ids=[])
    return IoTZonesIdResponse(ids=ids)

def get_mine_zone_by_id(db: Session, mine_id: uuid.UUID) -> Optional[MineZone]:
    """Obtiene una Mina por su ID con todos sus gateways, nodos sensores y sensores."""
    stmt = (
        select(MineZone)
        .where(MineZone.id == mine_id)
        .options(
            selectinload(MineZone.iot_gateways)
            .selectinload(IoTGateway.sensor_nodes)
            .selectinload(SensorNode.sensors)
        )
    )
    return db.execute(stmt).scalars().first()

def get_mine_zone_by_name(db: Session, name: str) -> Optional[MineZone]:
    """Obtiene una Mina por su nombre."""
    stmt = select(MineZone).where(MineZone.name == name)
    return db.execute(stmt).scalars().first()

def get_mine_zones(db: Session) -> list[MineZone]:
    """Obtiene todas las Minas."""
    stmt = (
        select(MineZone)
        .options(
            selectinload(MineZone.iot_gateways)
            .selectinload(IoTGateway.sensor_nodes)
            .selectinload(SensorNode.sensors)
        )
    )
    return db.execute(stmt).scalars().all()

def get_mine_zones_paginated(
    db: Session, 
    page: int = 1, 
    per_page: int = 10,
    status_filter: Optional[str] = None
) -> dict:
    """Obtiene Minas con paginación y filtros opcionales."""
    query = select(MineZone)
    
    if status_filter:
        query = query.where(MineZone.status == status_filter)
    
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    
    stmt = (
        query
        .offset((page - 1) * per_page)
        .limit(per_page)
        .options(
            selectinload(MineZone.iot_gateways)
            .selectinload(IoTGateway.sensor_nodes)
            .selectinload(SensorNode.sensors)
        )
    )
    
    items = db.execute(stmt).scalars().all()
    
    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "items": items
    }

def update_mine_zone(
    db: Session, 
    mine_zone: MineZone,
    mine_data: MineZoneUpdate
) -> MineZone:
    """Actualiza una Mina existente."""
    update_data = mine_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(mine_zone, field, value)
    db.commit()
    db.refresh(mine_zone)
    return mine_zone

def delete_mine_zone(db: Session, mine_id: uuid.UUID) -> None:
    """Elimina una Mina existente."""
    mine_zone = get_mine_zone_by_id(db, mine_id)
    if mine_zone:
        db.delete(mine_zone)
        db.commit()