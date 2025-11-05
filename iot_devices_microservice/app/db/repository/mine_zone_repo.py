from sqlalchemy.orm import Session
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.db.models.mine_zone import MineZone
from app.db.models.iot_gateway import IoTGateway
from app.db.models.sensor_node import SensorNode
from app.db.models.sensor import Sensor
from app.db.schemas.mine_zone import MinesIdResponse, MineCreate, MineUpdate
from typing import Optional
import uuid

def create_mine(db: Session, mine_data: MineCreate) -> MineZone:
    """Crea una nueva Mina."""
    db_mine = MineZone(**mine_data.model_dump())
    db.add(db_mine)
    db.commit()
    db.refresh(db_mine)
    return db_mine

def get_mines_id(db: Session) -> MinesIdResponse:
    """
    Obtiene solo los IDs de todas las minas.
    """
    ids = [str(id[0]) for id in db.query(MineZone.id).all()]
    if not ids:
        return MinesIdResponse(ids=[])
    return MinesIdResponse(ids=ids)

def get_mine_by_id(db: Session, mine_id: uuid.UUID) -> Optional[MineZone]:
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

def get_mine_by_nombre(db: Session, nombre: str) -> Optional[MineZone]:
    """Obtiene una Mina por su nombre."""
    stmt = select(MineZone).where(MineZone.nombre == nombre)
    return db.execute(stmt).scalars().first()

def get_mines(db: Session) -> list[MineZone]:
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

def get_mines_paginated(
    db: Session, 
    page: int = 1, 
    per_page: int = 10
) -> dict:
    """Obtiene Minas con paginación."""
    query = select(MineZone)
    
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

def update_mine(
    db: Session, 
    mine: MineZone,
    mine_data: MineUpdate
) -> MineZone:
    """Actualiza una Mina existente."""
    update_data = mine_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(mine, field, value)
    db.commit()
    db.refresh(mine)
    return mine

def delete_mine(db: Session, mine_id: uuid.UUID) -> None:
    """Elimina una Mina existente."""
    mine = get_mine_by_id(db, mine_id)
    if mine:
        db.delete(mine)
        db.commit()