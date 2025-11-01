package mine_nodes3d

import (
	s "github.com/wFercho/mines_microservice/internal/domain/sensors"
)

type Node3D struct {
	ID          string      `json:"id"`
	Zone        Zone        `json:"zone"`
	Connections []string    `json:"connections"`
	Position    Position    `json:"position"`
	Color       string      `json:"color"`
	Sensors     []*s.Sensor `json:"sensors"`
}

type Zone struct {
	Category string `json:"category"`
	Name     string `json:"name"`
}

type Position struct {
	X int `json:"x"`
	Y int `json:"y"`
	Z int `json:"z"`
}

type MineNodes3D struct {
	ID     string   `json:"id" bson:"id"`
	MineId string   `json:"mine_id" bson:"mine_id"`
	Nodes  []Node3D `json:"nodes" `
}

func NewMineNodes3D(mineId string, nodes []Node3D) (*MineNodes3D, error) {
	return &MineNodes3D{
		ID:     mineId,
		MineId: mineId,
		Nodes:  nodes,
	}, nil
}
