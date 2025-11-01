# services.py
from sqlalchemy.orm import Session
from typing import Optional, List
from app.db.models.iot_gateway import IoTGateway
from app.db.repository.iot_gateway_repo import (
    create_iot_gateway,
    get_iot_gateway_by_id,
    get_iot_gateways,
    get_iot_gateways_ids,
    update_iot_gateway,
    delete_iot_gateway,
    get_iot_gateways_paginated
)
from app.db.schemas.iot_gateway import (
    IoTGatewayCreate,
    IoTGatewayResponse,
    IoTGatewaySIdResponse,
    IoTGatewayUpdate,
    PaginatedResponse
)
from fastapi import HTTPException, status

class IoTGatewayService:
    @staticmethod
    def create_iot_gateway(gateway_data: IoTGatewayCreate, db: Session) -> IoTGatewayResponse:
        """Crea un nuevo IoT Gateway en la base de datos."""
        return create_iot_gateway(db=db, gateway_data=gateway_data)

    @staticmethod
    def get_iot_gateway(gateway_id: int, db: Session) -> IoTGatewayResponse:
        """Obtiene un IoT Gateway por su ID con todos sus nodos sensores y sensores."""
        gateway = get_iot_gateway_by_id(db=db, gateway_id=gateway_id)
        if not gateway:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"IoT Gateway with id {gateway_id} not found"
            )
        return gateway

    @staticmethod
    def list_iot_gateways(db: Session) -> List[IoTGatewayResponse]:
        """Obtiene todos los IoT Gateways registrados."""
        return get_iot_gateways(db=db)

    @staticmethod
    def list_iot_gateways_ids(db: Session) -> list[IoTGatewaySIdResponse]:
        """Obtiene todos los nodos sensores registrados."""
        return get_iot_gateways_ids(db)

    @staticmethod
    def list_iot_gateways_paginated(
        db: Session, 
        page: int = 1, 
        per_page: int = 10
    ) -> PaginatedResponse:
        """Obtiene IoT Gateways con paginación."""
        return get_iot_gateways_paginated(db=db, page=page, per_page=per_page)

    @staticmethod
    def update_iot_gateway(
        gateway_id: int,
        gateway_data: IoTGatewayUpdate,
        db: Session
    ) -> IoTGatewayResponse:
        """Actualiza un IoT Gateway existente."""
        gateway = get_iot_gateway_by_id(db=db, gateway_id=gateway_id)
        if not gateway:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"IoT Gateway with id {gateway_id} not found"
            )
        return update_iot_gateway(db=db, gateway=gateway, gateway_data=gateway_data)

    @staticmethod
    def delete_iot_gateway(gateway_id: int, db: Session) -> None:
        """Elimina un IoT Gateway existente."""
        gateway = get_iot_gateway_by_id(db=db, gateway_id=gateway_id)
        if not gateway:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"IoT Gateway with id {gateway_id} not found"
            )
        return delete_iot_gateway(db=db, gateway_id=gateway_id)