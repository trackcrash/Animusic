#user login & api register model crud -- Newkyaru 13/08/2023
from sqlalchemy import Column, Integer, String, Boolean, create_engine, inspect
from db.database import Base, session as db_session
from flask_bcrypt import Bcrypt
from decouple import config
bcrypt = Bcrypt()
#if not exist table, create table
DATABASE_URI = config('DATABASE_URI')
engine = create_engine(DATABASE_URI)

class User(Base):
    __tablename__ = 'UserTable'
    
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=True)
    password = Column(String(255), nullable=True)
    is_google_authenticated = Column(Boolean, default=False)

    def __init__(self, email, name=None, password=None, is_google_authenticated=False):
        self.email = email
        self.name = name
        if password:
            self.password = bcrypt.generate_password_hash(password).decode('utf-8')
        self.is_google_authenticated = is_google_authenticated

    def verify_password(self, password):
        return bcrypt.check_password_hash(self.password, password)
    @property
    def is_authenticated(self):
        return True
    @property
    def is_active(self):
        return True
    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        return str(self.id)

#일반 로그인용
def save_user(email, name, password=None, is_google_authenticated=False):
    user = User(email=email, name=name, password=password, is_google_authenticated=is_google_authenticated)
    db_session.add(user)
    db_session.commit()
    return user

#구글 로그인용
def save_google_user(user_info):
    user = db_session.query(User).filter_by(email=user_info['email']).first()
    if not user:
        user = save_user(email=user_info['email'], name=user_info.get('name'), is_google_authenticated=True)
    else:
        user.is_google_authenticated = True
        db_session.commit()
    return user

#일반 로그인 사용자 검증
def validate_user(email, password):
    user = db_session.query(User).filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password, password):
        return user
    return None

def get_user_by_email(email):
    return db_session.query(User).filter_by(email=email).first()

def get_user_by_id(user_id):
    user = db_session.query(User).filter(User.id == user_id).first()
    return user

inspector = inspect(engine)
if not inspector.has_table("UserTable"):
    Base.metadata.create_all(bind=engine)