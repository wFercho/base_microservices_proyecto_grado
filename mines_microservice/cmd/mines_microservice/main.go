package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/wFercho/mines_microservice/internal/application/usecase"
	"github.com/wFercho/mines_microservice/internal/config"
	mongo_db "github.com/wFercho/mines_microservice/internal/db/mongo"
	postgres_db "github.com/wFercho/mines_microservice/internal/db/postgres"
	"github.com/wFercho/mines_microservice/internal/server/handlers"
	"github.com/wFercho/mines_microservice/internal/server/routes"

	"github.com/rs/cors"
)

func main() {
	psconn, _ := postgres_db.ConnectToPostgresDatabase()
	mongodbconn := mongo_db.ConnectToMongoDatabase()
	mineRepo := postgres_db.NewPostgresRepository(psconn)

	conf := config.LoadConfig()
	// if conf.Environment == "dev" || conf.Environment == "development" {
	// 	mines, err := mineRepo.FindAll()
	// 	if err != nil {
	// 		fmt.Println("error", err)
	// 	}
	// 	mine_id := mines[0].ID
	// 	err = mongo_db.NewMineNodes3DSeeder(mongodbconn).SeedFromCSV("./test_data/mine_nodes3d.csv", mine_id)

	// 	if err != nil {
	// 		fmt.Println("error", err)
	// 	}
	// }

	defer mongo_db.DisconnectMongo()

	mineUsecase := usecase.NewMineUseCase(mineRepo)
	mineHandler := handlers.NewMineHandler(mineUsecase)

	mineNodes3dRepo := mongo_db.NewMineNodes3DMongoRepository(mongodbconn)
	sensorsRepo := postgres_db.NewSensorsRepository(psconn)
	mineNodes3dUseCase := usecase.NewMineNodes3DUseCase(mineNodes3dRepo, sensorsRepo)
	mineNodes3dHandler := handlers.NewMineNodes3DHandler(mineNodes3dUseCase)

	r := chi.NewRouter()
	r.Use(middleware.Logger)

	if conf.Environment == "dev" || conf.Environment == "development" {
		corsHandler := cors.New(cors.Options{
			AllowedOrigins:   []string{"*"}, // Permite todos los orígenes
			AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
			ExposedHeaders:   []string{"Link"},
			AllowCredentials: true,
			MaxAge:           300, // Maximum value not ignored by any of major browsers
		})

		r.Use(corsHandler.Handler)
	}

	routes.RegisterMinesRoutes(r, mineHandler)
	routes.RegisterMineNodes3DRoutes(r, mineNodes3dHandler)

	fmt.Printf("Servidor escuchando en :%s\n", conf.AppPort)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", conf.AppPort), r))
}
