package sensors

import (
	"time"
)

type Sensor struct {
	ID                    int        `json:"id" db:"id"`
	IDNode                string     `json:"id_node" db:"id_node"`
	Variable              string     `json:"variable" db:"variable"`
	Marca                 string     `json:"marca" db:"marca"`
	Referencia            string     `json:"referencia" db:"referencia"`
	UnidadMedicion        string     `json:"unidad_medicion" db:"unidad_medicion"`
	MaxMedicion           float64    `json:"max_medicion" db:"max_medicion"`
	MinMedicion           float64    `json:"min_medicion" db:"min_medicion"`
	Precision             float64    `json:"precision" db:"precision"`
	TiempoRespuestaValor  int        `json:"tiempo_respuesta_valor" db:"tiempo_respuesta_valor"`
	TiempoRespuestaUnidad string     `json:"tiempo_respuesta_unidad" db:"tiempo_respuesta_unidad"`
	Resolucion            float64    `json:"resolucion" db:"resolucion"`
	TemperaturaMax        float64    `json:"temperatura_max" db:"temperatura_max"`
	TemperaturaMin        float64    `json:"temperatura_min" db:"temperatura_min"`
	VoltajeTipo           string     `json:"voltaje_tipo" db:"voltaje_tipo"`
	VoltajeMin            float64    `json:"voltaje_min" db:"voltaje_min"`
	VoltajeMax            float64    `json:"voltaje_max" db:"voltaje_max"`
	CorrienteMin          float64    `json:"corriente_min" db:"corriente_min"`
	CorrienteMax          float64    `json:"corriente_max" db:"corriente_max"`
	DurabilidadValor      int        `json:"durabilidad_valor" db:"durabilidad_valor"`
	DurabilidadUnidad     string     `json:"durabilidad_unidad" db:"durabilidad_unidad"`
	ModoInstalacion       string     `json:"modo_instalacion" db:"modo_instalacion"`
	TipoSalida            string     `json:"tipo_salida" db:"tipo_salida"`
	Certificados          string     `json:"certificados" db:"certificados"`
	CreatedAt             time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt             *time.Time `json:"updated_at" db:"updated_at"`
}

func (Sensor) TableName() string {
	return "sensores"
}

// SensorCreate representa los datos necesarios para crear un nuevo sensor
type SensorCreate struct {
	IDNode                string   `json:"id_node" db:"id_node" validate:"required"`
	Variable              string   `json:"variable" db:"variable" validate:"required"`
	Marca                 string   `json:"marca" db:"marca" validate:"required"`
	Referencia            string   `json:"referencia" db:"referencia"`
	UnidadMedicion        string   `json:"unidad_medicion" db:"unidad_medicion"`
	MaxMedicion           *float64 `json:"max_medicion" db:"max_medicion"`
	MinMedicion           *float64 `json:"min_medicion" db:"min_medicion"`
	Precision             *float64 `json:"precision" db:"precision"`
	TiempoRespuestaValor  *int     `json:"tiempo_respuesta_valor" db:"tiempo_respuesta_valor"`
	TiempoRespuestaUnidad string   `json:"tiempo_respuesta_unidad" db:"tiempo_respuesta_unidad"`
	Resolucion            *float64 `json:"resolucion" db:"resolucion"`
	TemperaturaMax        *float64 `json:"temperatura_max" db:"temperatura_max"`
	TemperaturaMin        *float64 `json:"temperatura_min" db:"temperatura_min"`
	VoltajeTipo           string   `json:"voltaje_tipo" db:"voltaje_tipo"`
	VoltajeMin            *float64 `json:"voltaje_min" db:"voltaje_min"`
	VoltajeMax            *float64 `json:"voltaje_max" db:"voltaje_max"`
	CorrienteMin          *float64 `json:"corriente_min" db:"corriente_min"`
	CorrienteMax          *float64 `json:"corriente_max" db:"corriente_max"`
	DurabilidadValor      *int     `json:"durabilidad_valor" db:"durabilidad_valor"`
	DurabilidadUnidad     string   `json:"durabilidad_unidad" db:"durabilidad_unidad"`
	ModoInstalacion       string   `json:"modo_instalacion" db:"modo_instalacion"`
	TipoSalida            string   `json:"tipo_salida" db:"tipo_salida"`
	Certificados          string   `json:"certificados" db:"certificados"`
}

// SensorUpdate representa los datos que se pueden actualizar de un sensor
type SensorUpdate struct {
	Variable              *string  `json:"variable,omitempty" db:"variable"`
	Marca                 *string  `json:"marca,omitempty" db:"marca"`
	Referencia            *string  `json:"referencia,omitempty" db:"referencia"`
	UnidadMedicion        *string  `json:"unidad_medicion,omitempty" db:"unidad_medicion"`
	MaxMedicion           *float64 `json:"max_medicion,omitempty" db:"max_medicion"`
	MinMedicion           *float64 `json:"min_medicion,omitempty" db:"min_medicion"`
	Precision             *float64 `json:"precision,omitempty" db:"precision"`
	TiempoRespuestaValor  *int     `json:"tiempo_respuesta_valor,omitempty" db:"tiempo_respuesta_valor"`
	TiempoRespuestaUnidad *string  `json:"tiempo_respuesta_unidad,omitempty" db:"tiempo_respuesta_unidad"`
	Resolucion            *float64 `json:"resolucion,omitempty" db:"resolucion"`
	TemperaturaMax        *float64 `json:"temperatura_max,omitempty" db:"temperatura_max"`
	TemperaturaMin        *float64 `json:"temperatura_min,omitempty" db:"temperatura_min"`
	VoltajeTipo           *string  `json:"voltaje_tipo,omitempty" db:"voltaje_tipo"`
	VoltajeMin            *float64 `json:"voltaje_min,omitempty" db:"voltaje_min"`
	VoltajeMax            *float64 `json:"voltaje_max,omitempty" db:"voltaje_max"`
	CorrienteMin          *float64 `json:"corriente_min,omitempty" db:"corriente_min"`
	CorrienteMax          *float64 `json:"corriente_max,omitempty" db:"corriente_max"`
	DurabilidadValor      *int     `json:"durabilidad_valor,omitempty" db:"durabilidad_valor"`
	DurabilidadUnidad     *string  `json:"durabilidad_unidad,omitempty" db:"durabilidad_unidad"`
	ModoInstalacion       *string  `json:"modo_instalacion,omitempty" db:"modo_instalacion"`
	TipoSalida            *string  `json:"tipo_salida,omitempty" db:"tipo_salida"`
	Certificados          *string  `json:"certificados,omitempty" db:"certificados"`
}
