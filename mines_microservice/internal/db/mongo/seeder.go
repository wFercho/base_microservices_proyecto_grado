package db

import (
	"context"
	"encoding/csv"
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type MineNodes3DSeeder struct {
	collection *mongo.Collection
}

func NewMineNodes3DSeeder(db *mongo.Database) *MineNodes3DSeeder {
	return &MineNodes3DSeeder{
		collection: db.Collection("mine_nodes3d"),
	}
}

func (s *MineNodes3DSeeder) SeedFromCSV(filePath string, mineID uuid.UUID) error {
	// Primero, verificamos si ya existe un registro para este mineID
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Contar documentos directamente usando CountDocuments
	count, err := s.collection.CountDocuments(ctx, bson.M{"mine_id": mineID.String()})
	if err != nil {
		return fmt.Errorf("error al verificar documentos existentes: %v", err)
	}

	// Si ya existen documentos, omitimos la inserción
	if count > 0 {
		fmt.Printf("Ya existen %d documentos para el mineID %s. Omitiendo inserción.\n", count, mineID)
		return nil
	}

	// Resto del código de preparación de datos (igual que antes)
	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	rows, err := reader.ReadAll()
	if err != nil {
		return err
	}

	if len(rows) < 2 {
		return errors.New("CSV vacío o sin datos")
	}

	var nodes []NodeMongoModel
	for _, row := range rows[1:] {
		if len(row) < 7 {
			continue
		}

		x, _ := strconv.Atoi(row[5])
		y, _ := strconv.Atoi(row[6])
		z, _ := strconv.Atoi(row[7])

		node := NodeMongoModel{
			ID: row[0],
			Zone: ZoneMongoModel{
				Category: row[1],
				Name:     row[2],
			},
			Connections: strings.Split(row[3], ";"),
			Color:       row[4],
			Position: PositionMongoModel{
				X: x,
				Y: y,
				Z: z,
			},
			Sensors: []SensorMongoModel{},
		}
		nodes = append(nodes, node)
	}

	doc := MineNodes3DMongoModel{
		ID:     bson.NewObjectID(),
		MineID: mineID.String(),
		Nodes:  nodes,
	}

	// Insertar solo si no hay documentos existentes
	_, err = s.collection.InsertOne(ctx, doc)
	if err != nil {
		fmt.Println("err", err)
		return err
	}

	fmt.Printf("Datos insertados para mineID %s\n", mineID)
	return nil
}
