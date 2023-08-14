from sqlalchemy import Integer, String, DateTime, Boolean
from sqlalchemy.sql.schema import Column
from sqlalchemy import create_engine,ForeignKey
from sqlalchemy.orm import relationship
from models import login_model
from db.database import Base,engine,session
from pydantic import BaseModel
from flask_login import current_user
from controllers import play_controller


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

# def update_to_db(data):
    
#     for item in new_data:
#         existing_mission = Mission.query.filter_by(MissionMapName=item['MapName']).first()
#         if existing_mission:
#             # 기존 미션 데이터가 존재하면 업데이트
#             existing_mission.MissionMapProducer = item['MapProducer']
#             existing_mission.MissionThumbnail = item.get('Thumbnail', 'basic')
#             # ... (다른 필드 업데이트) ...
#         else:
#             # 기존 미션 데이터가 없으면 추가
#             new_mission = Mission(
#                 MissionMapName=item['MapName'],
#                 MissionMapProducer=item['MapProducer'],
#                 MissionThumbnail=item.get('Thumbnail', 'basic'),
#                 MissionMapProducer_id=current_user.id
#             )
#             db.session.add(new_mission)

#             db.session.commit()

#             # 미션 ID를 가져오거나 생성된 미션의 ID를 사용하여 뮤직 데이터 업데이트
#             if existing_mission:
#                 mission_id = existing_mission.id
#             else:
#                 mission_id = new_mission.id

#             new_music = Music(
#                 title=item['title'],
#                 song=item['song'],
#                 # ... (다른 필드들) ...
#                 mission_id=mission_id
#             )
#             db.session.add(new_music)
#             db.session.commit()

#         return 'Update DB successful'
#     except Exception as e:
#         return str(e), 500