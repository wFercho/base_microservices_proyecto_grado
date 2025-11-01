import os
from logging.config import fileConfig
from sqlalchemy import create_engine
from app.db.session import Base  # Importación corregida
from alembic import context
from dotenv import load_dotenv

load_dotenv()

config = context.config
fileConfig(config.config_file_name)
target_metadata = Base.metadata



def run_migrations_online():
    connectable = create_engine(os.getenv("IOT_DEVICES_DATABASE_URL"))
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True
        )
        with context.begin_transaction():
            context.run_migrations()

run_migrations_online()