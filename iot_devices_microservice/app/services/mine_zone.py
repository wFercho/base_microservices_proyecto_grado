# services/mine_zone.py
from sqlalchemy.orm import Session
import uuid
from typing import Optional, List
from app.db.models.mine_zone import MineZone
from app.db.repository.mine_zone_repo import (
    create_mine_zone,
    get_mine_zone_by_id,
    get_mine_zone_by_name,
    get_mine_zones,
    get_zones_id,
    update_mine_zone,
    delete_mine_zone,
    get_mine_zones_paginated
)
from app.db.schemas.mine_zone import (
    IoTZonesIdResponse,
    MineZoneCreate,
    MineZoneResponse,
    MineZoneUpdate,
    PaginatedMineZoneResponse
)
from fastapi import HTTPException, status

class MineZoneService:
    @staticmethod
    def create_mine_zone(mine_data: MineZoneCreate, db: Session) -> MineZoneResponse:
        """Crea una nueva Mina en la base de datos."""
        # Verificar si ya existe una mina con el mismo nombre
        existing_mine = get_mine_zone_by_name(db=db, name=mine_data.name)
        if existing_mine:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Mina con el nombre '{mine_data.name}' ya existe"
            )
        return create_mine_zone(db=db, mine_data=mine_data)

    @staticmethod
    def get_mine_zone(mine_id: uuid.UUID, db: Session) -> MineZoneResponse:
        """Obtiene una Mina por su ID con todos sus gateways, nodos sensores y sensores."""
        mine_zone = get_mine_zone_by_id(db=db, mine_id=mine_id)
        if not mine_zone:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mina con id {mine_id} no encontrada"
            )
        return mine_zone

    @staticmethod
    def list_zones_ids(db: Session) -> list[IoTZonesIdResponse]:
        """Obtiene todos los nodos sensores registrados."""
        return get_zones_id(db)

    @staticmethod
    def list_mine_zones(db: Session) -> List[MineZoneResponse]:
        """Obtiene todas las Minas registradas."""
        return get_mine_zones(db=db)

    @staticmethod
    def list_mine_zones_paginated(
        db: Session, 
        page: int = 1, 
        per_page: int = 10,
        status_filter: Optional[str] = None
    ) -> PaginatedMineZoneResponse:
        """Obtiene Minas con paginación y filtros opcionales."""
        return get_mine_zones_paginated(
            db=db, 
            page=page, 
            per_page=per_page,
            status_filter=status_filter
        )

    @staticmethod
    def update_mine_zone(
        mine_id: uuid.UUID,
        mine_data: MineZoneUpdate,
        db: Session
    ) -> MineZoneResponse:
        """Actualiza una Mina existente."""
        mine_zone = get_mine_zone_by_id(db=db, mine_id=mine_id)
        if not mine_zone:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mina con id {mine_id} no encontrada"
            )
        
        # Verificar si el nuevo nombre ya existe (si se está actualizando el nombre)
        if mine_data.name and mine_data.name != mine_zone.name:
            existing_mine = get_mine_zone_by_name(db=db, name=mine_data.name)
            if existing_mine:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Mina con el nombre '{mine_data.name}' ya existe"
                )
        
        return update_mine_zone(db=db, mine_zone=mine_zone, mine_data=mine_data)

    @staticmethod
    def delete_mine_zone(mine_id: uuid.UUID, db: Session) -> None:
        """Elimina una Mina existente."""
        mine_zone = get_mine_zone_by_id(db=db, mine_id=mine_id)
        if not mine_zone:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mina con id {mine_id} no encontrada"
            )
        return delete_mine_zone(db=db, mine_id=mine_id)