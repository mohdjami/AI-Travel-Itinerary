from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    GROQ_API_KEY: str
    GEMINI_API_KEY: str
    MODEL_TEMPERATURE: float = 0.7
    MAX_RETRIES: int = 3
    pinecone_api_key: str
    pinecone_env: str
    debug_mode: bool = False
    log_level: str = "INFO"
    default_budget: int = 1000
    default_trip_duration: int = 7
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()