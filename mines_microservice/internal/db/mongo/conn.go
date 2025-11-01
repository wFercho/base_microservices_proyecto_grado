package db

import (
	"context"
	"log"
	"sync"

	"github.com/wFercho/mines_microservice/internal/config"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var (
	mongoClient *mongo.Client
	once        sync.Once
)

func ConnectToMongoDatabase() *mongo.Database {
	cfg := config.LoadConfig()
	uri := cfg.GetMongoDatabaseURL()

	once.Do(func() {
		var err error
		mongoClient, err = mongo.Connect(options.Client().ApplyURI(uri))
		if err != nil {
			panic(err)
		}

		err = mongoClient.Ping(context.TODO(), nil)
		if err != nil {
			panic(err)
		}

		log.Println("✅ Conectado a mongodb")
	})

	return mongoClient.Database(cfg.MongoDB.DBName)
}

func GetMongoClient() *mongo.Client {
	return mongoClient
}

func DisconnectMongo() {
	if mongoClient != nil {
		if err := mongoClient.Disconnect(context.TODO()); err != nil {
			log.Println("Error al desconectar MongoDB:", err)
		} else {
			log.Println("MongoDB desconectado correctamente")
		}
	}
}
