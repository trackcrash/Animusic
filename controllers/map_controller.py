import random, requests
from decouple import config
from flask import jsonify, request, render_template
from flask_login import current_user
from sqlalchemy import func, inspect ,desc
from models import data_model
from db.database import create_session,close_session
from models.data_model import Mission, Music

def commit_or_rollback(session):
    try:
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"An error occurred: {e}")
        raise



def SuchTable(table_Name):
    engine, session = create_session()
    try:
        inspector = inspect(engine)
        if table_Name in inspector.get_table_names():
            return True
        return False
    except Exception as e:
        # Handle exceptions or errors as needed
        print(f"An error occurred while checking for the table {table_Name}: {str(e)}")
        return False
    finally:
        close_session(engine, session)

def ensure_tables_exist():
    engine, session = create_session()
    try:
        for table in [Music, Mission]:
            if not SuchTable(table.__tablename__):
                table.__table__.create(bind=engine, checkfirst=True)
    except Exception as e:
        # Handle exceptions or errors as needed
        print(f"An error occurred while ensuring table existence: {str(e)}")
    finally:
        close_session(engine, session)

def map_controller():
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
    return data


def update_to_db():
    data = request.json
    data_model.update_to_db(data)
    return jsonify({"message": "Data received and processed!"})

def play_view(data=None):
    return render_template('play.html', data=data)

def play_post_response(data):
    return jsonify(data)


def submit_to_db():
    data = request.json
    data_model.save_to_db(data)
    return jsonify({"message": "Data received and processed!"})

def show_table():
    engine, session = create_session()
    try:
        queries = session.query(Music)
        entries = [dict(id=q.id, title=q.title, song=q.song, youtube_url=q.youtube_url, thumbnail_url=q.thumbnail_url, answer=q.answer, hint=q.hint if q.hint is not None else "", startTime=q.startTime if q.startTime is not None else "", endTime=q.endTime if q.endTime is not None else "") for q in queries]
        return entries
    except Exception as e:
        # Handle exceptions or errors as needed
        print(f"An error occurred while retrieving music records: {str(e)}")
        return []
    finally:
        close_session(engine, session)


def show_table_bymissionid(missionid):
    engine,session = create_session()
    try:
        queries = session.query(Music).filter(Music.mission_id==missionid)
        entries = [dict(id=q.id, title=q.title, song=q.song,youtube_url=q.youtube_url,thumnail_url=q.thumbnail_url, answer= q.answer, hint= q.hint if q.hint is not None else "", startTime=q.startTime if q.startTime is not None else "0", endTime = q.endTime if q.endTime is not None and (q.startTime is None or q.endTime > q.startTime) else "0") for q in queries]
    except Exception as e:
        # Handle exceptions or errors as needed
        print(f"An error occurred while retrieving music records: {str(e)}")
        return []
    finally:
        close_session(engine, session)
    return entries
    
def show_table_mission_top_five():
    engine,session = create_session()
    try:
        queries = session.query(Mission).order_by(desc(Mission.PlayNum),desc(Mission.id)).limit(6)
        entries = [dict(id=q.id, Description=q.Description,MapName=q.MapName,MapProducer=q.MapProducer, Thumbnail= q.Thumbnail,MapProducer_id=q.MapProducer_id, PlayNum = q.PlayNum , MusicNum = session.query(func.count(Music.id)).filter_by(mission_id=q.id).scalar()) for q in queries]        
    except Exception as e:
        # Handle exceptions or errors as needed
        print(f"An error occurred while retrieving music records: {str(e)}")
        return []
    finally:
        close_session(engine, session)
    return entries
    

def get_music_data(data):
    mission_id = data
    return mission_id



def show_mission():
    engine,session = create_session()
    try:
        queries = session.query(Mission)
        # 노래 갯수 추가
        entries = [dict(id=q.id, Description=q.Description,MapName=q.MapName,MapProducer=q.MapProducer, Thumbnail= q.Thumbnail,MapProducer_id=q.MapProducer_id, PlayNum = q.PlayNum , MusicNum = session.query(func.count(Music.id)).filter_by(mission_id=q.id).scalar()) for q in queries]        
        
    except Exception as e:
        # Handle exceptions or errors as needed
        print(f"An error occurred while retrieving music records: {str(e)}")
        return []
    finally:
        close_session(engine, session)
    return entries
    


def show_mission_active():
    engine,session = create_session()
    try:
        queries = session.query(Mission).filter(Mission.active == True)
        # 노래 갯수 추가
        entries = [dict(id=q.id, Description=q.Description,MapName=q.MapName,MapProducer=q.MapProducer, Thumbnail= q.Thumbnail,MapProducer_id=q.MapProducer_id, PlayNum = q.PlayNum , MusicNum = session.query(func.count(Music.id)).filter_by(mission_id=q.id).scalar()) for q in queries]
    except Exception as e:
        # Handle exceptions or errors as needed
        print(f"An error occurred while retrieving music records: {str(e)}")
        return []
    finally:
        close_session(engine, session)
    return entries
    

    
def show_mission_byProducer():
    engine,session = create_session()
    try:
        queries = session.query(Mission).filter(Mission.MapProducer_id == current_user.id)
        entries = [dict(id=q.id, Description=q.Description,MapName=q.MapName,MapProducer=q.MapProducer, Thumbnail= q.Thumbnail,MapProducer_id=q.MapProducer_id, PlayNum = q.PlayNum , MusicNum = session.query(func.count(Music.id)).filter_by(mission_id=q.id).scalar()) for q in queries]
    except Exception as e:
        # Handle exceptions or errors as needed
        print(f"An error occurred while retrieving music records: {str(e)}")
        return []
    finally:
        close_session(engine, session)
    return entries


def show_mission_byid(id):
    engine,session = create_session()
    try:
        queries = session.query(Mission).filter(Mission.id == id)
        entries = [dict(id=q.id, active=q.active, Description=q.Description,MapName=q.MapName,MapProducer=q.MapProducer, Thumbnail= q.Thumbnail,MapProducer_id=q.MapProducer_id, PlayNum = q.PlayNum , MusicNum = session.query(func.count(Music.id)).filter_by(mission_id=q.id).scalar()) for q in queries]
    except Exception as e:
        # Handle exceptions or errors as needed
        print(f"An error occurred while retrieving music records: {str(e)}")
        return []
    finally:
        close_session(engine, session)
    return entries

     
#missionid로 맵 삭제 use on map.py deleteMission()
def delete_Mission(id):
    engine, session = create_session()
    try:
        if show_table_bymissionid(id):
            session.query(Music).filter_by(mission_id=id).delete()

        if show_mission_byid(id):
            data_to_delete = session.query(Mission).filter_by(id=id).first()
            session.delete(data_to_delete)
        
        commit_or_rollback(session)
    finally:
        close_session(engine, session)

    return '''
        <html>
            <head>
                <title>삭제 완료</title>
                <script>
                    alert("삭제가 완료 되었습니다.");
                    location.href='/Map';
                </script>
            </head>
            <body>
            </body>
        </html>
    '''
#missionid로 맵 삭제 use on map.py deleteMission()
def delete_User(id):
    engine, session = create_session()
    try:
        # Mission 테이블에서 MapProducer_id가 주어진 id와 일치하는 모든 레코드 찾기
        data_to_delete = session.query(Mission).filter_by(MapProducer_id=id).all()
        
        # 각 Mission 레코드에 대해 관련 Music 레코드를 삭제하고 Mission 레코드 삭제
        for mission in data_to_delete:
            # 해당 Mission과 관련된 Music 레코드 삭제
            session.query(Music).filter_by(mission_id=mission.id).delete()
            # Mission 레코드 삭제
            session.delete(mission)
        commit_or_rollback(session)
    finally:
        close_session(engine, session)
#videoid가 사용가능한지 체크 use on map.py check_videoid()
def videoid_check(videoid_list):
    result = videoid_list.copy()
    convert_list = set()
    for id_count, videoid in enumerate(videoid_list):
        convert_list.add("&id=" + videoid)
        if (id_count + 1) % 42 == 0:
            request_text = "".join(map(str, convert_list))
            api_result = requests.get(f'https://www.googleapis.com/youtube/v3/videos?key={config("YOUTUBE_API_KEY")}&part=status{request_text}')
            renewable_list = set(item['id'] for item in api_result.json()['items'] if item['status']['embeddable'])
            result -= renewable_list
            convert_list.clear()
    if len(convert_list) > 0:
        request_text = "".join(map(str, convert_list))
        api_result = requests.get(f'https://www.googleapis.com/youtube/v3/videos?key={config("YOUTUBE_API_KEY")}&part=status{request_text}')
        renewable_list = set(item['id'] for item in api_result.json()['items'] if item['status']['embeddable'])
        result -= renewable_list
    return jsonify(list(result))