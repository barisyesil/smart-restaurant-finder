from pydantic import BaseModel, ConfigDict, Field


class PreferencesSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    categories: list[str] = []
    cuisines: list[str] = []
    max_distance: int = Field(default=1500, ge=100, le=50000)
    max_price: int | None = Field(default=None, ge=0, le=4)
    open_now: bool = False
