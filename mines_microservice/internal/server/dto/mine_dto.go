package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/wFercho/mines_microservice/internal/domain/mine"
)

type MineRequestDTO struct {
	Name        string `json:"name" validate:"required"`
	Description string `json:"description"`
	Location    string `json:"location"`
	ZoneType    string `json:"zone_type" validate:"required"`
	Status      string `json:"status"`
	MineType    string `json:"mine_type"`
	Coordinates string `json:"coordinates"`
	Depth       string `json:"depth"`
	Area        string `json:"area"`
}

type MineResponseDTO struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Location    string    `json:"location"`
	ZoneType    string    `json:"zone_type"`
	Status      string    `json:"status"`
	MineType    string    `json:"mine_type"`
	Coordinates string    `json:"coordinates"`
	Depth       string    `json:"depth"`
	Area        string    `json:"area"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (dto *MineRequestDTO) ToDomain() (*mine.Mine, error) {
	now := time.Now()
	return &mine.Mine{
		ID:          uuid.New(),
		Name:        dto.Name,
		Description: dto.Description,
		Location:    dto.Location,
		ZoneType:    dto.ZoneType,
		Status:      dto.Status,
		MineType:    dto.MineType,
		Coordinates: dto.Coordinates,
		Depth:       dto.Depth,
		Area:        dto.Area,
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}

func FromMineDomain(mine *mine.Mine) MineResponseDTO {
	return MineResponseDTO{
		ID:          mine.ID.String(),
		Name:        mine.Name,
		Description: mine.Description,
		Location:    mine.Location,
		ZoneType:    mine.ZoneType,
		Status:      mine.Status,
		MineType:    mine.MineType,
		Coordinates: mine.Coordinates,
		Depth:       mine.Depth,
		Area:        mine.Area,
		CreatedAt:   mine.CreatedAt,
		UpdatedAt:   mine.UpdatedAt,
	}
}
