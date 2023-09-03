# user login & api register model crud -- Newkyaru 13/08/2023
from flask_login import current_user
from flask_bcrypt import Bcrypt
from sqlalchemy import Boolean, Column, Integer, String
from db.database import Base, create_tables,create_session,close_session
from controllers import map_controller
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

    def get_id(self):
        return str(self.id)
    
    

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
            commit_or_rollback(session)
        else:
            user = save_user(email=user_info['email'], name=user_info.get('name'), is_google_authenticated=True)
        return user
    except Exception as e:
        # Handle exceptions or errors as needed
        print(f"An error occurred while saving Google user: {str(e)}")
        return None
    finally:
        close_session(engine, session)

def validate_user(email, password):
    engine, session = create_session()
    try:
        user = session.query(User).filter_by(email=email).first()
        if user and bcrypt.check_password_hash(user.password, password):
            return user
        return None
    except Exception as e:
        # Handle exceptions or errors as needed
        print(f"An error occurred while validating user: {str(e)}")
        return None
    finally:
        close_session(engine, session)

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