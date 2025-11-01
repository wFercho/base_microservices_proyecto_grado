package node_realtime_data

type realTimeSensorData struct {
	SensorId string
	Category string
	Value    float32
	Alert    alert
}

type alert struct {
	Name  string
	Color string
}

type NodeRealTimeData struct {
	ID          string
	SensorsData realTimeSensorData
}
