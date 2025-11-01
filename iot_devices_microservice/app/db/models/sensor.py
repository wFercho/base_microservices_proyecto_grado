from sqlalchemy import Column, String, Float, Integer, ForeignKey, text, Text, Numeric,Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

import uuid
from app.db.session import Base

class Sensor(Base):
    __tablename__ = "sensores"

    # ✅ CAMBIAR de UUID a SERIAL (Integer)
    id = Column(Integer, primary_key=True, autoincrement=True)  # ✅ SERIAL
    id_node = Column(String(50), ForeignKey("nodos_sensores.id", ondelete="CASCADE"))
    variable = Column(String(50), nullable=False)
    marca = Column(String(100), nullable=False)
    referencia = Column(String(50), nullable=False)
    unidad_medicion = Column(String(20))
    
    # ✅ Usar Numeric (DECIMAL) en lugar de Float
    max_medicion = Column(Numeric(10,2))
    min_medicion = Column(Numeric(10,2))
    precision = Column(Numeric(10,2))
    
    tiempo_respuesta_valor = Column(Integer)
    tiempo_respuesta_unidad = Column(String(10))
    resolucion = Column(Numeric(10,3))
    temperatura_max = Column(Numeric(6,1))
    temperatura_min = Column(Numeric(6,1))
    voltaje_tipo = Column(String(10))
    voltaje_min = Column(Numeric(4,1))
    voltaje_max = Column(Numeric(4,1))
    corriente_min = Column(Numeric(4,2))
    corriente_max = Column(Numeric(4,2))
    durabilidad_valor = Column(Integer)
    durabilidad_unidad = Column(String(10))
    modo_instalacion = Column(String(50))
    tipo_salida = Column(Text)  # ✅ Text
    certificados = Column(Text)  # ✅ Text

    sensor_node = relationship("SensorNode", back_populates="sensors", passive_deletes=True)