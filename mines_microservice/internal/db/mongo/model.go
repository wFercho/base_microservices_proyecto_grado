package db

import (
	"go.mongodb.org/mongo-driver/v2/bson"
)

type MineNodes3DMongoModel struct {
	ID     bson.ObjectID    `bson:"_id,omitempty"`
	MineID string           `bson:"mine_id"`
	Nodes  []NodeMongoModel `bson:"nodes"`
}

type NodeMongoModel struct {
	ID          string             `bson:"id"`
	Zone        ZoneMongoModel     `bson:"zone"`
	Connections []string           `bson:"connections"`
	Position    PositionMongoModel `bson:"position"`
	Color       string             `bson:"color"`
	Sensors     []SensorMongoModel `bson:"sensors"`
}

type ZoneMongoModel struct {
	Category string `bson:"category"`
	Name     string `bson:"name"`
}

type PositionMongoModel struct {
	X int `bson:"x"`
	Y int `bson:"y"`
	Z int `bson:"z"`
}

type SensorMongoModel struct {
	Category string `bson:"category"`
	Unit     string `bson:"unit"`
}

// func (m *MineNodes3DMongoModel) ToDomain() *mine_nodes3d.MineNodes3D {
// 	nodes := make([]mine_nodes3d.Node3D, len(m.Nodes))
// 	for i, node := range m.Nodes {
// 		nodes[i] = mine_nodes3d.Node3D{
// 			ID:          node.ID,
// 			Zone:        mine_nodes3d.Zone{Category: node.Zone.Category, Name: node.Zone.Name},
// 			Connections: node.Connections,
// 			Position:    mine_nodes3d.Position{X: node.Position.X, Y: node.Position.Y, Z: node.Position.Z},
// 			Color:       node.Color,
// 			Sensors:     convertSensorsToDomain(node.Sensors),
// 		}
// 	}

// 	id := uuid.NewSHA1(uuid.Nil, []byte(m.ID.Hex()))
// 	return &mine_nodes3d.MineNodes3D{
// 		ID:     id,
// 		MineId: uuid.MustParse(m.MineID),
// 		Nodes:  nodes,
// 	}
// }

// func FromDomainToMineNodes3dMongoModel(m *mine_nodes3d.MineNodes3D) *MineNodes3DMongoModel {
// 	nodes := make([]NodeMongoModel, len(m.Nodes))
// 	for i, node := range m.Nodes {
// 		nodes[i] = NodeMongoModel{
// 			ID:          node.ID,
// 			Zone:        ZoneMongoModel{Category: node.Zone.Category, Name: node.Zone.Name},
// 			Connections: node.Connections,
// 			Position:    PositionMongoModel{X: node.Position.X, Y: node.Position.Y, Z: node.Position.Z},
// 			Color:       node.Color,
// 			Sensors:     convertSensorsToMongo(node.Sensors),
// 		}
// 	}

// 	return &MineNodes3DMongoModel{
// 		ID:     bson.NewObjectID(),
// 		MineID: m.MineId.String(),
// 		Nodes:  nodes,
// 	}
// }

// func convertSensorsToDomain(sensors []SensorMongoModel) []mine_nodes3d.Sensor {
// 	result := make([]sensors.Sensor, len(sensors))
// 	for i, s := range sensors {
// 		result[i] = mine_nodes3d.Sensor{
// 			Category: s.Category,
// 			Unit:     s.Unit,
// 		}
// 	}
// 	return result
// }

// func convertSensorsToMongo(sensors []mine_nodes3d.Sensor) []SensorMongoModel {
// 	result := make([]SensorMongoModel, len(sensors))
// 	for i, s := range sensors {
// 		result[i] = SensorMongoModel{
// 			Category: s.Category,
// 			Unit:     s.Unit,
// 		}
// 	}
// 	return result
// }
