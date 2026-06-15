from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Uygulama ayarları. Değerler ortam değişkenlerinden veya .env dosyasından okunur."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Smart Restaurant Finder API"

    # Frontend kaynaklarına CORS izni. Birden fazla origin virgülle ayrılır.
    cors_origins: str = "http://localhost:5173"

    # Google Places API (New) sunucu anahtarı. Sunucuda kalır, asla frontend'e sızmaz.
    google_maps_api_key: str = ""

    # Veritabanı: yerelde SQLite, production'da Neon Postgres (DATABASE_URL ile).
    database_url: str = "sqlite:///./app.db"

    # JWT ayarları
    jwt_secret: str = "dev-secret-change-me-in-production-please-32"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 gün

    # Gemini (AI asistanı). Anahtar sunucuda kalır; yoksa /chat 503 döner.
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    # Birincil model geçici olarak yoğunsa (429/500/503) bu hafif modele düşülür.
    gemini_fallback_model: str = "gemini-2.5-flash-lite"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def sqlalchemy_url(self) -> str:
        # Neon/Heroku 'postgresql://' verir; psycopg v3 sürücüsüne yönlendir.
        url = self.database_url
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url


settings = Settings()
