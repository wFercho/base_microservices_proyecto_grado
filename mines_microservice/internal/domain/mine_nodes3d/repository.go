package mine_nodes3d

type MineNodes3DRepository interface {
	Create(mn *MineNodes3D) (*MineNodes3D, error)
	FindByID(id string) (*MineNodes3D, error)
	FindByMineID(mine_id string) (*MineNodes3D, error)
	Delete(id string) error
	DeleteByMineID(mine_id string) error
	CreateOrUpdate(mn *MineNodes3D) (*MineNodes3D, error)
}
