package mqtt

import (
	"fmt"
	"log"
	"os"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

var messageHandler = MessageHandler

type MQTTClient struct {
	Client mqtt.Client
}

func NewMQTTClient(topics []string) *MQTTClient {
	broker := os.Getenv("MQTT_BROKER")
	if broker == "" {
		log.Fatal("MQTT_BROKER no está definido en las variables de entorno")
	}

	opts := mqtt.NewClientOptions()
	opts.AddBroker(broker)
	opts.SetClientID("go_mines_microservice")
	opts.SetDefaultPublishHandler(messageHandler)

	client := mqtt.NewClient(opts)
	token := client.Connect()
	token.Wait()
	if token.Error() != nil {
		log.Fatalf("Error al conectar con MQTT: %v", token.Error())
	}

	mqttClient := &MQTTClient{Client: client}
	mqttClient.SubscribeToTopics(topics)

	return mqttClient
}

func (m *MQTTClient) SubscribeToTopics(topics []string) {
	for _, topic := range topics {
		token := m.Client.Subscribe(topic, 0, messageHandler)
		token.Wait()
		if token.Error() != nil {
			log.Printf("Error al suscribirse al topic %s: %v", topic, token.Error())
		} else {
			fmt.Printf("Suscrito al topic: %s\n", topic)
		}
	}
}
