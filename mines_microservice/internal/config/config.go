package config

import (
	"os"
)

type Config struct {
	Postgres           PostgresConf
	IoTDevicesPostgres PostgresConf
	MongoDB            MongoDBConf
	AppPort            string
	MQTTBroker         string
	Environment        string
}

func LoadConfig() *Config {

	return &Config{
		Postgres: PostgresConf{
			DBUser:     os.Getenv("MINES_POSTGRES_USER"),
			DBPassword: os.Getenv("MINES_POSTGRES_PASSWORD"),
			DBName:     os.Getenv("MINES_POSTGRES_DB"),
			DBHost:     os.Getenv("MINES_POSTGRES_HOST"),
			DBPort:     os.Getenv("MINES_POSTGRES_PORT"),
		},
		MongoDB: MongoDBConf{
			DBUser:     os.Getenv("MONGO_USERNAME"),
			DBPassword: os.Getenv("MONGO_PASSWORD"),
			DBName:     os.Getenv("MONGO_DATABASE"),
			DBHost:     os.Getenv("MONGO_HOST"),
			DBPort:     os.Getenv("MONGO_PORT"),
		},
		AppPort:     os.Getenv("MINES_PORT"),
		MQTTBroker:  os.Getenv("MQTT_BROKER"),
		Environment: os.Getenv("ENVIRONMENT"),
		IoTDevicesPostgres: PostgresConf{
			DBUser:     os.Getenv("IOT_DEVICES_POSTGRES_USER"),
			DBPassword: os.Getenv("IOT_DEVICES_POSTGRES_PASSWORD"),
			DBName:     os.Getenv("IOT_DEVICES_POSTGRES_DB"),
			DBHost:     os.Getenv("IOT_DEVICES_POSTGRES_HOST"),
			DBPort:     os.Getenv("IOT_DEVICES_POSTGRES_PORT"),
		},
	}
}
