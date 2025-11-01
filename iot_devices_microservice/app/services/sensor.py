from sqlalchemy.orm import Session
from app.db.repository.sensor_repo import (
    create_sensor, 
    get_sensors, 
    get_sensor,
    update_sensor,
    delete_sensor,
    get_sensors_by_node,
    get_sensors_paginated,
    get_sensors_by_node_paginated
)
from app.db.schemas.sensor import SensorCreate, SensorResponse, SensorUpdate,PaginatedSensorResponse

class SensorService:
    @staticmethod
    def create_sensor(sensor_data: SensorCreate, db: Session) -> SensorResponse:
        """Crea un nuevo sensor en la base de datos."""
        return create_sensor(db, sensor_data)

    @staticmethod
    def list_sensors(db: Session) -> list[SensorResponse]:
        """Obtiene todos los sensores registrados con paginación."""
        return get_sensors(db)

    @staticmethod
    def get_sensor(sensor_id: int, db: Session) -> SensorResponse:
        """Obtiene un sensor específico por su ID."""
        return get_sensor(db, sensor_id)

    @staticmethod
    def update_sensor(
        sensor_id: int, 
        sensor_data: SensorUpdate, 
        db: Session
    ) -> SensorResponse:
        """Actualiza un sensor existente."""
        return update_sensor(db, sensor_id, sensor_data)

    @staticmethod
    def delete_sensor(sensor_id: int, db: Session) -> SensorResponse:
        """Elimina un sensor."""
        return delete_sensor(db, sensor_id)

    @staticmethod
    def list_sensors_by_node(
        node_id: str, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100
    ) -> list[SensorResponse]:
        """Obtiene sensores asociados a un nodo específico."""
        return get_sensors_by_node(db, node_id, skip, limit)
    
    @staticmethod
    def get_sensors_paginated(
        db: Session, 
        page: int = 1, 
        per_page: int = 10
    ) -> PaginatedSensorResponse:
        """Obtiene sensores paginados con metadatos"""
        paginated_data = get_sensors_paginated(db, page, per_page)
        return PaginatedSensorResponse(**paginated_data)

    @staticmethod
    def get_sensors_by_node_paginated(
        db: Session,
        node_id: str,
        page: int = 1,
        per_page: int = 10
    ) -> PaginatedSensorResponse:
        """Obtiene sensores de un nodo paginados"""
        paginated_data = get_sensors_by_node_paginated(db, node_id, page, per_page)
        return PaginatedSensorResponse(**paginated_data)