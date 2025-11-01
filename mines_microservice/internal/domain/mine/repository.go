package mine

import (
	"github.com/google/uuid"
)

type Repository interface {
	Create(m *Mine) (*Mine, error)
	Find(id uuid.UUID) (*Mine, error)
	FindAll() ([]*Mine, error)
	Update(m *Mine) error
	Delete(id uuid.UUID) error
}
