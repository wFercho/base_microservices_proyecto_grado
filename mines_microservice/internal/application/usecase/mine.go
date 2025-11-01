package usecase

import "github.com/wFercho/mines_microservice/internal/domain/mine"

type MineUseCase struct {
	repo mine.Repository
}

func NewMineUseCase(repo mine.Repository) *MineUseCase {
	return &MineUseCase{repo: repo}
}

func (uc *MineUseCase) CreateMine(m *mine.Mine) (*mine.Mine, error) {
	return uc.repo.Create(m)
}

func (uc *MineUseCase) GetAllMines() ([]*mine.Mine, error) {
	return uc.repo.FindAll()
}
