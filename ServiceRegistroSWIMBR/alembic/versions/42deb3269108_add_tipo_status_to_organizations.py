"""add_tipo_status_to_organizations

Revision ID: 42deb3269108
Revises: a6967d4f07f7
Create Date: 2026-03-25 11:48:06.336013

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '42deb3269108'
down_revision: Union[str, None] = 'a6967d4f07f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Definições dos tipos ENUM
tipo_enum = sa.Enum('PROVEDOR', 'CONSUMIDOR', 'PARCEIRO', 'OUTRO', name='organizationtipo')
status_enum = sa.Enum('ATIVO', 'INATIVO', 'EM_APROVACAO', name='organizationstatus')


def upgrade() -> None:
    # Criar os tipos ENUM no PostgreSQL antes de adicionar as colunas
    tipo_enum.create(op.get_bind(), checkfirst=True)
    status_enum.create(op.get_bind(), checkfirst=True)

    op.add_column('organizations', sa.Column('tipo', tipo_enum, nullable=True))
    op.add_column('organizations', sa.Column('status', status_enum, nullable=True))


def downgrade() -> None:
    op.drop_column('organizations', 'status')
    op.drop_column('organizations', 'tipo')

    # Remover os tipos ENUM do PostgreSQL
    tipo_enum.drop(op.get_bind(), checkfirst=True)
    status_enum.drop(op.get_bind(), checkfirst=True)
