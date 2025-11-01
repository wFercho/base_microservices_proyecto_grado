package dto

import (
	"github.com/google/uuid"
)

type Node3DRequestDTO struct {
	ID          string      `json:"id" validate:"required"`
	Zone        ZoneDTO     `json:"zone" validate:"required"`
	Connections []string    `json:"connections"`
	Position    PositionDTO `json:"position" validate:"required"`
	Color       string      `json:"color"`
	Sensors     []SensorDTO `json:"sensors"`
}

type ZoneDTO struct {
	Category string `json:"category" validate:"required"`
	Name     string `json:"name" validate:"required"`
}

type PositionDTO struct {
	X int `json:"x" validate:"required"`
	Y int `json:"y" validate:"required"`
	Z int `json:"z" validate:"required"`
}

type SensorDTO struct {
	Category string `json:"category" validate:"required"`
	Unit     string `json:"unit" validate:"required"`
}

type MineNodes3DRequestDTO struct {
	MineID uuid.UUID          `json:"mine_id" validate:"required"`
	Nodes  []Node3DRequestDTO `json:"nodes" validate:"required,dive"`
}

type MineNodes3DResponseDTO struct {
	ID     string             `json:"id"`
	MineID string             `json:"mine_id"`
	Nodes  []Node3DRequestDTO `json:"nodes"`
}

// func (dto *MineNodes3DRequestDTO) ToDomain() (*mine_nodes3d.MineNodes3D, error) {
// 	nodes := make([]mine_nodes3d.Node3D, len(dto.Nodes))
// 	for i, n := range dto.Nodes {
// 		nodes[i] = mine_nodes3d.Node3D{
// 			ID: n.ID,
// 			Zone: mine_nodes3d.Zone{
// 				Category: n.Zone.Category,
// 				Name:     n.Zone.Name,
// 			},
// 			Connections: n.Connections,
// 			Position: mine_nodes3d.Position{
// 				X: n.Position.X,
// 				Y: n.Position.Y,
// 				Z: n.Position.Z,
// 			},
// 			Color: n.Color,
// 			Sensors: func(sensors []SensorDTO) []mine_nodes3d.Sensor {
// 				s := make([]mine_nodes3d.Sensor, len(sensors))
// 				for i, sensor := range sensors {
// 					s[i] = mine_nodes3d.Sensor{
// 						Category: sensor.Category,
// 						Unit:     sensor.Unit,
// 					}
// 				}
// 				return s
// 			}(n.Sensors),
// 		}
// 	}

// 	return mine_nodes3d.NewMineNodes3D(dto.MineID, nodes)
// }

// func FromDomainToMineNodes3Ddto(mn mine_nodes3d.MineNodes3D) MineNodes3DResponseDTO {
// 	return MineNodes3DResponseDTO{
// 		ID:     mn.ID.String(),
// 		MineID: mn.MineId.String(),
// 		Nodes: func(nodes []mine_nodes3d.Node3D) []Node3DRequestDTO {
// 			res := make([]Node3DRequestDTO, len(nodes))
// 			for i, node := range nodes {
// 				res[i] = Node3DRequestDTO{
// 					ID: node.ID,
// 					Zone: ZoneDTO{
// 						Category: node.Zone.Category,
// 						Name:     node.Zone.Name,
// 					},
// 					Connections: node.Connections,
// 					Position: PositionDTO{
// 						X: node.Position.X,
// 						Y: node.Position.Y,
// 						Z: node.Position.Z,
// 					},
// 					Color: node.Color,
// 					Sensors: func(sensors []mine_nodes3d.Sensor) []SensorDTO {
// 						s := make([]SensorDTO, len(sensors))
// 						for i, sensor := range sensors {
// 							s[i] = SensorDTO{
// 								Category: sensor.Category,
// 								Unit:     sensor.Unit,
// 							}
// 						}
// 						return s
// 					}(node.Sensors),
// 				}
// 			}
// 			return res
// 		}(mn.Nodes),
// 	}
// }
