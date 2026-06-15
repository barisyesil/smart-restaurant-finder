from sqlalchemy import JSON, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class SavedPlaceRow(Base):
    """Kullanıcının kaydettiği mekan (favori / gidilecek / gidilen)."""

    __tablename__ = "saved_places"
    __table_args__ = (
        UniqueConstraint("user_id", "place_id", "kind", name="uq_user_place_kind"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    place_id: Mapped[str] = mapped_column(String(255))
    kind: Mapped[str] = mapped_column(String(20))  # favorite | wishlist | visited

    name: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(50))
    types: Mapped[list] = mapped_column(JSON, default=list)
    rating: Mapped[float | None] = mapped_column(Float, nullable=True)
    user_ratings_total: Mapped[int | None] = mapped_column(Integer, nullable=True)
    price_level: Mapped[int | None] = mapped_column(Integer, nullable=True)
    lat: Mapped[float] = mapped_column(Float)
    lon: Mapped[float] = mapped_column(Float)
