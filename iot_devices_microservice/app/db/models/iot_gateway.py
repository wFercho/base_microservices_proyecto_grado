# db/models.py
from sqlalchemy import Column, String, text,Integer, Text,ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.orm import relationship
from app.db.session import Base

class IoTGateway(Base):
    __tablename__ = "iot_gateways"

    # ✅ CAMBIAR de UUID a SERIAL (Integer)
    id = Column(Integer, primary_key=True, autoincrement=True)  
    brand = Column(String(100), nullable=False)
    description = Column(Text) 
    mine_zone_id = Column(UUID(as_uuid=True), ForeignKey('mine.id', ondelete='SET NULL'), nullable=True)

    mine_zone = relationship("MineZone", back_populates="iot_gateways")
    sensor_nodes = relationship("SensorNode", back_populates="iot_gateway", cascade="all, delete-orphan", passive_deletes=True)