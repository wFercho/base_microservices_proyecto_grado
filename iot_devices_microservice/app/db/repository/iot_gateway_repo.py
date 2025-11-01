# db/repository.py
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.db.models.iot_gateway import IoTGateway
from app.db.models.sensor_node import SensorNode
from app.db.schemas.iot_gateway import IoTGatewayCreate, IoTGatewaySIdResponse, IoTGatewayUpdate
from typing import Optional

def create_iot_gateway(db: Session, gateway_data: IoTGatewayCreate) -> IoTGateway:
    """Crea un nuevo IoT Gateway."""
    db_gateway = IoTGateway(**gateway_data.model_dump())
    db.add(db_gateway)
    db.commit()
    db.refresh(db_gateway)
    return db_gateway

def get_iot_gateway_by_id(db: Session, gateway_id: int) -> Optional[IoTGateway]:
    """Obtiene un IoT Gateway por su ID con todos sus nodos sensores y sensores."""
    stmt = (
        select(IoTGateway)
        .where(IoTGateway.id == gateway_id)
        .options(selectinload(IoTGateway.sensor_nodes).selectinload(SensorNode.sensors))
    )
    return db.execute(stmt).scalars().first()

def get_iot_gateways(db: Session) -> list[IoTGateway]:
    """Obtiene todos los IoT Gateways."""
    stmt = (
        select(IoTGateway)
        .options(selectinload(IoTGateway.sensor_nodes).selectinload(SensorNode.sensors))
    )
    return db.execute(stmt).scalars().all()
def get_iot_gateways_ids(db: Session) -> IoTGatewaySIdResponse:
    """
    Obtiene solo los IDs de todos los nodos sensores.
    Retorna un objeto SensorNodeIdResponse con la lista de IDs.
    """
    ids = [str(id[0]) for id in db.query(IoTGateway.id).all()]
    if not ids:
        return IoTGatewaySIdResponse(ids=[])
    return IoTGatewaySIdResponse(ids=ids)

def get_iot_gateways_paginated(
    db: Session, 
    page: int = 1, 
    per_page: int = 10
) -> dict:
    """Obtiene IoT Gateways con paginación."""
    total = db.scalar(select(func.count()).select_from(IoTGateway))
    
    stmt = (
        select(IoTGateway)
        .offset((page - 1) * per_page)
        .limit(per_page)
        .options(selectinload(IoTGateway.sensor_nodes).selectinload(SensorNode.sensors))
    )
    
    items = db.execute(stmt).scalars().all()
    
    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "items": items
    }

def update_iot_gateway(
    db: Session, 
    gateway: IoTGateway,
    gateway_data: IoTGatewayUpdate
) -> IoTGateway:
    """Actualiza un IoT Gateway existente."""
    update_data = gateway_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(gateway, field, value)
    db.commit()
    db.refresh(gateway)
    return gateway

def delete_iot_gateway(db: Session, gateway_id: int) -> None:
    """Elimina un IoT Gateway existente."""
    gateway = get_iot_gateway_by_id(db, gateway_id)
    if gateway:
        db.delete(gateway)
        db.commit()