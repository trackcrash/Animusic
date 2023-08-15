# user login & api register model crud -- Newkyaru 13/08/2023
from decouple import config
from flask_bcrypt import Bcrypt
from sqlalchemy import Boolean, Column, create_engine, inspect, Integer, String

from db.database import Base, session as db_session

bcrypt = Bcrypt()

# if not exist table, create table
DATABASE_URI = config('DATABASE_URI')
engine = create_engine(DATABASE_URI)
inspector = inspect(engine)
if not inspector.has_table("UserTable"):
    Base.metadata.create_all(bind=engine)


class User(Base):
    __tablename__ = 'UserTable'

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=True)
    password = Column(String(255), nullable=True)
    level = Column(Integer, nullable=False)
    exp = Column(Integer, nullable=False)
    nextexp = Column(Integer, nullable=False)
    character = Column(Integer, nullable=False)
    is_google_authenticated = Column(Boolean, default=False)

    def __init__(self, email, name, password, level, exp, nextexp, character, is_google_authenticated):
        self.email = email
        self.name = name
        if password:
            self.password = bcrypt.generate_password_hash(password).decode('utf-8')
        self.level = level
        self.exp = exp
        self.nextexp = nextexp
        self.character = character
        self.is_google_authenticated = is_google_authenticated

    @property
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

    @property
    def get_id(self):
        return str(self.id)


# 일반 가입
def save_user(email, name, password=None, is_google_authenticated=False, level=0, exp=0, nextexp=10, character=0):
    user = User(email=email, name=name, password=password, is_google_authenticated=is_google_authenticated,
                level=level, exp=exp, nextexp=nextexp, character=character)
    db_session.add(user)
    db_session.commit()
    return user


# 구글 가입
def save_google_user(user_info):
    user = db_session.query(User).filter_by(email=user_info['email']).first()
    if user:
        user.is_google_authenticated = True
        db_session.commit()
    else:
        user = save_user(email=user_info['email'], name=user_info.get('name'), is_google_authenticated=True)
    return user


# 일반 로그인 사용자 검증
def validate_user(email, password):
    user = db_session.query(User).filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password, password):
        return user
    return None


def get_user_by_email(email):
    return db_session.query(User).filter_by(email=email).first()


def get_user_by_id(user_id):
    return db_session.query(User).filter(User.id == user_id).first()
