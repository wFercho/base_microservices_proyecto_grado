package config

import (
	"fmt"
)

type PostgresConf struct {
	DBUser     string
	DBPassword string
	DBName     string
	DBHost     string
	DBPort     string
}

func (c *Config) GetPostgresDatabaseURL() string {
	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		c.Postgres.DBUser, c.Postgres.DBPassword, c.Postgres.DBHost, c.Postgres.DBPort, c.Postgres.DBName)
}

func (c *Config) GetIoTDevicesPostgresDatabaseURL() string {
	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		c.IoTDevicesPostgres.DBUser, c.IoTDevicesPostgres.DBPassword, c.IoTDevicesPostgres.DBHost, c.IoTDevicesPostgres.DBPort, c.IoTDevicesPostgres.DBName)
}
