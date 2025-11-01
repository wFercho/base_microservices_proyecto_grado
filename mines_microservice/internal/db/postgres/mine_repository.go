package db

import (
	"errors"

	"github.com/google/uuid"
	"github.com/wFercho/mines_microservice/internal/domain/mine"
	"gorm.io/gorm"
)

type PostgresRepository struct {
	db *gorm.DB
}

func NewPostgresRepository(db *gorm.DB) *PostgresRepository {
	return &PostgresRepository{db: db}
}

func (r *PostgresRepository) Create(m *mine.Mine) (*mine.Mine, error) {

	return nil, nil
}

func (r *PostgresRepository) Find(id uuid.UUID) (*mine.Mine, error) {

	return nil, nil
}

func (r *PostgresRepository) FindAll() ([]*mine.Mine, error) {

	var minesModel []MinePostgresModel
	err := r.db.Find(&minesModel).Error

	if err != nil {
		return nil, errors.New("error trying to retrive mines")
	}

	mines := make([]*mine.Mine, len(minesModel))
	for i, model := range minesModel {
		mines[i] = model.ToDomain()
	}

	return mines, nil
}

func (r *PostgresRepository) Update(m *mine.Mine) error {

	return nil
}

func (r *PostgresRepository) Delete(id uuid.UUID) error {

	return nil
}
