from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from decouple import config
dbInfo = config('DATABASE_URI')
engine = create_engine(dbInfo, echo=True)
Session = sessionmaker(engine)
session = Session()

Base = declarative_base()


def create_tables():
    Base.metadata.create_all(bind=engine)