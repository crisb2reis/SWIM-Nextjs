import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from db.base import Base
from db.session import get_db
from main import app

# Allow using a Postgres test DB via env var TEST_DB_URL (e.g. postgres in Docker).
# Fallback to local SQLite file for fast local testing.
SQLALCHEMY_TEST_URL = os.getenv("TEST_DB_URL", "sqlite:///./test.db")

if SQLALCHEMY_TEST_URL.startswith("sqlite"):
    engine_test = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
else:
    engine_test = create_engine(SQLALCHEMY_TEST_URL)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


@pytest.fixture(scope="session", autouse=True)
def create_tables():
    # Create all tables for the test database. For Postgres this will create the schema.
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)


@pytest.fixture()
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
