import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()

class Settings:
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_NAME: str = os.getenv("DB_NAME", "Susovi_Dash")
    DB_USER: str = os.getenv("DB_USER", "admin_user")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "Sysnov@321")
    DB_PORT: int = int(os.getenv("DB_PORT", 5432))
    
    # PostgreSQL connection - URL encode password to handle special characters like @
    DATABASE_URL: str = f"postgresql+psycopg2://{DB_USER}:{quote_plus(DB_PASSWORD)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", 8000))

settings = Settings()
