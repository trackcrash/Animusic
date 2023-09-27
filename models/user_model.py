# user login & api register model crud -- Newkyaru 13/08/2023
from datetime import datetime
from flask_login import current_user
from flask_bcrypt import Bcrypt
from sqlalchemy import Boolean, Column, Integer, String, DateTime
from db.database import Base, create_tables,create_session,close_session
from controllers import map_controller,donate_controller
from sqlalchemy.orm import relationship
from flask import jsonify
bcrypt = Bcrypt()

create_tables()

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
    last_login = Column(DateTime, nullable=True)
    is_google_authenticated = Column(Boolean, default=False)
    donations = relationship("Donation", back_populates="user")
    missions = relationship("Mission", back_populates="MapProducerUser")
    permissions = Column(Integer, nullable=False)
    profile_background = Column(String(255))
     # Donation과의 관계 설정
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
        self.permissions = 0
        self.profile_background = ""

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
    
    def update_login_time(self):
        self.last_login = datetime.utcnow()

def commit_or_rollback(session):
    try:
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"An error occurred: {e}")
        raise


def update_level_info(name, level, exp, nextexp):
    engine, session = create_session()
    try:
        userinfo = session.query(User).filter_by(name=name).first()
        if userinfo:
            userinfo.level = level
            userinfo.exp = exp
            userinfo.nextexp = nextexp
            commit_or_rollback(session)
        else:
            print(f"User with name {name} not found.")
    except Exception as e:
        # Handle exceptions or errors as needed
        print(f"An error occurred while updating user level info: {str(e)}")
    finally:
        close_session(engine, session)

# 일반 가입
def save_user(email, name, password=None, is_google_authenticated=False, level=0, exp=0, nextexp=10, character=0):
    engine, session = create_session()
    try:
        user = User(email=email, name=name, password=password, is_google_authenticated=is_google_authenticated,
                    level=level, exp=exp, nextexp=nextexp, character=character)
        session.add(user)
        commit_or_rollback(session)
        return user
    except Exception as e:
        # Handle exceptions or errors as needed
        print(f"An error occurred while saving user: {str(e)}")
        return None
    finally:
        close_session(engine, session)

def get_userinfo_by_name(name):
    engine, session = create_session()
    try:
        user_info = session.query(User).filter(User.name == name).first()
        return user_info
    except Exception as e:
        # Handle exceptions or errors as needed
        print(f"An error occurred while retrieving user info by name {name}: {str(e)}")
        return None
    finally:
        close_session(engine, session)
# 구글 가입
def save_google_user(user_info):
    engine, session = create_session()
    try:
        user = session.query(User).filter_by(email=user_info['email']).first()
        if user:
            user.is_google_authenticated = True
            user.update_login_time()
            commit_or_rollback(session)
        else:
            user = save_user(email=user_info['email'], name=user_info.get('name'), is_google_authenticated=True)
            user.update_login_time()
        commit_or_rollback(session)
        session.add(user)
        return user, session
    except Exception as e:
        # Handle exceptions or errors as needed
        print(f"An error occurred while saving Google user: {str(e)}")
        return None

def validate_user(email, password):
    user = get_user_by_email(email)
    if user and bcrypt.check_password_hash(user.password, password):
        user.update_login_time()
        assert isinstance(user, User)
        return user
    else:
        print(f"validate_user: fail")
        return None

def get_user_by_email(email):
    engine, session = create_session()
    try:
        return session.query(User).filter_by(email=email).first()
    except Exception as e:
        # Handle exceptions or errors as needed
        print(f"An error occurred while getting user by email: {str(e)}")
        return None
    finally:
        close_session(engine, session)

def get_user_by_id(user_id):
    engine, session = create_session()
    try:
        return session.query(User).filter(User.id == user_id).first()
    except Exception as e:
        # Handle exceptions or errors as needed
        print(f"An error occurred while getting user by id: {str(e)}")
        return None
    finally:
        close_session(engine, session)

def delete_account():
    if current_user.is_authenticated:
        engine, session = create_session()
        try:
            donate_controller.donate_del()
            map_controller.delete_User(current_user.id)
            user = session.query(User).filter_by(id=current_user.id).first()
            if user:
                session.delete(user)
                commit_or_rollback(session)
                return True
        except Exception as e:
            # Handle exceptions or errors as needed
            print(f"An error occurred while deleting the account: {str(e)}")
        finally:
            close_session(engine, session)
    return False

def account_insert_in_googleuser(nickname):
    if current_user.is_authenticated:
        engine, session = create_session()
        try:
            check_samename = session.query(User).filter(User.name == nickname).first()
            if check_samename:
                return False
            else:
                userinfo = session.query(User).filter_by(id=current_user.id).first()
                userinfo.name = nickname
                commit_or_rollback(session)
                return True
        except Exception as e:
            # Handle exceptions or errors as needed
            print(f"An error occurred while inserting account information for Google user: {str(e)}")
        finally:
            close_session(engine, session)
    return False

def account_insert(nickname, password, newpassword):
    if current_user.is_authenticated:
        engine, session = create_session()
        try:
            userinfo = session.query(User).filter_by(id=current_user.id).first()

            if not bcrypt.check_password_hash(userinfo.password, password):
                return False

            if session.query(User).filter(User.name == nickname).first():
                return False

            if nickname:
                userinfo.name = nickname

            if newpassword:
                hashed_password = bcrypt.generate_password_hash(newpassword)
                userinfo.password = hashed_password

            commit_or_rollback(session)
            return True
        except Exception as e:
            # Handle exceptions or errors as needed
            print(f"An error occurred while inserting account information: {str(e)}")
        finally:
            close_session(engine, session)
    return False

def insert_character_number(character_number):
    if current_user.is_authenticated:
        engine, session = create_session()
        try:
            userinfo = session.query(User).filter_by(id=current_user.id).first()
            userinfo.character = character_number
            commit_or_rollback(session)
            return {'message': '정상적으로 변경되었습니다.'}
        except Exception as e:
            # Handle exceptions or errors as needed
            print(f"An error occurred while inserting character number: {str(e)}")
        finally:
            close_session(engine, session)
    return {'message': '인증되지 않은 사용자입니다.'}

def email_check_model(email):
    engine, session = create_session()
    try:
        check_sameemail = session.query(User).filter(User.email == email).first()
        if check_sameemail:
            return False
        return True
    except Exception as e:
        # Handle exceptions or errors as needed
        print(f"An error occurred while inserting account information: {str(e)}")
    finally:
        close_session(engine, session)

def name_check_model(name):
    engine, session = create_session()
    try:
        check_samename = session.query(User).filter(User.name == name).first()
        if check_samename:
            return False
        return True
    except Exception as e:
        # Handle exceptions or errors as needed
        print(f"An error occurred while inserting account information: {str(e)}")
    finally:
        close_session(engine, session)

def password_update(email,password):
    engine, session = create_session()
    try:
        user = session.query(User).filter_by(email=email).first()
        user.password = bcrypt.generate_password_hash(password).decode('utf-8')
        commit_or_rollback(session)
    finally:
        close_session(engine, session)


def update_profile_background(user_id, profile_background):
    engine, session = create_session()
    try:
        user = session.query(User).filter_by(id=user_id).first()
        if user:
            user.profile_background = profile_background  # profile_background 필드를 업데이트합니다.
            commit_or_rollback(session)
            return True
        else:
            return False  # 사용자가 존재하지 않을 경우 False 반환
    except Exception as e:
        print(f"업데이트 오류: {e}")
        return False  # 업데이트 오류 발생 시 False 반환
    finally:
        close_session(engine, session)
