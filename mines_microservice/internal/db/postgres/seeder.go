package db

// import (
// 	"log"

// 	"github.com/google/uuid"
// 	"github.com/wFercho/mines_microservice/internal/domain/mine"
// 	"gorm.io/gorm"
// )

// func SeedPostgresDB(db *gorm.DB) uuid.UUID {
// 	mine1, err1 := mine.NewMine("Mina El Diamante", "Carbones de Boyacá S.A.", "Boyacá", "Sogamoso", "Vereda Morcá", "Km 5 vía Morcá", "Activa", -73.3675, 5.535)
// 	mine2, err2 := mine.NewMine("Mina La Esperanza", "Minerales del Centro Ltda.", "Boyacá", "Nobsa", "Vereda Las Caleras", "Sector Las Caleras", "Activa", -73.214, 5.583)

// 	if err1 != nil || err2 != nil {
// 		log.Fatalf("❌ Error al crear las minas en el dominio: %v, %v", err1, err2)
// 	}

// 	minesToInsert := []*MinePostgresModel{
// 		FromDomainToMinePostgresModel(mine1),
// 		FromDomainToMinePostgresModel(mine2),
// 	}

// 	// Slice para almacenar minas que realmente necesitan ser insertadas
// 	var minesToActuallyInsert []*MinePostgresModel

// 	for _, mineModel := range minesToInsert {
// 		// Verificar si ya existe un registro con el mismo nombre
// 		var existingMine MinePostgresModel
// 		result := db.Where("name = ?", mineModel.Name).First(&existingMine)

// 		// Si no se encuentra un registro existente, agregar a la lista de inserción
// 		if result.Error == gorm.ErrRecordNotFound {
// 			minesToActuallyInsert = append(minesToActuallyInsert, mineModel)
// 		} else {
// 			log.Printf("La mina %s ya existe. Omitiendo inserción.", mineModel.Name)
// 		}
// 	}

// 	// Insertar solo las minas que no existen
// 	if len(minesToActuallyInsert) > 0 {
// 		if err := db.Create(&minesToActuallyInsert).Error; err != nil {
// 			log.Fatalf("❌ Error al insertar datos iniciales: %v", err)
// 		}
// 		log.Printf("✅ %d minas insertadas en la base de datos", len(minesToActuallyInsert))
// 	} else {
// 		log.Println("✅ No se requieren inserciones. Todas las minas ya existen.")
// 	}

// 	return minesToInsert[0].ID
// }
