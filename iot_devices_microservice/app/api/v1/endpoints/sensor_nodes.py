from fastapi import APIRouter,Query, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.services.sensor_node import SensorNodeService
from app.db.schemas.sensor_node import SensorNodeCreate, SensorNodeIdResponse, SensorNodeResponse, SensorNodeUpdate, PaginatedResponse
from app.db.session import get_db

router = APIRouter()

@router.post("/", response_model=SensorNodeResponse, status_code=status.HTTP_201_CREATED)
def create_sensor_node(sensor_node: SensorNodeCreate, db: Session = Depends(get_db)):
    """Crea un nuevo nodo sensor."""
    return SensorNodeService.create_sensor_node(sensor_node, db)

@router.get("/ids", response_model=SensorNodeIdResponse)
def get_sensor_node_ids(db: Session = Depends(get_db)):
    """Obtiene una lista de ids de nodos sensores."""
    return SensorNodeService.list_sensor_nodes_ids(db)

@router.get("/", response_model=list[SensorNodeResponse])
def list_sensor_nodes(db: Session = Depends(get_db)):
    """Lista todos los nodos sensores."""
    return SensorNodeService.list_sensor_nodes(db)

@router.get("/paginated/", response_model=PaginatedResponse)
def list_sensor_nodes_paginated(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Lista IoT Gateways con paginación."""
    return SensorNodeService.list_sensor_node_paginated(db, page, per_page)

@router.get("/{node_id}", response_model=SensorNodeResponse)
def get_sensor_node(node_id: str, db: Session = Depends(get_db)):
    """Obtiene un nodo sensor específico por su ID."""
    return SensorNodeService.get_sensor_node(node_id, db)


@router.put("/{node_id}", response_model=SensorNodeResponse)
def update_sensor_node(
    node_id: str,
    node_data: SensorNodeUpdate,
    db: Session = Depends(get_db)
):
    """Actualiza un nodo sensor existente."""
    return SensorNodeService.update_sensor_node(node_id, node_data, db)

@router.delete("/{node_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sensor_node(node_id: str, db: Session = Depends(get_db)):
    """Elimina un nodo sensor."""
    SensorNodeService.delete_sensor_node(node_id, db)
    return None