package routes

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/wFercho/mines_microservice/internal/server/handlers"
)

func RegisterMinesRoutes(mux *chi.Mux, mineHandler *handlers.MineHandler) {
	mux.Route("/mines", func(r chi.Router) {
		r.Get("/", mineHandler.GetAllMines)
	})
}

func RegisterMineNodes3DRoutes(r chi.Router, h *handlers.MineNodes3DHandler) {
	r.Route("/mine-nodes3d", func(r chi.Router) {
		r.Post("/", h.CreateMineNodes3D)
		r.Get("/{id}", h.GetMineNodes3DByID)
		r.Get("/mine/{mine_id}", h.GetByMineID)
		r.Delete("/{id}", h.DeleteMineNodes3D)
		r.Delete("/mine/{mine_id}", h.DeleteByMineID)

		r.Post("/upload-csv/{mine_id}", h.UploadCSV)
	})

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("MineNodes3D API is up and running"))
	})
}
