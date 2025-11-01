# db/models.py
from sqlalchemy import Column, String, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.orm import relationship
from app.db.session import Base

class SensorNode(Base):
    __tablename__ = "nodos_sensores"

    id = Column(String(50), primary_key=True) 
    brand = Column(String(100), nullable=False) 
    description = Column(Text)  # ✅ Text
    zone_name = Column(String(100), nullable=True)
    zone_category = Column(String(50), nullable=True)
    id_iot_gateway = Column(Integer, ForeignKey('iot_gateways.id', ondelete='CASCADE'))
    
    iot_gateway = relationship("IoTGateway", back_populates="sensor_nodes")
    sensors = relationship("Sensor", back_populates="sensor_node", cascade="all, delete-orphan", passive_deletes=True)