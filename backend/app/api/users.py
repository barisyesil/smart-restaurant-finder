from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.preference import PreferenceRow
from app.models.saved_place import SavedPlaceRow
from app.models.user import User
from app.schemas.preference import PreferencesSchema
from app.schemas.saved import AddSavedRequest, SavedCollection, SavedPlaceSchema

router = APIRouter(prefix="/me", tags=["me"])

VALID_KINDS = {"favorite", "wishlist", "visited"}


def _row_to_schema(row: SavedPlaceRow) -> SavedPlaceSchema:
    return SavedPlaceSchema(
        id=row.place_id,
        name=row.name,
        category=row.category,
        types=row.types or [],
        rating=row.rating,
        user_ratings_total=row.user_ratings_total,
        price_level=row.price_level,
        lat=row.lat,
        lon=row.lon,
    )


@router.get("/saved", response_model=SavedCollection)
def get_saved(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> SavedCollection:
    rows = db.scalars(select(SavedPlaceRow).where(SavedPlaceRow.user_id == user.id)).all()
    collection = SavedCollection()
    buckets = {
        "favorite": collection.favorites,
        "wishlist": collection.wishlist,
        "visited": collection.visited,
    }
    for row in rows:
        bucket = buckets.get(row.kind)
        if bucket is not None:
            bucket.append(_row_to_schema(row))
    return collection


@router.post("/saved", status_code=status.HTTP_204_NO_CONTENT)
def add_saved(
    payload: AddSavedRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    if payload.kind not in VALID_KINDS:
        raise HTTPException(status_code=400, detail="Geçersiz kayıt türü.")

    existing = db.scalar(
        select(SavedPlaceRow).where(
            SavedPlaceRow.user_id == user.id,
            SavedPlaceRow.place_id == payload.place.id,
            SavedPlaceRow.kind == payload.kind,
        )
    )
    if existing is not None:
        return  # idempotent

    place = payload.place
    db.add(
        SavedPlaceRow(
            user_id=user.id,
            place_id=place.id,
            kind=payload.kind,
            name=place.name,
            category=place.category,
            types=place.types,
            rating=place.rating,
            user_ratings_total=place.user_ratings_total,
            price_level=place.price_level,
            lat=place.lat,
            lon=place.lon,
        )
    )
    db.commit()


@router.delete("/saved/{kind}/{place_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_saved(
    kind: str,
    place_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    db.execute(
        delete(SavedPlaceRow).where(
            SavedPlaceRow.user_id == user.id,
            SavedPlaceRow.place_id == place_id,
            SavedPlaceRow.kind == kind,
        )
    )
    db.commit()


@router.get("/preferences", response_model=PreferencesSchema)
def get_preferences(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> PreferencesSchema:
    row = db.get(PreferenceRow, user.id)
    if row is None:
        return PreferencesSchema()
    return PreferencesSchema.model_validate(row)


@router.put("/preferences", response_model=PreferencesSchema)
def put_preferences(
    payload: PreferencesSchema,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PreferencesSchema:
    row = db.get(PreferenceRow, user.id)
    if row is None:
        row = PreferenceRow(user_id=user.id)
        db.add(row)
    row.categories = payload.categories
    row.cuisines = payload.cuisines
    row.max_distance = payload.max_distance
    row.max_price = payload.max_price
    row.open_now = payload.open_now
    db.commit()
    return payload
