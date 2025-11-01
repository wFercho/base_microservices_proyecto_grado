package mqtt

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/wFercho/mines_microservice/internal/config"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

type SensorData struct {
	Type  string  `json:"type"`
	Value float64 `json:"value"`
}

var MessageHandler mqtt.MessageHandler = func(client mqtt.Client, msg mqtt.Message) {
	fmt.Printf("Mensaje recibido en topic %s: %s\n", msg.Topic(), string(msg.Payload()))

	var data SensorData
	err := json.Unmarshal(msg.Payload(), &data)
	if err != nil {
		log.Printf("Error al parsear JSON: %v", err)
		return
	}

	alertLevel, color := validateSensorData(data.Type, data.Value)
	fmt.Printf("Alerta: %s - Color: %s\n", alertLevel, color)
}

func validateSensorData(sensorType string, value float64) (string, string) {
	rule, exists := config.SensorRules[sensorType]
	if !exists {
		return "DESCONOCIDO", "gray"
	}

	switch {
	case value < rule.Min || value > rule.Critical:
		return "PELIGRO", "red"
	case value >= rule.Warning:
		return "ADVERTENCIA", "yellow"
	default:
		return "NORMAL", "green"
	}
}
