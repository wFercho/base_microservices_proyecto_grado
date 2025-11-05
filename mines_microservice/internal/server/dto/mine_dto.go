package dto

import (
	"time"

	"github.com/wFercho/mines_microservice/internal/domain/mine"
)

type MineRequestDTO struct {
	Nombre    string `json:"nombre" validate:"required"`
	Ubicacion string `json:"ubicacion"`
	Provincia string `json:"provincia"`
	Latitud   string `json:"latitud"`
	Longitud  string `json:"longitud"`
	Direccion string `json:"direccion"`
	Empresa   string `json:"empresa"`
	Contacto  string `json:"contacto"`
	Estado    string `json:"estado"`
}

type MineResponseDTO struct {
	ID        string    `json:"id"`
	Nombre    string    `json:"nombre"`
	Ubicacion string    `json:"ubicacion"`
	Provincia string    `json:"provincia"`
	Latitud   string    `json:"latitud"`
	Longitud  string    `json:"longitud"`
	Direccion string    `json:"direccion"`
	Empresa   string    `json:"empresa"`
	Contacto  string    `json:"contacto"`
	Estado    string    `json:"estado"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type MineUpdateRequestDTO struct {
	Nombre    string `json:"nombre"`
	Ubicacion string `json:"ubicacion"`
	Provincia string `json:"provincia"`
	Latitud   string `json:"latitud"`
	Longitud  string `json:"longitud"`
	Direccion string `json:"direccion"`
	Empresa   string `json:"empresa"`
	Contacto  string `json:"contacto"`
	Estado    string `json:"estado"`
}

func (dto *MineRequestDTO) ToDomain() (*mine.Mine, error) {
	return mine.NewMineZone(
		dto.Nombre,
		dto.Ubicacion,
		dto.Provincia,
		dto.Latitud,
		dto.Longitud,
		dto.Direccion,
		dto.Empresa,
		dto.Contacto,
		dto.Estado,
	)
}

func FromMineDomain(mineDomain *mine.Mine) MineResponseDTO {
	return MineResponseDTO{
		ID:        mineDomain.ID.String(),
		Nombre:    mineDomain.Nombre,
		Ubicacion: mineDomain.Ubicacion,
		Provincia: mineDomain.Provincia,
		Latitud:   mineDomain.Latitud,
		Longitud:  mineDomain.Longitud,
		Direccion: mineDomain.Direccion,
		Empresa:   mineDomain.Empresa,
		Contacto:  mineDomain.Contacto,
		Estado:    mineDomain.Estado,
		CreatedAt: mineDomain.CreatedAt,
		UpdatedAt: mineDomain.UpdatedAt,
	}
}

func (dto *MineUpdateRequestDTO) UpdateDomain(mineDomain *mine.Mine) {
	mineDomain.Update(
		dto.Nombre,
		dto.Ubicacion,
		dto.Provincia,
		dto.Latitud,
		dto.Longitud,
		dto.Direccion,
		dto.Empresa,
		dto.Contacto,
		dto.Estado,
	)
}
