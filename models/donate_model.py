from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from flask_login import current_user
from flask_bcrypt import Bcrypt
from sqlalchemy import Boolean, Column, Integer, String, DateTime
from db.database import Base, create_tables,create_session,close_session
from sqlalchemy.orm import relationship
from flask import jsonify

class Donation(Base):
    __tablename__ = 'DonationTable'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('UserTable.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    donation_date = Column(DateTime, default=datetime.utcnow, nullable=False)

   # Donation 클래스의 user 속성 수정
    user = relationship("User", back_populates="donations")
    def __init__(self, user_id, amount, name):
        self.name = name
        self.user_id = user_id
        self.amount = amount

def commit_or_rollback(session):
    try:
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"An error occurred: {e}")
        raise       
def donation_delete():
    if current_user.is_authenticated:
        engine, session = create_session()
        try:
            donations = session.query(Donation).filter_by(user_id=current_user.id).all()
            for donation in donations:
                session.delete(donation)
        except Exception as e:
            # 예외 또는 오류 처리
            print(f"An error occurred while deleting the account: {str(e)}")
        finally:
            close_session(engine, session)
    return False
def save_donation(amount, name):
    engine, session = create_session()
    try:
        donation = Donation(user_id=current_user.id, amount=amount, name=name)
        session.add(donation)
        session.commit()
    except Exception as e:
        # 예외 또는 오류 처리
        print(f"An error occurred while deleting the account: {str(e)}")
    finally:
        close_session(engine, session)
    # Donation 객체를 데이터베이스에 추가합니다.
