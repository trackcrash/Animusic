from sqlalchemy import Integer, String, DateTime, Boolean
from sqlalchemy.sql.schema import Column
from sqlalchemy import create_engine,ForeignKey
from sqlalchemy.orm import relationship
from models import login_model
from db.database import Base,engine,session
from pydantic import BaseModel
from flask_login import current_user



class Music(Base):
    __tablename__ = 'MusicTable'
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    song = Column(String(255), nullable=False)
    youtube_url = Column(String(255), nullable=False)
    thumbnail_url = Column(String(255), nullable=False)
    answer = Column(String(255), nullable=False)
    hint = Column(String(255), nullable=True)
   # 외래 키 설정
    mission_id = Column(Integer, ForeignKey('MissionTable.id'),nullable=False)
    # ORM 관계 설정 여기선 양방향 다대다 설정한거임 ㅇㅇ
    mission = relationship("Mission", back_populates="musics")
    def __init__(self, title, song, youtube_url,thumbnail_url, answer, hint, mission_id):
        self.title = title
        self.song = song
        self.youtube_url = youtube_url
        self.thumbnail_url = thumbnail_url
        self.answer = answer
        self.hint = hint
        self.mission_id = mission_id
    def __repr__(self):
        return "<Music(" , self.title, self.song, self.youtube_url ,self.thumbnail_url,self.answer,self.hint,self.mission_id,">"

class Mission(Base):
    __tablename__ = 'MissionTable'
    id = Column(Integer, primary_key=True)
    MapName = Column(String(255), nullable=False)
    MapProducer = Column(String(255), nullable=False)
    Thumbnail = Column(String(255), nullable=True)
    active = Column(Boolean, default=False)
    musics = relationship("Music", back_populates="mission")
    MapProducer_id = Column(Integer, ForeignKey('UserTable.id'),nullable=False)
    def __init__(self, MapName, MapProducer, Thumbnail,MapProducer_id):
        self.MapName = MapName
        self.MapProducer = MapProducer
        self.Thumbnail = Thumbnail
        self.MapProducer_id = MapProducer_id

def save_to_db(data):
    Mission.__table__.create(bind=engine, checkfirst=True)
    Music.__table__.create(bind=engine, checkfirst=True)
    MissionMapName = data[len(data)-1]['MapName']
    MissionMapProducer = data[len(data)-1]['MapProducer']
    if data[len(data)-1].get('Thumbnail') != None:
        MissionThumbnail = data[len(data)-1]['Thumbnail']
    else : 
        MissionThumbnail = "basic"
    MissionMapProducer_id = current_user.id
    t2 = Mission(MissionMapName,MissionMapProducer,MissionThumbnail, MissionMapProducer_id)
    
    t2.active= True
    session.add(t2)
    #kyaru - 활성화용 boolean 컬럼 True로 변경
    session.commit()
    mission_id = t2.id

    for item in data:
        if item.get('MapName') == None:
            title = item['title']
            song = item['song']
            youtube_url = item['songURL']
            thumbnail_url = item['thumbnail']
            answer =  item['answer']
            hint = item['hint']
            t1 = Music(title, song,youtube_url,thumbnail_url,answer,hint,mission_id)
            session.add(t1)
            session.commit()    
