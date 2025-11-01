package db

import (
	"time"

	"github.com/google/uuid"
	"github.com/wFercho/mines_microservice/internal/domain/mine"
)

type MinePostgresModel struct {
	ID          uuid.UUID `gorm:"primaryKey"`
	Name        string    `gorm:"size:100;not null;unique"`
	Description string    `gorm:"type:text"`
	Location    string    `gorm:"size:200"`
	ZoneType    string    `gorm:"size:50;not null"`
	Status      string    `gorm:"size:20;default:'active'"`
	MineType    string    `gorm:"size:50"`
	Coordinates string    `gorm:"size:100"`
	Depth       string    `gorm:"size:50"`
	Area        string    `gorm:"size:50"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (MinePostgresModel) TableName() string {
	return "mine_zones"
}

func (mm *MinePostgresModel) ToDomain() *mine.Mine {
	return &mine.Mine{
		ID:          mm.ID,
		Name:        mm.Name,
		Description: mm.Description,
		Location:    mm.Location,
		ZoneType:    mm.ZoneType,
		Status:      mm.Status,
		MineType:    mm.MineType,
		Coordinates: mm.Coordinates,
		Depth:       mm.Depth,
		Area:        mm.Area,
		CreatedAt:   mm.CreatedAt,
		UpdatedAt:   mm.UpdatedAt,
	}
}

func FromDomainToMinePostgresModel(m *mine.Mine) *MinePostgresModel {
	return &MinePostgresModel{
		ID:          m.ID,
		Name:        m.Name,
		Description: m.Description,
		Location:    m.Location,
		ZoneType:    m.ZoneType,
		Status:      m.Status,
		MineType:    m.MineType,
		Coordinates: m.Coordinates,
		Depth:       m.Depth,
		Area:        m.Area,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
}
