"""auto_migration

Revision ID: ec644ab7c29c
Revises: 970908259331
Create Date: 2025-05-04 02:25:31.281597

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '14325765cae0'
down_revision: Union[str, None] = None  # Si es tu primera migración
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
