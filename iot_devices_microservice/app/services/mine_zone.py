from sqlalchemy.orm import Session
import uuid
from typing import Optional, List
from app.db.models.mine_zone import MineZone
from app.db.repository.mine_zone_repo import (
    create_mine,
    get_mine_by_id,
    get_mine_by_nombre,
    get_mines,
    get_mines_id,
    update_mine,
    delete_mine,
    get_mines_paginated
)
from app.db.schemas.mine_zone import (
    MinesIdResponse,
    MineCreate,
    MineResponse,
    MineUpdate,
    PaginatedMineResponse
)
from fastapi import HTTPException, status

class MineService:
    @staticmethod
    def create_mine(mine_data: MineCreate, db: Session) -> MineResponse:
        """Crea una nueva Mina en la base de datos."""
        # Verificar si ya existe una mina con el mismo nombre
        existing_mine = get_mine_by_nombre(db=db, nombre=mine_data.nombre)
        if existing_mine:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Mina con el nombre '{mine_data.nombre}' ya existe"
            )
        return create_mine(db=db, mine_data=mine_data)

    @staticmethod
    def get_mine(mine_id: uuid.UUID, db: Session) -> MineResponse:
        """Obtiene una Mina por su ID con todos sus gateways, nodos sensores y sensores."""
        mine = get_mine_by_id(db=db, mine_id=mine_id)
        if not mine:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mina con id {mine_id} no encontrada"
            )
        return mine

    @staticmethod
    def list_mines_ids(db: Session) -> MinesIdResponse:
        """Obtiene todos los IDs de minas registradas."""
        return get_mines_id(db)

    @staticmethod
    def list_mines(db: Session) -> List[MineResponse]:
        """Obtiene todas las Minas registradas."""
        return get_mines(db=db)

    @staticmethod
    def list_mines_paginated(
        db: Session, 
        page: int = 1, 
        per_page: int = 10
    ) -> PaginatedMineResponse:
        """Obtiene Minas con paginación."""
        return get_mines_paginated(
            db=db, 
            page=page, 
            per_page=per_page
        )

    @staticmethod
    def update_mine(
        mine_id: uuid.UUID,
        mine_data: MineUpdate,
        db: Session
    ) -> MineResponse:
        """Actualiza una Mina existente."""
        mine = get_mine_by_id(db=db, mine_id=mine_id)
        if not mine:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mina con id {mine_id} no encontrada"
            )
        
        # Verificar si el nuevo nombre ya existe (si se está actualizando el nombre)
        if mine_data.nombre and mine_data.nombre != mine.nombre:
            existing_mine = get_mine_by_nombre(db=db, nombre=mine_data.nombre)
            if existing_mine:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Mina con el nombre '{mine_data.nombre}' ya existe"
                )
        
        return update_mine(db=db, mine=mine, mine_data=mine_data)

    @staticmethod
    def delete_mine(mine_id: uuid.UUID, db: Session) -> None:
        """Elimina una Mina existente."""
        mine = get_mine_by_id(db=db, mine_id=mine_id)
        if not mine:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mina con id {mine_id} no encontrada"
            )
        return delete_mine(db=db, mine_id=mine_id)