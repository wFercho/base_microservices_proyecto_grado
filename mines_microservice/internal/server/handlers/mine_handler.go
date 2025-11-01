package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/wFercho/mines_microservice/internal/application/usecase"
	"github.com/wFercho/mines_microservice/internal/server/dto"
)

type MineHandler struct {
	useCase *usecase.MineUseCase
}

func NewMineHandler(uc *usecase.MineUseCase) *MineHandler {
	return &MineHandler{useCase: uc}
}

func (h *MineHandler) GetAllMines(w http.ResponseWriter, r *http.Request) {
	mines, err := h.useCase.GetAllMines()
	if err != nil {
		http.Error(w, "Error fetching mines", http.StatusInternalServerError)
		return
	}

	response := make([]dto.MineResponseDTO, len(mines))
	for i, mine := range mines {
		response[i] = dto.FromMineDomain(mine)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
