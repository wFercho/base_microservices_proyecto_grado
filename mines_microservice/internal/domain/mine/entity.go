package mine

import (
	"time"

	"github.com/google/uuid"
)

type Mine struct {
	ID          uuid.UUID `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	Location    string    `json:"location" db:"location"`
	ZoneType    string    `json:"zone_type" db:"zone_type"`
	Status      string    `json:"status" db:"status"`
	MineType    string    `json:"mine_type" db:"mine_type"`
	Coordinates string    `json:"coordinates" db:"coordinates"`
	Depth       string    `json:"depth" db:"depth"`
	Area        string    `json:"area" db:"area"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

func NewMineZone(name, description, location, zoneType, status, mineType, coordinates, depth, area string) (*Mine, error) {
	now := time.Now()
	return &Mine{
		ID:          uuid.New(),
		Name:        name,
		Description: description,
		Location:    location,
		ZoneType:    zoneType,
		Status:      status,
		MineType:    mineType,
		Coordinates: coordinates,
		Depth:       depth,
		Area:        area,
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}
