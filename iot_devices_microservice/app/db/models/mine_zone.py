# db/models/mine_zone.py
from sqlalchemy import Column, String, text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.orm import relationship
from app.db.session import Base

class MineZone(Base):
    __tablename__ = "mine"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    nombre = Column(String(255), nullable=False)
    ubicacion = Column(String(255), nullable=True)
    provincia = Column(String(100), nullable=True)
    latitud = Column(String(50), nullable=True)
    longitud = Column(String(50), nullable=True)
    direccion = Column(String(255), nullable=True)
    empresa = Column(String(255), nullable=True)
    contacto = Column(String(255), nullable=True)
    estado = Column(String(20), default='activa')  # Nuevo campo: activa, inactiva, mantenimiento
    
    # Relaciones
    iot_gateways = relationship("IoTGateway", back_populates="mine_zone")
    
    def __repr__(self):
        return f"<MineZone(nombre='{self.nombre}', ubicacion='{self.ubicacion}', estado='{self.estado}')>"