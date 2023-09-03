from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from decouple import config
def create_session():
    db_info = config('DATABASE_URI')
    engine = create_engine(db_info, echo=True)
    Session = sessionmaker(bind=engine)
    session = Session()
    return engine, session

def close_session(engine, session):
    session.close()
    engine.dispose()


Base = declarative_base()


def create_tables():
    engine, session = create_session()
    try:
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully.")
    except Exception as e:
        # Handle exceptions or errors as needed
        print(f"An error occurred while creating tables: {str(e)}")
    finally:
        close_session(engine, session)