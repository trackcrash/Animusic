from flask import jsonify, request
from flask_login import current_user
from sqlalchemy import func, inspect
from models import data_model
from views import play_view
from db.database import session,engine
from models.data_model import Mission, Music
#db에 테이블 존재하는지 확인하고 없으면 생성
def ensure_tables_exist():
    for table in [Music, Mission]:
        if not SuchTable(table.__tablename__):
            table.__table__.create(bind=engine, checkfirst=True)

def play_controller():
    data = None
    id = request.args.get('id')
    if id is not None:
        mission_data = show_mission_byid(id)
        if not current_user.is_authenticated or mission_data[0]['MapProducer_id'] != current_user.id:
            return '''
                <html>
                    <head>
                        <title>권한 오류</title>
                        <script>
                            alert("권한이 없습니다.");
                            history.go(-1);
                        </script>
                    </head>
                    <body>
                    </body>
                </html>
            '''
        data = [mission_data, show_table_bymissionid(id)]
    return play_view.play_view(data)


def SuchTable(table_Name):
    inspector = inspect(engine)
    if table_Name in inspector.get_table_names():
        return True
    return False


def submit_to_db():
    data = request.json
    data_model.save_to_db(data)
    return jsonify({"message": "Data received and processed!"})


def update_to_db():
    data = request.json
    data_model.update_to_db(data)
    return jsonify({"message": "Data received and processed!"})


def show_table():
    Music.__table__.create(bind=engine, checkfirst=True)
    if SuchTable("MusicTable"):
        queries = session.query(Music)
        entries = [dict(id=q.id, title=q.title, song=q.song,youtube_url=q.youtube_url,thumnail_url=q.thumbnail_url, answer= q.answer, hint= q.hint) for q in queries]
        return entries


def show_table_bymissionid(missionid):
    Music.__table__.create(bind=engine, checkfirst=True)
    if SuchTable("MusicTable"):
        queries = session.query(Music).filter(Music.mission_id==missionid)
        # DB상의 썸네일 이미지링크가 전부 바뀌기 전 까지 유지
        entries = [dict(id=q.id, title=q.title, song=q.song,youtube_url=q.youtube_url,thumnail_url=q.thumbnail_url.replace("maxresdefault", "sddefault"), answer= q.answer, hint= q.hint) for q in queries]
        return entries
    

def get_music_data(data):
    mission_id = data
    return mission_id

def show_mission():
    Mission.__table__.create(bind=engine, checkfirst=True)
    if SuchTable("MissionTable"):
        queries = session.query(Mission)
        # 노래 갯수 추가
        entries = [dict(id=q.id, MapName=q.MapName,MapProducer=q.MapProducer, Thumbnail= q.Thumbnail,MapProducer_id=q.MapProducer_id, MusicNum = session.query(func.count(Music.id)).filter_by(mission_id=q.id).scalar()) for q in queries]
        return entries

def show_mission_active():
    Mission.__table__.create(bind=engine, checkfirst=True)
    if SuchTable("MissionTable"):
        queries = session.query(Mission).filter(Mission.active == True)
        # 노래 갯수 추가
        entries = [dict(id=q.id, MapName=q.MapName,MapProducer=q.MapProducer, Thumbnail= q.Thumbnail,MapProducer_id=q.MapProducer_id, MusicNum = session.query(func.count(Music.id)).filter_by(mission_id=q.id).scalar()) for q in queries]
        return entries
    
def show_mission_byProducer():
    Mission.__table__.create(bind=engine, checkfirst=True)
    if SuchTable("MissionTable"):
        queries = session.query(Mission).filter(Mission.MapProducer_id == current_user.id)
        entries = [dict(id=q.id, MapName=q.MapName, MapProducer=q.MapProducer, Thumbnail= q.Thumbnail,MapProducer_id=q.MapProducer_id) for q in queries]
        return entries


def show_mission_byid(id):
    Mission.__table__.create(bind=engine, checkfirst=True)
    if SuchTable("MissionTable"):
        queries = session.query(Mission).filter(Mission.id == id)
        entries = [dict(id=q.id, MapName=q.MapName,MapProducer=q.MapProducer, Thumbnail= q.Thumbnail, MapProducer_id=q.MapProducer_id) for q in queries]
        return entries



def delete_User(id):
    data = session.query(Mission).filter(Mission.MapProducer_id == id).all()
    for mission_item  in data:
        if show_table_bymissionid(mission_item.id):
            session.query(Music).filter_by(mission_id=mission_item.id).delete()
            session.commit()
    if data:
        session.query(Mission).filter(Mission.MapProducer_id == id).delete()
        session.commit()

    # if show_mission_byid(id):
        

def delete_Mission(id):
    if show_table_bymissionid(id):
        session.query(Music).filter_by(mission_id=id).delete()
        session.commit()
    if show_mission_byid(id):
        data_to_delete = session.query(Mission).filter_by(id=id).first()
        session.delete(data_to_delete)
        session.commit()

    return '''
        <html>
            <head>
                <title>삭제 완료</title>
                <script>
                    alert("삭제가 완료 되었습니다.");
                    location.href='/';
                </script>
            </head>
            <body>
            </body>
        </html>
    '''