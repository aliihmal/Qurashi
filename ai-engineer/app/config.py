from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/alqurashi"
    anthropic_api_key: str = ""
    model_understanding: str = "claude-haiku-5-5"   # LLM call #1 (cheap)
    model_response: str = "claude-sonnet-5-5"       # LLM call #2
    llm_timeout_s: float = 8.0
    llm_retries: int = 1

    backend_api_key: str = ""          # empty disables the check (dev only)
    allowed_origins: list[str] = ["*"]

    max_message_chars: int = 500
    rate_limit_per_minute: int = 20
    offtopic_cooldown_strikes: int = 4
    cooldown_seconds: int = 600

    top_k_candidates: int = 200
    max_results: int = 4
    max_per_brand: int = 2
    budget_tolerance: float = 0.10     # hard SQL filter allows budget * 1.10
    enable_embeddings: bool = False    # pgvector semantic retrieval (phase 2)


settings = Settings()
