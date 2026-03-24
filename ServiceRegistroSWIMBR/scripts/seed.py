"""
Script para criar o superusuário inicial no banco de dados.
Execute: python scripts/seed.py
"""
import sys
from pathlib import Path

# Adiciona root do projeto ao path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from db.session import SessionLocal
from db.base import Base
from db.session import engine
from schemas.user import UserCreate
from models.user import UserType, UserLevelAuth
import crud

# Garante que as tabelas existem (útil em dev local sem Alembic)
import models  # noqa: F401
Base.metadata.create_all(bind=engine)


def seed_superuser():
    db = SessionLocal()
    try:
        existing = crud.get_user_by_username(db, "admin")
        if existing:
            print("⚠️  Superusuário 'admin' já existe. Nenhuma ação tomada.")
            return

        admin_in = UserCreate(
            username="admin",
            email="admin@swim.com",
            password="admin1234",
            first_name="Admin",
            last_name="SWIM",
            user_type=UserType.admin,
            user_level_auth=UserLevelAuth.level_3,
            is_active=True,
            is_staff=True,
            is_superuser=True,
        )
        user = crud.create_user(db, admin_in)
        print(f"✅ Superusuário criado com sucesso!")
        print(f"   Username: {user.username}")
        print(f"   Email:    {user.email}")
        print(f"   Senha:    admin1234 (troque imediatamente!)")
    finally:
        db.close()


if __name__ == "__main__":
    seed_superuser()
