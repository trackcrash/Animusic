from sqlalchemy import create_engine,inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from decouple import config
dbInfo = config('DATABASE_URI')
engine = create_engine(dbInfo, echo=True)
Session = sessionmaker(engine)
session = Session()

Base = declarative_base()




def create_tables():
    """Create tables in the database."""
    Base.metadata.create_all(bind=engine)

# def ensure_tables_exist():
#     for table in tableList:
#         if not SuchTable(table.__tablename__):
#             table.__table__.create(bind=engine, checkfirst=True)

# def SuchTable(table_Name):
#     inspector = inspect(engine)
#     if table_Name in inspector.get_table_names():
#         return True
#     return False 