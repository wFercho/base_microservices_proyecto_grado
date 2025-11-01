package usecase

import (
	"errors"
	"fmt"

	"github.com/wFercho/mines_microservice/internal/domain/mine_nodes3d"
	"github.com/wFercho/mines_microservice/internal/domain/sensors"
)

type MineNodes3DUseCase struct {
	Repository  mine_nodes3d.MineNodes3DRepository
	sensorsRepo sensors.Repository
}

func NewMineNodes3DUseCase(repo mine_nodes3d.MineNodes3DRepository, sensorsRepo sensors.Repository) *MineNodes3DUseCase {
	return &MineNodes3DUseCase{Repository: repo, sensorsRepo: sensorsRepo}
}

func (uc *MineNodes3DUseCase) CreateOrUpdate(mineNodes3D *mine_nodes3d.MineNodes3D) (*mine_nodes3d.MineNodes3D, error) {
	if mineNodes3D == nil {
		return nil, errors.New("los datos de MineNodes3D no pueden ser nulos")
	}

	createdMineNodes3D, err := uc.Repository.CreateOrUpdate(mineNodes3D)
	if err != nil {
		return nil, err
	}

	return createdMineNodes3D, nil
}

func (uc *MineNodes3DUseCase) FindByID(id string) (*mine_nodes3d.MineNodes3D, error) {
	mineNodes3D, err := uc.Repository.FindByID(id)
	if err != nil {
		return nil, err
	}

	if mineNodes3D == nil {
		return nil, errors.New("registro no encontrado")
	}

	return mineNodes3D, nil
}

func (uc *MineNodes3DUseCase) FindByMineID(mineID string) (*mine_nodes3d.MineNodes3D, error) {
	// Primero obtener los datos principales
	mineNodes3D, err := uc.Repository.FindByMineID(mineID)
	if err != nil {
		return nil, err
	}

	if mineNodes3D == nil {
		return nil, errors.New("registro no encontrado")
	}

	// Luego enriquecer cada nodo con sus sensores
	for i := range mineNodes3D.Nodes {
		sensors, err := uc.sensorsRepo.GetNodeSensors(mineNodes3D.Nodes[i].ID)
		if err != nil {
			// Log del error pero continuar con otros nodos
			fmt.Printf("Error obteniendo sensores del nodo %s: %v\n", mineNodes3D.Nodes[i].ID, err)
			continue // Continuar con el siguiente nodo en lugar de fallar completamente
		}
		mineNodes3D.Nodes[i].Sensors = sensors
	}

	return mineNodes3D, nil
}

func (uc *MineNodes3DUseCase) Delete(id string) error {
	return uc.Repository.Delete(id)
}

func (uc *MineNodes3DUseCase) DeleteByMineID(mineID string) error {
	return uc.Repository.DeleteByMineID(mineID)
}
