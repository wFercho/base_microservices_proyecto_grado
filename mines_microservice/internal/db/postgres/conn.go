package db

import (
	"log"

	"github.com/wFercho/mines_microservice/internal/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func ConnectToPostgresDatabase() (*gorm.DB, error) {
	cfg := config.LoadConfig()
	dsn := cfg.GetIoTDevicesPostgresDatabaseURL()

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Error al conectar con la base de datos: %v", err)
		return nil, err
	}

	err = db.AutoMigrate(&MinePostgresModel{})
	if err != nil {
		log.Fatal("❌ Error en la migración:", err)
	}

	return db, nil
}
