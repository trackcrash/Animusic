from sqlalchemy import ForeignKey
from sqlalchemy import Boolean, Integer, String
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import relationship
from sqlalchemy.sql.schema import Column

from db.database import Base, engine, session
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
<<<<<<< Updated upstream
   # 외래 키 설정
    mission_id = Column(Integer, ForeignKey('MissionTable.id',ondelete='CASCADE'),nullable=False )
    # ORM 관계 설정
    mission = relationship("Mission", back_populates="musics")

    def __init__(self, title, song, youtube_url,thumbnail_url, answer, hint, mission_id):
=======
    # 외래 키 설정
    mission_id = Column(Integer, ForeignKey('MissionTable.id', ondelete='CASCADE'), nullable=False)
    # ORM 관계 설정
    mission = relationship("Mission", back_populates="musics")

    def __init__(self, title, song, youtube_url, thumbnail_url, answer, hint, mission_id):
>>>>>>> Stashed changes
        self.title = title
        self.song = song
        self.youtube_url = youtube_url
        self.thumbnail_url = thumbnail_url
        self.answer = answer
        self.hint = hint
        self.mission_id = mission_id

    def __repr__(self):
<<<<<<< Updated upstream
        return "<Music(" , self.title, self.song, self.youtube_url ,self.thumbnail_url,self.answer,self.hint,self.mission_id,">"
=======
        return "<Music(", self.title, self.song, self.youtube_url, self.thumbnail_url, self.answer, self.hint, self.mission_id, ">"
>>>>>>> Stashed changes


class Mission(Base):
    __tablename__ = 'MissionTable'
    id = Column(Integer, primary_key=True)
    MapName = Column(String(255), nullable=False)
    MapProducer = Column(String(255), nullable=False)
    Thumbnail = Column(String(255), nullable=True)
    active = Column(Boolean, default=False)
    musics = relationship("Music", back_populates="mission")
<<<<<<< Updated upstream
    MapProducer_id = Column(Integer, ForeignKey('UserTable.id'),nullable=False)

    def __init__(self, MapName, MapProducer, Thumbnail,MapProducer_id):
=======
    MapProducer_id = Column(Integer, ForeignKey('UserTable.id'), nullable=False)

    def __init__(self, MapName, MapProducer, Thumbnail, MapProducer_id):
>>>>>>> Stashed changes
        self.MapName = MapName
        self.MapProducer = MapProducer
        self.Thumbnail = Thumbnail
        self.MapProducer_id = MapProducer_id

<<<<<<< Updated upstream
#코드 구조개선 --kyaru 16/08/23 12:00
=======

# 코드 구조개선 --kyaru 16/08/23 12:00
>>>>>>> Stashed changes
def save_to_db(data):
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
<<<<<<< Updated upstream
    #세션닫기 추가
    finally:
        session.close()
        
#코드 구조개선 --kyaru 16/08/23 12:00
=======
    # 세션닫기 추가
    finally:
        session.close()


# 코드 구조개선 --kyaru 16/08/23 12:00
>>>>>>> Stashed changes
def update_to_db(data):
    try:
        mission_id = data[-1]['mission_Id']
        existing_music_ids = [item.id for item in session.query(Music).filter_by(mission_id=mission_id).all()]
        ids_to_keep = {item['Music_id'] for item in data if 'Music_id' in item}
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
                music_id = item['Music_id']
                music_query = session.query(Music).filter_by(id=music_id).first()
                if music_query:
                    music_query.title = item.get('title', music_query.title)
                    music_query.song = item.get('song', music_query.song)
                    music_query.songURL = item.get('songURL', music_query.songURL)
                    music_query.thumbnail = item.get('thumbnail', music_query.thumbnail)
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
        print(f'Error saving data: {str(e)}')
        return f'Error saving data: {str(e)}'
<<<<<<< Updated upstream
    #세션닫기 추가
=======
    # 세션닫기 추가
>>>>>>> Stashed changes
    finally:
        session.close()