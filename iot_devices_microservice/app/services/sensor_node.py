from sqlalchemy.orm import Session
from app.db.repository.sensor_node_repo import (
    create_sensor_node,
    get_sensor_nodes,
    get_sensor_node_ids,
    get_sensor_nodes_pagination,
    get_sensor_node_by_id,
    update_sensor_node,
    delete_sensor_node
)
from app.db.schemas.sensor_node import SensorNodeCreate,SensorNodeIdResponse, SensorNodeResponse, SensorNodeUpdate,PaginatedResponse
from fastapi import HTTPException, status

class SensorNodeService:
    @staticmethod
    def create_sensor_node(node_data: SensorNodeCreate, db: Session) -> SensorNodeResponse:
        """Crea un nuevo nodo sensor en la base de datos."""
        if get_sensor_node_by_id(db, node_data.id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El ID del nodo sensor ya existe"
            )
        return create_sensor_node(db, node_data)

    @staticmethod
    def list_sensor_nodes(db: Session) -> list[SensorNodeResponse]:
        """Obtiene todos los nodos sensores registrados."""
        return get_sensor_nodes(db)

    @staticmethod
    def list_sensor_nodes_ids(db: Session) -> list[SensorNodeIdResponse]:
        """Obtiene todos los nodos sensores registrados."""
        return get_sensor_node_ids(db)

    @staticmethod
    def get_sensor_node(node_id: str, db: Session) -> SensorNodeResponse:
        """Obtiene un nodo sensor por su ID."""
        node = get_sensor_node_by_id(db, node_id)
        if not node:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Nodo sensor no encontrado"
            )
        return node
    
    @staticmethod
    def list_sensor_node_paginated(
        db: Session, 
        page: int = 1, 
        per_page: int = 10
    ) -> PaginatedResponse:
        """Obtiene IoT Gateways con paginación."""
        return get_sensor_nodes_pagination(db=db, page=page, per_page=per_page)

    @staticmethod
    def update_sensor_node(node_id: str, node_data: SensorNodeUpdate, db: Session) -> SensorNodeResponse:
        """Actualiza un nodo sensor existente."""
        updated_node = update_sensor_node(db, node_id, node_data)
        if not updated_node:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Nodo sensor no encontrado"
            )
        return updated_node

    @staticmethod
    def delete_sensor_node(node_id: str, db: Session) -> dict:
        """Elimina un nodo sensor."""
        if not delete_sensor_node(db, node_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Nodo sensor no encontrado"
            )
        return {"message": "Nodo sensor eliminado correctamente"}