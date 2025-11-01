package db

import (
	"context"
	"errors"
	"time"

	"github.com/wFercho/mines_microservice/internal/domain/mine_nodes3d"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type MineNodes3DMongoRepository struct {
	collection *mongo.Collection
}

func NewMineNodes3DMongoRepository(db *mongo.Database) *MineNodes3DMongoRepository {
	return &MineNodes3DMongoRepository{
		collection: db.Collection("mine_nodes3d"),
	}
}

func (r *MineNodes3DMongoRepository) Create(mn *mine_nodes3d.MineNodes3D) (*mine_nodes3d.MineNodes3D, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := r.collection.InsertOne(ctx, mn)
	if err != nil {
		return nil, err
	}

	return mn, nil
}

func (r *MineNodes3DMongoRepository) CreateOrUpdate(mn *mine_nodes3d.MineNodes3D) (*mine_nodes3d.MineNodes3D, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Primero verificar si existe
	existing, err := r.FindByMineID(mn.MineId)
	if err != nil && !errors.Is(err, mongo.ErrNoDocuments) {
		return nil, err
	}

	if existing != nil {
		// Actualizar documento existente
		filter := bson.M{"mine_id": mn.MineId}
		update := bson.M{
			"$set": bson.M{
				"nodes":      mn.Nodes,
				"updated_at": time.Now(),
			},
		}

		_, err := r.collection.UpdateOne(ctx, filter, update)
		if err != nil {
			return nil, err
		}
	} else {
		// Insertar nuevo documento
		_, err := r.collection.InsertOne(ctx, mn)
		if err != nil {
			return nil, err
		}
	}

	return mn, nil
}

func (r *MineNodes3DMongoRepository) FindByID(id string) (*mine_nodes3d.MineNodes3D, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// objectID, err := bson.ObjectIDFromHex(id.String())
	// if err != nil {
	// 	return nil, errors.New("ID no válido")
	// }

	filter := bson.M{"mine_id": id}
	var model *mine_nodes3d.MineNodes3D

	err := r.collection.FindOne(ctx, filter).Decode(&model)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	return model, nil
}

func (r *MineNodes3DMongoRepository) FindByMineID(mineID string) (*mine_nodes3d.MineNodes3D, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"mine_id": mineID}
	var model *mine_nodes3d.MineNodes3D

	err := r.collection.FindOne(ctx, filter).Decode(&model)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	model.MineId = mineID
	return model, nil
}

func (r *MineNodes3DMongoRepository) Delete(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID no válido")
	}

	filter := bson.M{"_id": objectID}
	res, err := r.collection.DeleteOne(ctx, filter)
	if err != nil {
		return err
	}

	if res.DeletedCount == 0 {
		return errors.New("registro no encontrado")
	}

	return nil
}

func (r *MineNodes3DMongoRepository) DeleteByMineID(mineID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"mine_id": mineID}
	_, err := r.collection.DeleteMany(ctx, filter)
	return err
}
