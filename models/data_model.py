from sqlalchemy import ForeignKey
from sqlalchemy import Boolean, Integer, String, DECIMAL
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import relationship
from sqlalchemy.sql.schema import Column

from db.database import Base, create_session,close_session
from flask_login import current_user

from collections import deque

class Music(Base):
    __tablename__ = 'MusicTable'
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    song = Column(String(255), nullable=False)
    youtube_url = Column(String(255), nullable=False)
    thumbnail_url = Column(String(255), nullable=False)
    answer = Column(String(1024), nullable=False)
    hint = Column(String(255), nullable=True)
    # 외래 키 설정
    mission_id = Column(Integer, ForeignKey('MissionTable.id', ondelete='CASCADE'), nullable=False)
    # 시작시간, 종료시간 설정
    startTime = Column(DECIMAL(precision=9, scale=3), nullable=True)
    endTime = Column(DECIMAL(precision=9, scale=3), nullable=True)
    # ORM 관계 설정
    mission = relationship("Mission", back_populates="musics")
    category = Column(String(255), nullable=False)
    def __init__(self, title, song, youtube_url, thumbnail_url, answer, hint, mission_id, startTime, endTime,category):
        self.title = title
        self.song = song
        self.youtube_url = youtube_url
        self.thumbnail_url = thumbnail_url
        self.answer = answer
        self.hint = hint
        self.mission_id = mission_id
        self.startTime = startTime
        self.endTime = endTime
        self.category = category
    def __repr__(self):
        return f"title='{self.title}', song='{self.song}', youtube_url='{self.youtube_url}', thumbnail_url='{self.thumbnail_url}', answer='{self.answer}', hint='{self.hint}', mission_id='{self.mission_id}', startTime='{self.startTime}', endTime='{self.endTime}'"


class Mission(Base):
    __tablename__ = 'MissionTable'
    id = Column(Integer, primary_key=True)
    MapName = Column(String(255), nullable=False)
    MapProducer = Column(String(255), nullable=False)
    Thumbnail = Column(String(255), nullable=True)
    active = Column(Boolean, default=False)
    musics = relationship("Music", back_populates="mission")
    PlayNum = Column(Integer, default = 0, nullable= False)
    Description = Column(String(500), nullable=True)
    MapProducer_id = Column(Integer, ForeignKey('UserTable.id', ondelete='CASCADE'), nullable=False)
    MapProducerUser = relationship("User", back_populates="missions")
    def __init__(self, MapName, MapProducer, Thumbnail, MapProducer_id, Description, active):
        self.MapName = MapName
        self.MapProducer = MapProducer
        self.Thumbnail = Thumbnail
        self.MapProducer_id = MapProducer_id
        self.Description = Description
        self.active = active
# 코드 구조개선 --kyaru 16/08/23 12:00
def save_to_db(data):
    engine,session = create_session()
    try:
        MissionMapName = data[-1]['MapName']
        MissionMapProducer = data[-1]['MapProducer']
        MissionThumbnail = data[-1]['Thumbnail']
        MissionDescription = data[-1]['Description']
        MissionActive = True if 'fa-lock-open' in data[-1]['ActiveSetting'].values() else False
        new_mission = Mission(MissionMapName, MissionMapProducer, MissionThumbnail, current_user.id, MissionDescription, MissionActive)
        session.add(new_mission)
        session.flush()
        mission_id = new_mission.id

        for item in data:
            if not item.get('MapName'):
                new_music = Music(
                    item['title'], item['song'], item['songURL'],
                    item['thumbnail'], item['answer'], item.get('hint'),
                    mission_id, item.get('startTime'), item.get('endTime'),item.get('category')
                )
                session.add(new_music)

        session.commit()
    except SQLAlchemyError as e:
        session.rollback()
        print(f'Error saving data: {str(e)}')
        return f'Error saving data: {str(e)}'
    # 세션닫기 추가
    finally:
       close_session(engine,session)

def playNumUp(id):
    engine,session = create_session()
    try:
        mission = session.query(Mission).filter_by(id = id).first()
        mission.PlayNum = mission.PlayNum + 1
        session.commit()
    except SQLAlchemyError as e:
        session.rollback()
        print(f'Error saving data: {str(e)}')
        return f'Error saving data: {str(e)}'
    # 세션닫기 추가
    finally:
       close_session(engine,session)

def update_to_db(data):
    engine, session = create_session()
    try:
        data = deque(data)
        mission_data = data.pop()
        mission_id = mission_data['mission_Id']
        now_mission_info = session.query(Mission).filter_by(id=mission_id).first()
        now_mission_info.MapName = mission_data['MapName']
        now_mission_info.Thumbnail = mission_data['Thumbnail']
        now_mission_info.Description = mission_data['Description']
        now_mission_info.active = True if 'fa-lock-open' in mission_data['ActiveSetting'].values() else False
        now_music_info = session.query(Music).filter_by(mission_id=mission_id).all() #현재 맵 미션id를 가진 모든 곡 불러오기
        now_music_idset = set(music.id for music in now_music_info) # id값만 추출한 set() 생성
        data_idset = set() # 비어있는 set() 생성
        for item in data:
            if 'Music_id' in item:
                now_music_info = session.query(Music).filter_by(id=item['Music_id']).first()
                now_music_info.title = item.get('title')
                now_music_info.song = item.get('song')
                now_music_info.youtube_url = item.get('songURL')
                now_music_info.thumbnail_url = item.get('thumbnail')
                now_music_info.answer = item.get('answer')
                now_music_info.hint = item.get('hint')
                now_music_info.startTime = item.get('startTime')
                now_music_info.endTime = item.get('endTime')
                now_music_info.category = item.get('category')
                data_idset.add(int(item['Music_id'])) # 전송받은 데이터 중 id가 있는 곡들의 id를 모두저장
            else:
                new_music_info = Music(
                    title = item.get('title'),
                    song = item.get('song'),
                    youtube_url = item.get('songURL'),
                    thumbnail_url = item.get('thumbnail'),
                    answer = item.get('answer'),
                    hint = item.get('hint'),
                    mission_id = mission_id,
                    startTime = item.get('startTime'),
                    endTime = item.get('endTime'),
                    category = item.get('category')
                )
                session.add(new_music_info)
        idset_for_delete = now_music_idset - data_idset # DB에 있는 곡 중에 전송받은 곡을 제외한 나머지
        for delete_id in idset_for_delete: # 해당 id를 가진 모든 곡을 삭제
            delete_music_info = session.query(Music).filter_by(id=delete_id).first()
            session.delete(delete_music_info)
        session.commit()
    except SQLAlchemyError as e:
        session.rollback()
        error_msg = f'Error saving data: {str(e)}'
        print(error_msg)
        return error_msg
    finally:
        close_session(engine,session)