from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.db.repository.user_repo import UserRepository
from app.db.schemas.user import UserCreate, UserLogin, UserResponse, UserUpdate, Token
from app.services.security import get_current_user_from_header  # Cambiar esta importación
from app.services.user import UserService

router = APIRouter()

def get_user_service(db: Session = Depends(get_db)) -> UserService:
    user_repository = UserRepository(db)
    return UserService(user_repository)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    user_create: UserCreate,
    user_service: UserService = Depends(get_user_service)
):
    try:
        return user_service.register_user(user_create)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=Token)
def login_user(
    login_data: UserLogin, 
    user_service: UserService = Depends(get_user_service)
):
    token = user_service.authenticate_user(login_data.username, login_data.password)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token

@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: str = Depends(get_current_user_from_header),  # Cambiar aquí
    user_service: UserService = Depends(get_user_service)
):
    user = user_service.get_current_user(current_user)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@router.get("/", response_model=List[UserResponse])
def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: str = Depends(get_current_user_from_header),  # Cambiar aquí
    user_service: UserService = Depends(get_user_service)
):
    # Verificar si el usuario actual es superuser para esta operación
    current_user_obj = user_service.get_current_user(current_user)
    if not current_user_obj or not current_user_obj.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para realizar esta acción"
        )
    
    return user_service.get_users(skip, limit)

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    current_user: str = Depends(get_current_user_from_header),  # Cambiar aquí
    user_service: UserService = Depends(get_user_service)
):
    # Un usuario solo puede ver su propio perfil a menos que sea superuser
    current_user_obj = user_service.get_current_user(current_user)
    if not current_user_obj.is_superuser and current_user_obj.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para ver este usuario"
        )
    
    user = user_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: str = Depends(get_current_user_from_header),  # Cambiar aquí
    user_service: UserService = Depends(get_user_service)
):
    # Un usuario solo puede actualizar su propio perfil a menos que sea superuser
    current_user_obj = user_service.get_current_user(current_user)
    if not current_user_obj.is_superuser and current_user_obj.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para actualizar este usuario"
        )
    
    user = user_service.update_user(user_id, user_update)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user: str = Depends(get_current_user_from_header),  # Cambiar aquí
    user_service: UserService = Depends(get_user_service)
):
    # Un usuario solo puede eliminar su propia cuenta a menos que sea superuser
    current_user_obj = user_service.get_current_user(current_user)
    if not current_user_obj.is_superuser and current_user_obj.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para eliminar este usuario"
        )
    
    if not user_service.delete_user(user_id):
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return {"message": "Usuario eliminado correctamente"}