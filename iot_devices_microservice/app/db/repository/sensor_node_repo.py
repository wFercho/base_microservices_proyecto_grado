from sqlalchemy.orm import Session
from app.db.models.sensor_node import SensorNode
from app.db.models.iot_gateway import IoTGateway
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.db.schemas.sensor_node import SensorNodeCreate,SensorNodeIdResponse, SensorNodeUpdate
from typing import Optional,Tuple, List

from sqlalchemy.orm import joinedload

def get_sensor_nodes(db: Session):
    return db.query(SensorNode).options(joinedload(SensorNode.sensors)).all()

def get_sensor_node_ids(db: Session) -> SensorNodeIdResponse:
    """
    Obtiene solo los IDs de todos los nodos sensores.
    Retorna un objeto SensorNodeIdResponse con la lista de IDs.
    """
    ids = [str(id[0]) for id in db.query(SensorNode.id).all()]
    if not ids:
        return SensorNodeIdResponse(node_ids=[])
    return SensorNodeIdResponse(node_ids=ids)

def get_sensor_nodes_pagination(
    db: Session, 
    page: int = 1, 
    per_page: int = 10
) -> dict:
    """Obtiene IoT Gateways con paginación."""
    total = db.scalar(select(func.count()).select_from(SensorNode))
    
    stmt = (
        select(SensorNode)
        .offset((page - 1) * per_page)
        .limit(per_page)
        .options(selectinload(SensorNode.iot_gateway).selectinload(IoTGateway.sensor_nodes))
    )
    
    items = db.execute(stmt).scalars().all()
    
    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "items": items
    }

def get_sensor_node_by_id(db: Session, node_id: str) -> Optional[SensorNode]:
    return (
        db.query(SensorNode)
        .options(joinedload(SensorNode.sensors))
        .filter(SensorNode.id == node_id)
        .first()
    )

def create_sensor_node(db: Session, node_data: SensorNodeCreate) -> SensorNode:
    db_node = SensorNode(**node_data.model_dump())
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return db_node

def update_sensor_node(db: Session, node_id: str, node_data: SensorNodeUpdate) -> Optional[SensorNode]:
    db_node = get_sensor_node_by_id(db, node_id)
    if not db_node:
        return None
    
    update_data = node_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_node, key, value)
    
    db.commit()
    db.refresh(db_node)
    return db_node

def delete_sensor_node(db: Session, node_id: str) -> bool:
    db_node = get_sensor_node_by_id(db, node_id)
    if not db_node:
        return False
    
    db.delete(db_node)
    db.commit()
    return True