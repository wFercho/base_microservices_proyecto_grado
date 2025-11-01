from pydantic import BaseModel, Field, field_validator, confloat, conint
from typing import Optional, Literal, List
from enum import Enum
import uuid
from datetime import datetime

# Enums para valores predefinidos
class TiempoUnidad(str, Enum):
    SEGUNDOS = "s"
    MINUTOS = "min"
    HORAS = "h"
    MILISEGUNDOS = "ms"

class VoltajeTipo(str, Enum):
    DC = "DC"
    AC = "AC"
    BATERIA = "batería"
    SOLAR = "solar"

class ModoInstalacion(str, Enum):
    EMPOTRADO = "Empotrado"
    SUPERFICIE = "Superficie"
    PORTATIL = "Portátil"
    EMBEBIDO = "Embebido"

class TipoSalida(str, Enum):
    DIGITAL = "Digital"
    ANALOGICA = "Analógica"
    MODBUS = "Modbus"
    RS485 = "RS485"
    PWM = "PWM"
    I2C = "I2C"
    SPI = "SPI"

class VariableTipo(str, Enum):
    PM10 = "PM10"
    TEMPERATURA = "Temperatura"
    HUMEDAD = "Humedad"
    PM25 = "PM2.5"
    PRESION = "Presión"
    CO2 = "CO2"
    VOC = "VOC"
    LUMINOSIDAD = "Luminosidad"
    RUIDO = "Ruido"

class SensorBase(BaseModel):
    """Esquema base con campos requeridos"""
    variable: VariableTipo = Field(..., description="Tipo de variable medida")
    marca: str = Field(..., min_length=2, max_length=50, description="Fabricante del sensor")
    referencia: str = Field(..., min_length=2, max_length=50, description="Modelo del sensor")

class SensorCreate(SensorBase):
    """Esquema para creación de sensores"""
    id_node: Optional[str] = Field(
        None, 
        pattern="^node_\d+$", 
        description="ID del nodo en formato 'node_X'"
    )
    unidad_medicion: Optional[str] = Field(
        None, 
        max_length=10, 
        description="Unidad de medida (ej. '°C', '%', 'µg/m³')"
    )
    max_medicion: Optional[confloat(ge=0)] = Field(
        None, 
        description="Valor máximo de medición"
    )
    min_medicion: Optional[confloat(ge=0)] = Field(
        None, 
        description="Valor mínimo de medición"
    )
    precision: Optional[confloat(ge=0)] = Field(
        None, 
        description="Precisión del sensor"
    )
    tiempo_respuesta_valor: Optional[conint(ge=0)] = Field(
        None, 
        description="Valor del tiempo de respuesta"
    )
    tiempo_respuesta_unidad: Optional[TiempoUnidad] = Field(
        None, 
        description="Unidad del tiempo de respuesta"
    )
    resolucion: Optional[confloat(ge=0)] = Field(
        None, 
        description="Resolución del sensor"
    )
    temperatura_max: Optional[confloat(ge=-273)] = Field(
        None, 
        description="Temperatura máxima de operación"
    )
    temperatura_min: Optional[confloat(ge=-273)] = Field(
        None, 
        description="Temperatura mínima de operación"
    )
    voltaje_tipo: Optional[VoltajeTipo] = Field(
        None, 
        description="Tipo de alimentación eléctrica"
    )
    voltaje_min: Optional[confloat(ge=0)] = Field(
        None, 
        description="Voltaje mínimo de operación"
    )
    voltaje_max: Optional[confloat(ge=0)] = Field(
        None, 
        description="Voltaje máximo de operación"
    )
    corriente_min: Optional[confloat(ge=0)] = Field(
        None, 
        description="Corriente mínima de operación"
    )
    corriente_max: Optional[confloat(ge=0)] = Field(
        None, 
        description="Corriente máxima de operación"
    )
    durabilidad_valor: Optional[conint(ge=0)] = Field(
        None, 
        description="Valor de durabilidad"
    )
    durabilidad_unidad: Optional[str] = Field(
        None, 
        max_length=10, 
        description="Unidad de durabilidad (ej. 'años', 'horas')"
    )
    modo_instalacion: Optional[ModoInstalacion] = Field(
        None, 
        description="Modo de instalación recomendado"
    )

    certificados: Optional[str] = Field(
        None, 
        description="Certificaciones (ej. 'CE, ISO 14001')",
        pattern="^[a-zA-Z0-9, ]+$"
    )

   


class SensorResponse(SensorBase):
    """Esquema para respuesta de la API"""
   
    
    # Todos los campos opcionales
    id: int = None
    id_node: Optional[str] = None
    unidad_medicion: Optional[str] = None
    max_medicion: Optional[float] = None
    min_medicion: Optional[float] = None
    precision: Optional[float] = None
    tiempo_respuesta_valor: Optional[int] = None
    tiempo_respuesta_unidad: Optional[str] = None
    resolucion: Optional[float] = None
    temperatura_max: Optional[float] = None
    temperatura_min: Optional[float] = None
    voltaje_tipo: Optional[str] = None
    voltaje_min: Optional[float] = None
    voltaje_max: Optional[float] = None
    corriente_min: Optional[float] = None
    corriente_max: Optional[float] = None
    durabilidad_valor: Optional[int] = None
    durabilidad_unidad: Optional[str] = None
    modo_instalacion: Optional[str] = None
    tipo_salida: Optional[str] = None
    certificados: Optional[str] = None

    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }
        from_attributes = True

class SensorUpdate(BaseModel):
    """Esquema para actualización parcial"""
    id: int = None
    variable: Optional[VariableTipo] = None
    marca: Optional[str] = None
    referencia: Optional[str] = None
    id_node: Optional[str] = None
    unidad_medicion: Optional[str] = None
    max_medicion: Optional[confloat(ge=0)] = None
    min_medicion: Optional[confloat(le=0)] = None
    precision: Optional[confloat(gt=0)] = None
    tiempo_respuesta_valor: Optional[conint(gt=0)] = None
    tiempo_respuesta_unidad: Optional[TiempoUnidad] = None
    resolucion: Optional[confloat(gt=0)] = None
    temperatura_max: Optional[confloat(ge=-273)] = None
    temperatura_min: Optional[confloat(ge=-273)] = None
    voltaje_tipo: Optional[VoltajeTipo] = None
    voltaje_min: Optional[confloat(ge=0)] = None
    voltaje_max: Optional[confloat(ge=0)] = None
    corriente_min: Optional[confloat(ge=0)] = None
    corriente_max: Optional[confloat(ge=0)] = None
    durabilidad_valor: Optional[conint(gt=0)] = None
    durabilidad_unidad: Optional[str] = None
    modo_instalacion: Optional[ModoInstalacion] = None
    tipo_salida: Optional[str] = None
    certificados: Optional[str] = None

  
class PaginatedSensorResponse(BaseModel):
    total: int
    page: int
    per_page: int
    items: List[SensorResponse]