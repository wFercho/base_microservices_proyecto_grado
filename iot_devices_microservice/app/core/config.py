import os

class Config:
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    IOT_DEVICES_DATABASE_URL = os.getenv("IOT_DEVICES_DATABASE_URL")

    if ENVIRONMENT not in {"development", "test", "production"}:
        raise ValueError("ENVIRONMENT debe ser 'development', 'test' o 'production'.")

    DEBUG = ENVIRONMENT == "development"
    if ENVIRONMENT == "production":
        ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",")
    else:
        ALLOWED_ORIGINS = ["*"]
