package config

import "fmt"

type MongoDBConf struct {
	DBUser     string
	DBPassword string
	DBName     string
	DBHost     string
	DBPort     string
}

func (c *Config) GetMongoDatabaseURL() string {
	return fmt.Sprintf("mongodb://%s:%s@%s:%s/%s?authSource=admin",
		c.MongoDB.DBUser, c.MongoDB.DBPassword, c.MongoDB.DBHost, c.MongoDB.DBPort, c.MongoDB.DBName)
}
