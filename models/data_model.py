from sqlalchemy import ForeignKey
from sqlalchemy import Boolean, Integer, String
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import relationship
from sqlalchemy.sql.schema import Column

from db.database import Base, engine, session
from flask_login import current_user

from collections import deque

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
    mission_id = Column(Integer, ForeignKey('MissionTable.id', ondelete='CASCADE'), nullable=False)
    # ORM 관계 설정
    mission = relationship("Mission", back_populates="musics")

    def __init__(self, title, song, youtube_url, thumbnail_url, answer, hint, mission_id):
        self.title = title
        self.song = song
        self.youtube_url = youtube_url
        self.thumbnail_url = thumbnail_url
        self.answer = answer
        self.hint = hint
        self.mission_id = mission_id

    def __repr__(self):
        return f"title='{self.title}', song='{self.song}', youtube_url='{self.youtube_url}', thumbnail_url='{self.thumbnail_url}', answer='{self.answer}', hint='{self.hint}', mission_id='{self.mission_id}'"


class Mission(Base):
    __tablename__ = 'MissionTable'
    id = Column(Integer, primary_key=True)
    MapName = Column(String(255), nullable=False)
    MapProducer = Column(String(255), nullable=False)
    Thumbnail = Column(String(255), nullable=True)
    active = Column(Boolean, default=False)
    musics = relationship("Music", back_populates="mission")
    MapProducer_id = Column(Integer, ForeignKey('UserTable.id', ondelete='CASCADE'), nullable=False)

    def __init__(self, MapName, MapProducer, Thumbnail, MapProducer_id):
        self.MapName = MapName
        self.MapProducer = MapProducer
        self.Thumbnail = Thumbnail
        self.MapProducer_id = MapProducer_id


# 코드 구조개선 --kyaru 16/08/23 12:00
def save_to_db(data):
    print(data)
    try:
        MissionMapName = data[-1]['MapName']
        MissionMapProducer = data[-1]['MapProducer']
        MissionThumbnail = data[-1].get('Thumbnail', "basic")
        new_mission = Mission(MissionMapName, MissionMapProducer, MissionThumbnail, current_user.id)
        new_mission.active = True
        session.add(new_mission)
        session.flush()
        mission_id = new_mission.id

        for item in data:
            if not item.get('MapName'):
                new_music = Music(
                    item['title'], item['song'], item['songURL'],
                    item['thumbnail'], item['answer'], item.get('hint'),
                    mission_id
                )
                session.add(new_music)

        session.commit()
    except SQLAlchemyError as e:
        session.rollback()
        print(f'Error saving data: {str(e)}')
        return f'Error saving data: {str(e)}'
    # 세션닫기 추가
    finally:
        session.close()


# 코드 구조개선 --kyaru 16/08/23 12:00
'''
def update_to_db(data):
    try:
        mission_id = int(data[-1]['mission_Id'])
        existing_music_ids = [item.id for item in session.query(Music).filter_by(mission_id=mission_id).all()]
        ids_to_keep = {int(item['Music_id']) for item in data if 'Music_id' in item}

        for music_id in existing_music_ids:
            if music_id not in ids_to_keep:
                session.query(Music).filter_by(id=music_id).delete()

        for item in data:
            if 'mission_Id' in item:
                mission_query = session.query(Mission).filter_by(id=mission_id).first()
                if mission_query:
                    mission_query.MapName = item.get('MapName', mission_query.MapName)
                    mission_query.MapProducer = item.get('MapProducer', mission_query.MapProducer)
                    mission_query.Thumbnail = item.get('Thumbnail', mission_query.Thumbnail)

            if 'Music_id' in item:
                music_id = int(item['Music_id'])
                music_query = session.query(Music).filter_by(id=music_id).first()
                if music_query:
                    music_query.title = item.get('title', music_query.title)
                    music_query.song = item.get('song', music_query.song)
                    music_query.youtube_url = item.get('songURL',
                                                       music_query.youtube_url)  # Note the change in attribute name
                    music_query.thumbnail_url = item.get('thumbnail',
                                                         music_query.thumbnail_url)  # Note the change in attribute name
                    music_query.answer = item.get('answer', music_query.answer)
                    music_query.hint = item.get('hint', music_query.hint)
                else:
                    new_music = Music(
                        item['title'], item['song'], item['songURL'],
                        item['thumbnail'], item['answer'], item.get('hint'),
                        mission_id=mission_id
                    )
                    session.add(new_music)


        session.commit()
    except SQLAlchemyError as e:
        session.rollback()
        error_msg = f'Error saving data: {str(e)}'
        print(error_msg)
        return error_msg
    finally:
        session.close()
'''
def update_to_db(data):
    try:
        data = deque(data)
        mission_id = data.pop()['mission_Id']
        for item in data:
            if 'Music_id' in item:
                now_music_info = session.query(Music).filter_by(id=item['Music_id']).first()
                now_music_info.title = item.get('title')
                now_music_info.song = item.get('song')
                now_music_info.youtube_url = item.get('songURL')
                now_music_info.thumbnail_url = item.get('thumbnail')
                now_music_info.answer = item.get('answer')
                now_music_info.hint = item.get('hint')
                session.commit()
            else:
                new_music_info = Music(
                    title = item.get('title'),
                    song = item.get('song'),
                    youtube_url = item.get('songURL'),
                    thumbnail_url = item.get('thumbnail'),
                    answer = item.get('answer'),
                    hint = item.get('hint'),
                    mission_id = mission_id
                )
                session.add(new_music_info)
                session.commit()
    except SQLAlchemyError as e:
        session.rollback()
        error_msg = f'Error saving data: {str(e)}'
        print(error_msg)
        return error_msg
    finally:
        session.close()
