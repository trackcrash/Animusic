from sqlalchemy import Integer, String, DateTime, Boolean
from sqlalchemy.sql.schema import Column
from sqlalchemy import create_engine
from db.database import Base,engine,session
from pydantic import BaseModel

class Music(Base):
    __tablename__ = 'MusicTable'
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    song = Column(String(255), nullable=False)
    youtube_url = Column(String(255), nullable=False)
    answer = Column(String(255), nullable=False)
    hint = Column(String(255), nullable=True)
    def __init__(self, title, song, youtube_url, answer, hint):
        self.title = title
        self.song = song
        self.youtube_url = youtube_url
        self.answer = answer
        self.hint = hint
    def __repr__(self):
        return "<Music(" , self.title, self.song, self.youtube_url ,self.answer,self.hint,">"

def save_to_db(data):
    Music.__table__.create(bind=engine, checkfirst=True)
    for item in data:
        title = item['title']
        song = item['song']
        youtube_url = item['songURL']
        answer =  item['answer']
        hint = item['hint']
        t = Music(title, song,youtube_url,answer,hint)
        session.add(t)
        session.commit()
        
def get_data():
    pass