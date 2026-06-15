from sqlalchemy import JSON, Boolean, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class PreferenceRow(Base):
    """Kullanıcının öneri tercihleri (her kullanıcı için tek satır)."""

    __tablename__ = "preferences"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    categories: Mapped[list] = mapped_column(JSON, default=list)
    cuisines: Mapped[list] = mapped_column(JSON, default=list)
    max_distance: Mapped[int] = mapped_column(Integer, default=1500)
    max_price: Mapped[int | None] = mapped_column(Integer, nullable=True)
    open_now: Mapped[bool] = mapped_column(Boolean, default=False)
