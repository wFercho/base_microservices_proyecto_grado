package sensors

type Repository interface {
	GetNodeSensors(node_id string) ([]*Sensor, error)
}
