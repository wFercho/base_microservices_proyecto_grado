from sqlalchemy import Column, String, text, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.orm import relationship
from app.db.session import Base
from sqlalchemy.sql import func

class MineZone(Base):
    __tablename__ = "mine_zones"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    location = Column(String(200), nullable=True)
    zone_type = Column(String(50), nullable=False)  
    status = Column(String(20), default='active')  
    
    # Información adicional para minas
    mine_type = Column(String(50), nullable=True) 
    coordinates = Column(String(100), nullable=True) 
    depth = Column(String(50), nullable=True) 
    area = Column(String(50), nullable=True)  
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    iot_gateways = relationship("IoTGateway", back_populates="mine_zone")
    
    def __repr__(self):
        return f"<MineZone(name='{self.name}', type='{self.zone_type}')>"

