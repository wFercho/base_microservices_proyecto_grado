package db

import (
	s "github.com/wFercho/mines_microservice/internal/domain/sensors"
	"gorm.io/gorm"
)

type repository struct {
	db *gorm.DB
}

func NewSensorsRepository(db *gorm.DB) s.Repository {
	return &repository{db: db}
}

// GetNodeSensors obtiene todos los sensores asociados a un nodo específico
func (r *repository) GetNodeSensors(nodeID string) ([]*s.Sensor, error) {
	var sensors []*s.Sensor

	// Consulta usando GORM
	result := r.db.Where("id_node = ?", nodeID).Find(&sensors)

	if result.Error != nil {
		return nil, result.Error
	}

	return sensors, nil
}
