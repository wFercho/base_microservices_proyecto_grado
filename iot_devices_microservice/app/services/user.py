from app.db.repository.user_repo import UserRepository
from app.db.schemas.user import UserCreate, UserUpdate, UserResponse, Token
from app.services.security import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
from typing import Optional

class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def register_user(self, user_create: UserCreate) -> UserResponse:
        # Verificar si el usuario ya existe
        if self.user_repository.get_by_email(user_create.email):
            raise ValueError("El email ya está registrado")
        
        if self.user_repository.get_by_username(user_create.username):
            raise ValueError("El nombre de usuario ya está en uso")
        
        # Crear usuario
        user = self.user_repository.create(user_create)
        return UserResponse.model_validate(user)

    def authenticate_user(self, username: str, password: str) -> Optional[Token]:
        user = self.user_repository.authenticate(username, password)
        if not user:
            return None
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

    def get_user(self, user_id: int) -> Optional[UserResponse]:
        user = self.user_repository.get_by_id(user_id)
        return UserResponse.model_validate(user) if user else None

    def get_users(self, skip: int = 0, limit: int = 100) -> list[UserResponse]:
        users = self.user_repository.get_all(skip, limit)
        return [UserResponse.model_validate(user) for user in users]

    def update_user(self, user_id: int, user_update: UserUpdate) -> Optional[UserResponse]:
        user = self.user_repository.update(user_id, user_update)
        return UserResponse.model_validate(user) if user else None

    def delete_user(self, user_id: int) -> bool:
        return self.user_repository.delete(user_id)

    def get_current_user(self, username: str) -> Optional[UserResponse]:
        user = self.user_repository.get_by_username(username)
        return UserResponse.model_validate(user) if user else None