# db/models/microservicios.py
from sqlalchemy import Column, String, DateTime, Float, Text, ForeignKey, text,Integer
from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.orm import relationship
from app.db.session import Base

class MicroservicioDispositivosIoT(Base):
    __tablename__ = "microservicio_dispositivos_iot"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    sensor_id = Column(Integer, ForeignKey('sensores.id', ondelete='CASCADE'), nullable=False)
    nodo_id = Column(String(50), ForeignKey('nodos_sensores.id', ondelete='CASCADE'), nullable=False)
    descripcion = Column(String(255))
    endpoint_api = Column(String(255))
    
    # Relaciones
    sensor = relationship("Sensor")
    nodo_sensor = relationship("SensorNode")

class MicroservicioAlertas(Base):
    __tablename__ = "microservicio_alertas"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    tipo_alerta = Column(String(50), nullable=False)
    umbral = Column(Float, nullable=False)
    unidad = Column(String(20), nullable=False)
    sensor_id = Column(Integer, ForeignKey('sensores.id', ondelete='CASCADE'), nullable=False)
    nodo_id = Column(String(50), ForeignKey('nodos_sensores.id', ondelete='CASCADE'), nullable=False)
    mina_id = Column(UUID(as_uuid=True), ForeignKey('mine.id', ondelete='CASCADE'), nullable=False)
    mensaje_alerta = Column(String(500))
    
    # Relaciones
    sensor = relationship("Sensor")
    nodo_sensor = relationship("SensorNode")
    mina = relationship("MineZone")

class MicroservicioStorage(Base):
    __tablename__ = "microservicio_storage"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    sensor_id = Column(Integer, ForeignKey('sensores.id', ondelete='CASCADE'), nullable=False)
    nodo_id = Column(String(50), ForeignKey('nodos_sensores.id', ondelete='CASCADE'), nullable=False)
    mina_id = Column(UUID(as_uuid=True), ForeignKey('mine.id', ondelete='CASCADE'), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    valor = Column(Float, nullable=False)
    unidad = Column(String(20), nullable=False)
    
    # Relaciones
    sensor = relationship("Sensor")
    nodo_sensor = relationship("SensorNode")
    mina = relationship("MineZone")

class MicroservicioMinas(Base):
    __tablename__ = "microservicio_minas"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    mina_id = Column(UUID(as_uuid=True), ForeignKey('mine.id', ondelete='CASCADE'), nullable=False)
    descripcion = Column(Text)
    responsable = Column(String(255))
    
    # Relación
    mina = relationship("MineZone")

class MicroservicioNotificaciones(Base):
    __tablename__ = "microservicio_notificaciones"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    sensor_id = Column(Integer, ForeignKey('sensores.id', ondelete='CASCADE'))
    nodo_id = Column(String(50), ForeignKey('nodos_sensores.id', ondelete='CASCADE'))
    mina_id = Column(UUID(as_uuid=True), ForeignKey('mine.id', ondelete='CASCADE'))
    mensaje = Column(Text, nullable=False)
    destino = Column(String(255), nullable=False)
    tipo = Column(String(50), nullable=False)
    fecha = Column(DateTime, nullable=False)
    
    # Relaciones
    sensor = relationship("Sensor")
    nodo_sensor = relationship("SensorNode")
    mina = relationship("MineZone")

class MicroservicioReglas(Base):
    __tablename__ = "microservicio_reglas"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    expresion_logica = Column(Text, nullable=False)
    sensor_id = Column(Integer, ForeignKey('sensores.id', ondelete='CASCADE'), nullable=False)
    nodo_id = Column(String(50), ForeignKey('nodos_sensores.id', ondelete='CASCADE'))
    mina_id = Column(UUID(as_uuid=True), ForeignKey('mine.id', ondelete='CASCADE'))
    
    # Relaciones
    sensor = relationship("Sensor")
    nodo_sensor = relationship("SensorNode")
    mina = relationship("MineZone")