from sqlalchemy.orm import Session
from app.db.models.sensor import Sensor
from app.db.schemas.sensor import SensorCreate, SensorUpdate
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.orm import joinedload


def get_sensors(db: Session):
    """Obtiene todos los sensores con paginación"""
    return db.query(Sensor).options(joinedload(Sensor.sensor_node)).all()

def get_sensor(db: Session, sensor_id: int):
    """Obtiene un sensor específico por su ID"""
    return db.query(Sensor).filter(Sensor.id == sensor_id).first()

def create_sensor(db: Session, sensor: SensorCreate):
    """Crea un nuevo sensor"""
    db_sensor = Sensor(**sensor.model_dump())
    db.add(db_sensor)
    db.commit()
    db.refresh(db_sensor)
    return db_sensor

def update_sensor(db: Session, sensor_id: int, sensor: SensorUpdate):
    """Actualiza un sensor existente"""
    db_sensor = get_sensor(db, sensor_id)
    if not db_sensor:
        return None
    
    update_data = sensor.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_sensor, field, value)
    
    db.commit()
    db.refresh(db_sensor)
    return db_sensor

def delete_sensor(db: Session, sensor_id: int):
    """Elimina un sensor"""
    db_sensor = get_sensor(db, sensor_id)
    if not db_sensor:
        return None
    
    db.delete(db_sensor)
    db.commit()
    return db_sensor

def get_sensors_by_node(db: Session, node_id: str, skip: int = 0, limit: int = 100):
    """Obtiene sensores por ID de nodo"""
    return (
        db.query(Sensor)
        .filter(Sensor.id_node == node_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
def get_sensors_paginated(
    db: Session, 
    page: int = 1, 
    per_page: int = 10
) -> dict:
    """Obtiene sensores con paginación."""
    # Consulta para el total de registros
    total = db.scalar(select(func.count()).select_from(Sensor))
    
    # Consulta principal con relaciones
    stmt = (
        select(Sensor)
        .offset((page - 1) * per_page)
        .limit(per_page)
        .options(
            selectinload(Sensor.sensor_node)  # Carga la relación con el nodo
        )
    )
    
    # Ejecución y obtención de resultados
    items = db.execute(stmt).scalars().all()
    
    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "items": items
    }

def get_sensors_by_node_paginated(
    db: Session, 
    node_id: str,
    page: int = 1, 
    per_page: int = 10
) -> dict:
    """Obtiene sensores de un nodo específico con paginación."""
    # Consulta para el total de registros filtrados
    total = db.scalar(
        select(func.count())
        .select_from(Sensor)
        .where(Sensor.id_node == node_id)
    )
    
    # Consulta principal con filtro y relaciones
    stmt = (
        select(Sensor)
        .where(Sensor.id_node == node_id)
        .offset((page - 1) * per_page)
        .limit(per_page)
        .options(
            selectinload(Sensor.sensor_node)
        )
    )
    
    items = db.execute(stmt).scalars().all()
    
    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "items": items
    }