from flask_login import current_user
from pydantic import BaseModel
from sqlalchemy import create_engine, ForeignKey
from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import relationship
from sqlalchemy.sql.schema import Column

from controllers import play_controller
from models import login_model
from db.database import Base, engine, session

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
    mission_id = Column(Integer, ForeignKey('MissionTable.id',ondelete='CASCADE'),nullable=False )
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
    try:
        Mission.__table__.create(bind=engine, checkfirst=True)
        Music.__table__.create(bind=engine, checkfirst=True)

        MissionMapName = data[len(data)-1]['MapName']
        MissionMapProducer = data[len(data)-1]['MapProducer']
        MissionThumbnail = data[len(data)-1].get('Thumbnail', "basic")
        new_mission  = Mission(MissionMapName,MissionMapProducer,MissionThumbnail, current_user.id)
        new_mission.active= True
        session.add(new_mission)
        #kyaru - 활성화용 boolean 컬럼 True로 변경
        session.commit()
        mission_id = new_mission.id

        for item in data:
            if item.get('MapName') is None:
                title = item['title']
                song = item['song']
                youtube_url = item['songURL']
                thumbnail_url = item['thumbnail']
                answer =  item['answer']
                hint = item['hint']
                new_music = Music(title, song,youtube_url,thumbnail_url,answer,hint,mission_id)
                session.add(new_music)
                session.commit()
    except SQLAlchemyError as e:
        session.rollback()  # 예외 발생 시 롤백
        print(f'Error saving data: {str(e)},test')
        return f'Error saving data: {str(e)}'


def update_to_db(data):
    try:
        mission_id= data[len(data)-1]['mission_Id']
        existing_music_ids = [item.id for item in session.query(Music).filter_by(mission_id=data[len(data)-1]['mission_Id']).all()]
        print(existing_music_ids,"yeah1")
        ids_to_keep = set(item['Music_id'] for item in data if 'Music_id' in item)
        print(ids_to_keep,"yeah2")
        for music_id in existing_music_ids:
            if music_id not in ids_to_keep:
                session.query(Music).filter_by(id=music_id).delete()

        for item in data:
            if 'mission_Id' in item:
                mission_query = session.query(Mission).filter_by(id=mission_id).first()

                if mission_query:
                    if 'MapName' in item:
                        mission_query.MapName = item['MapName']
                    if 'MapProducer' in item:
                        mission_query.MapProducer = item['MapProducer']
                    if 'Thumbnail' in item:
                        mission_query.MissionThumbnail = item['Thumbnail']

                    session.commit()  # 미션 정보 업데이트 반영

            if 'Music_id' in item:
                music_id = item['Music_id']
                if music_id is not None and music_id != "":
                    music_query = session.query(Music).filter_by(id=music_id).first()

                    if music_query:
                        if 'title' in item:
                            music_query.title = item['title']
                        if 'song' in item:
                            music_query.song = item['song']
                        if 'songURL' in item:
                            music_query.songURL = item['songURL']
                        if 'thumbnail' in item:
                            music_query.thumbnail = item['thumbnail']
                        if 'answer' in item:
                            music_query.answer = item['answer']
                        if 'hint' in item:
                            music_query.hint = item['hint']
                        # ... (다른 필드 업데이트) ...

                        session.commit()  # 음악 정보 업데이트 반영
                    else:
                        # Music_id가 없으면 새로운 음악 추가
                        title = item['title']
                        song = item['song']
                        youtube_url = item['songURL']
                        thumbnail_url = item['thumbnail']
                        answer =  item['answer']
                        hint = item['hint']
                        new_music = Music(title, song, youtube_url, thumbnail_url, answer, hint, mission_id= data[len(data)-1]['mission_Id'])
                        session.add(new_music)
                        session.commit()

        return 'Data update successful'
    except Exception as e:
        session.rollback()  # 예외 발생 시 롤백
        print(f'Error updating data: {str(e)}, yew.')
        return f'Error updating data: {str(e)}'

    # try:
    #     # 업데이트할 미션 정보 가져오기
    #     mission_id = data[-1]['Mission_id']
    #     mission_map_name = data[-1]['MapName']
    #     mission_map_producer = data[-1]['MapProducer']
    #     mission_thumbnail = data[-1].get('Thumbnail', "basic")

    #     # 미션 정보 업데이트
    #     mission_query = session.query(Mission).filter_by(id=mission_id).first()
    #     if mission_query:
    #         mission_query.MapName = mission_map_name
    #         mission_query.MapProducer = mission_map_producer
    #         mission_query.MissionThumbnail = mission_thumbnail

    #     # 미션 정보가 없을 경우 예외 처리

    #     # 미션 정보 업데이트 반영
    #     session.commit()

    #     # 음악 데이터 업데이트 또는 삭제
    #     music_data = session.query(Music).filter_by(mission_id=mission_id).all()
    #     for existing_item in music_data:
    #         matching_item = next((item for item in data if item['id'] == existing_item.id), None)
    #         if matching_item:
    #             # 새로운 데이터에 해당 아이템이 존재하면 업데이트
    #             existing_item.song = matching_item['title']
    #             # ... (다른 필드 업데이트) ...
    #             data.remove(matching_item)
    #         else:
    #             # 새로운 데이터에 해당 아이템이 없으면 삭제
    #             session.delete(existing_item)

    #     # 변경사항 커밋
    #     session.commit()
    #     return 'Data update successful'
    # except SQLAlchemyError as e:
    #     session.rollback()  # 예외 발생 시 롤백
    #     return f'Error updating data: {str(e)}'
