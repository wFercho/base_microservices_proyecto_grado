package db

import (
	"time"

	"github.com/google/uuid"
	"github.com/wFercho/mines_microservice/internal/domain/mine"
)

type MinePostgresModel struct {
	ID        uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Nombre    string    `gorm:"size:255;not null"`
	Ubicacion string    `gorm:"size:255"`
	Provincia string    `gorm:"size:100"`
	Latitud   string    `gorm:"size:50"`
	Longitud  string    `gorm:"size:50"`
	Direccion string    `gorm:"size:255"`
	Empresa   string    `gorm:"size:255"`
	Contacto  string    `gorm:"size:255"`
	Estado    string    `gorm:"size:20;default:'activa'"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (MinePostgresModel) TableName() string {
	return "mine"
}

func (mm *MinePostgresModel) ToDomain() *mine.Mine {
	return &mine.Mine{
		ID:        mm.ID,
		Nombre:    mm.Nombre,
		Ubicacion: mm.Ubicacion,
		Provincia: mm.Provincia,
		Latitud:   mm.Latitud,
		Longitud:  mm.Longitud,
		Direccion: mm.Direccion,
		Empresa:   mm.Empresa,
		Contacto:  mm.Contacto,
		Estado:    mm.Estado,
		CreatedAt: mm.CreatedAt,
		UpdatedAt: mm.UpdatedAt,
	}
}

func FromDomainToMinePostgresModel(m *mine.Mine) *MinePostgresModel {
	return &MinePostgresModel{
		ID:        m.ID,
		Nombre:    m.Nombre,
		Ubicacion: m.Ubicacion,
		Provincia: m.Provincia,
		Latitud:   m.Latitud,
		Longitud:  m.Longitud,
		Direccion: m.Direccion,
		Empresa:   m.Empresa,
		Contacto:  m.Contacto,
		Estado:    m.Estado,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
}
