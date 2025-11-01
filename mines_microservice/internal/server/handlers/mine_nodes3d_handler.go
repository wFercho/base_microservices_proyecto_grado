package handlers

import (
	"encoding/csv"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/wFercho/mines_microservice/internal/application/usecase"
	"github.com/wFercho/mines_microservice/internal/domain/mine_nodes3d"
)

type MineNodes3DHandler struct {
	UseCase *usecase.MineNodes3DUseCase
}

func NewMineNodes3DHandler(uc *usecase.MineNodes3DUseCase) *MineNodes3DHandler {
	return &MineNodes3DHandler{UseCase: uc}
}

func (h *MineNodes3DHandler) CreateMineNodes3D(w http.ResponseWriter, r *http.Request) {
	var request *mine_nodes3d.MineNodes3D

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Error al decodificar el JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	createdMineNodes, err := h.UseCase.CreateOrUpdate(request)
	if err != nil {
		http.Error(w, "Error al crear MineNodes3D: "+err.Error(), http.StatusInternalServerError)
		return
	}

	response := *createdMineNodes

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func (h *MineNodes3DHandler) GetMineNodes3DByID(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")

	mineNodes, err := h.UseCase.FindByID(idParam)
	if err != nil {
		http.Error(w, "Registro no encontrado: "+err.Error(), http.StatusNotFound)
		return
	}

	response := *mineNodes

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func (h *MineNodes3DHandler) GetByMineID(w http.ResponseWriter, r *http.Request) {
	mineIDParam := chi.URLParam(r, "mine_id")
	mineNodes, err := h.UseCase.FindByMineID(mineIDParam)
	if err != nil {
		http.Error(w, "Registro no encontrado: "+err.Error(), http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(mineNodes)
}

func (h *MineNodes3DHandler) DeleteMineNodes3D(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")

	if err := h.UseCase.Delete(idParam); err != nil {
		http.Error(w, "Error al eliminar: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *MineNodes3DHandler) DeleteByMineID(w http.ResponseWriter, r *http.Request) {
	mineIDParam := chi.URLParam(r, "mine_id")

	if err := h.UseCase.DeleteByMineID(mineIDParam); err != nil {
		http.Error(w, "Error al eliminar registros: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *MineNodes3DHandler) UploadCSV(w http.ResponseWriter, r *http.Request) {
	mineIDParam := chi.URLParam(r, "mine_id")
	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error al obtener el archivo: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	nodes, err := parseCSV(file)
	if err != nil {
		http.Error(w, "Error al procesar el CSV: "+err.Error(), http.StatusInternalServerError)
		return
	}

	mineNodes, err := mine_nodes3d.NewMineNodes3D(mineIDParam, nodes)
	if err != nil {
		http.Error(w, "Error al crear la entidad de dominio: "+err.Error(), http.StatusInternalServerError)
		return
	}

	createdMineNodes, err := h.UseCase.CreateOrUpdate(mineNodes)
	if err != nil {
		http.Error(w, "Error al guardar los datos: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdMineNodes)
}

func parseCSV(file multipart.File) ([]mine_nodes3d.Node3D, error) {
	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}

	var nodes []mine_nodes3d.Node3D

	for _, record := range records {
		if len(record) < 6 || record[0] == "id" {
			continue
		}

		nodeID := record[0]
		zoneCategory := record[1]
		zoneName := record[2]
		connections := strings.Split(record[3], ";")
		color := record[4]

		x, _ := strconv.Atoi(record[5])
		y, _ := strconv.Atoi(record[6])
		z, _ := strconv.Atoi(record[7])

		node := mine_nodes3d.Node3D{
			ID: nodeID,
			Zone: mine_nodes3d.Zone{
				Category: zoneCategory,
				Name:     zoneName,
			},
			Connections: connections,
			Position: mine_nodes3d.Position{
				X: x,
				Y: y,
				Z: z,
			},
			Color:   color,
			Sensors: nil,
		}

		nodes = append(nodes, node)
	}

	return nodes, nil
}
