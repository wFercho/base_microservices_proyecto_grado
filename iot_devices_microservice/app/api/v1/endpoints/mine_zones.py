from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.services.mine_zone import MineService
from app.db.schemas.mine_zone import (
    MinesIdResponse,
    MineCreate,
    MineResponse,
    MineUpdate,
    PaginatedMineResponse
)
from app.db.session import get_db
import uuid

router = APIRouter()

@router.post("/", response_model=MineResponse, status_code=201)
def create_mine(mine: MineCreate, db: Session = Depends(get_db)):
    """Crea una nueva Mina."""
    return MineService.create_mine(mine, db)

@router.get("/", response_model=List[MineResponse])
def list_mines(db: Session = Depends(get_db)):
    """Lista todas las Minas."""
    return MineService.list_mines(db)

@router.get("/ids", response_model=MinesIdResponse)
def get_mine_ids(db: Session = Depends(get_db)):
    """Obtiene una lista de ids de Minas."""
    return MineService.list_mines_ids(db)

@router.get("/paginated/", response_model=PaginatedMineResponse)
def list_mines_paginated(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Lista Minas con paginación."""
    return MineService.list_mines_paginated(
        db, 
        page=page, 
        per_page=per_page
    )

@router.get("/{mine_id}", response_model=MineResponse)
def get_mine(mine_id: uuid.UUID, db: Session = Depends(get_db)):
    """Obtiene una Mina específica con todos sus gateways, nodos sensores y sensores."""
    return MineService.get_mine(mine_id, db)

@router.put("/{mine_id}", response_model=MineResponse)
def update_mine(
    mine_id: uuid.UUID,
    mine: MineUpdate,
    db: Session = Depends(get_db)
):
    """Actualiza una Mina existente."""
    return MineService.update_mine(mine_id, mine, db)

@router.delete("/{mine_id}", status_code=204)
def delete_mine(mine_id: uuid.UUID, db: Session = Depends(get_db)):
    """Elimina una Mina existente."""
    MineService.delete_mine(mine_id, db)