package mine

import (
	"time"

	"github.com/google/uuid"
)

type Mine struct {
	ID        uuid.UUID `json:"id" db:"id"`
	Nombre    string    `json:"nombre" db:"nombre"`
	Ubicacion string    `json:"ubicacion" db:"ubicacion"`
	Provincia string    `json:"provincia" db:"provincia"`
	Latitud   string    `json:"latitud" db:"latitud"`
	Longitud  string    `json:"longitud" db:"longitud"`
	Direccion string    `json:"direccion" db:"direccion"`
	Empresa   string    `json:"empresa" db:"empresa"`
	Contacto  string    `json:"contacto" db:"contacto"`
	Estado    string    `json:"estado" db:"estado"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

func NewMineZone(nombre, ubicacion, provincia, latitud, longitud, direccion, empresa, contacto, estado string) (*Mine, error) {
	now := time.Now()

	// Validar estado por defecto
	if estado == "" {
		estado = "activa"
	}

	return &Mine{
		ID:        uuid.New(),
		Nombre:    nombre,
		Ubicacion: ubicacion,
		Provincia: provincia,
		Latitud:   latitud,
		Longitud:  longitud,
		Direccion: direccion,
		Empresa:   empresa,
		Contacto:  contacto,
		Estado:    estado,
		CreatedAt: now,
		UpdatedAt: now,
	}, nil
}

// Método para actualizar los campos
func (m *Mine) Update(nombre, ubicacion, provincia, latitud, longitud, direccion, empresa, contacto, estado string) {
	m.Nombre = nombre
	m.Ubicacion = ubicacion
	m.Provincia = provincia
	m.Latitud = latitud
	m.Longitud = longitud
	m.Direccion = direccion
	m.Empresa = empresa
	m.Contacto = contacto
	m.Estado = estado
	m.UpdatedAt = time.Now()
}
