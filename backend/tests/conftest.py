import os

# Testler için izole bir SQLite veritabanı kullan (uygulamayı import etmeden ÖNCE ayarla).
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ.setdefault("JWT_SECRET", "test-secret-at-least-32-bytes-long-xx")

import pytest  # noqa: E402

from app.db.base import Base  # noqa: E402
from app.db.session import engine, init_db  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _setup_database():
    init_db()
    yield
    Base.metadata.drop_all(bind=engine)
