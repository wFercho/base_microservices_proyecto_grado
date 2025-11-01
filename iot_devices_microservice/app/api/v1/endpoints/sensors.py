from fastapi import APIRouter, Depends, Query,HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.services.sensor import SensorService
from app.db.schemas.sensor import SensorCreate, SensorResponse, SensorUpdate,PaginatedSensorResponse
from app.db.session import get_db

router = APIRouter()

@router.post("/", response_model=SensorResponse, status_code=201)
def create_sensor(sensor: SensorCreate, db: Session = Depends(get_db)):
    """Crea un nuevo sensor."""
    return SensorService.create_sensor(sensor, db)

@router.get("/", response_model=List[SensorResponse])
def list_sensors(
    db: Session = Depends(get_db)
):
    """Lista todos los sensores con paginación."""
    return SensorService.list_sensors(db)

@router.get("/{sensor_id}", response_model=SensorResponse)
def get_sensor(sensor_id: int, db: Session = Depends(get_db)):
    """Obtiene un sensor específico por su ID."""
    sensor = SensorService.get_sensor(sensor_id, db)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor no encontrado")
    return sensor

@router.put("/{sensor_id}", response_model=SensorResponse)
def update_sensor(
    sensor_id: int, 
    sensor: SensorUpdate, 
    db: Session = Depends(get_db)
):
    """Actualiza un sensor existente."""
    updated_sensor = SensorService.update_sensor(sensor_id, sensor, db)
    if not updated_sensor:
        raise HTTPException(status_code=404, detail="Sensor no encontrado")
    return updated_sensor

@router.delete("/{sensor_id}", response_model=SensorResponse)
def delete_sensor(sensor_id: int, db: Session = Depends(get_db)):
    """Elimina un sensor."""
    deleted_sensor = SensorService.delete_sensor(sensor_id, db)
    if not deleted_sensor:
        raise HTTPException(status_code=404, detail="Sensor no encontrado")
    return deleted_sensor

@router.get("/node/{node_id}", response_model=List[SensorResponse])
def list_sensors_by_node(
    node_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Lista sensores asociados a un nodo específico."""
    return SensorService.list_sensors_by_node(node_id, db, skip, limit)

@router.get("/paginated/sensors", response_model=PaginatedSensorResponse)
def list_sensors_paginated(
    page: int = Query(1, gt=0, description="Número de página (comienza en 1)"),
    per_page: int = Query(10, gt=0, le=100, description="Elementos por página (máx. 100)"),
    db: Session = Depends(get_db)
):
    """
    Obtiene todos los sensores con paginación.
    
    - **page**: Número de página
    - **per_page**: Elementos por página
    """
    return SensorService.get_sensors_paginated(db, page, per_page)

@router.get("/by-node/{node_id}", response_model=PaginatedSensorResponse)
def list_sensors_by_node_paginated(
    node_id: str,
    page: int = Query(1, gt=0, description="Número de página (comienza en 1)"),
    per_page: int = Query(10, gt=0, le=100, description="Elementos por página (máx. 100)"),
    db: Session = Depends(get_db)
):
    """
    Obtiene sensores asociados a un nodo específico con paginación.
    
    - **node_id**: ID del nodo sensor (formato 'node_X')
    - **page**: Número de página
    - **per_page**: Elementos por página
    """
    return SensorService.get_sensors_by_node_paginated(db, node_id, page, per_page)