from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Uygulama ayarları. Değerler ortam değişkenlerinden veya .env dosyasından okunur."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Smart Restaurant Finder API"

    # Frontend kaynaklarına CORS izni. Birden fazla origin virgülle ayrılır.
    cors_origins: str = "http://localhost:5173"

    # Google Places API (New) sunucu anahtarı. Sunucuda kalır, asla frontend'e sızmaz.
    google_maps_api_key: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
