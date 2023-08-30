import random, requests
from decouple import config
from flask import jsonify, request, render_template
from flask_login import current_user
from sqlalchemy import func, inspect
from models import data_model
from db.database import session,engine
from models.data_model import Mission, Music

#db에 테이블 존재하는지 확인하고 없으면 생성
def ensure_tables_exist():
    for table in [Music, Mission]:
        if not SuchTable(table.__tablename__):
            table.__table__.create(bind=engine, checkfirst=True)

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

def single_make_answer(mission_id):
    data = show_table_bymissionid(mission_id)
    result = []

    for item in data:
        youtube_embed_url = f"https://www.youtube.com/embed/{item['youtube_url'].split('=')[-1]}?autoplay=1"
        answer_list = [answer.strip() for answer in item['answer'].split(',')]
        music_data = {
            'hint': item['hint'],
            'is_answered': 'false',
            'answer_list': answer_list,
            'youtube_embed_url': youtube_embed_url,
            'title': item['title'],
            'song': item['song'],
            'startTime' : item['startTime'],
            'endTime' : item['endTime']
        }
        result.append(music_data)

    random.shuffle(result)
    return result

def SuchTable(table_Name):
    inspector = inspect(engine)
    if table_Name in inspector.get_table_names():
        return True
    return False


def submit_to_db():
    data = request.json
    data_model.save_to_db(data)
    return jsonify({"message": "Data received and processed!"})


def show_table():
    Music.__table__.create(bind=engine, checkfirst=True)
    if SuchTable("MusicTable"):
        queries = session.query(Music)
        entries = [dict(id=q.id, title=q.title, song=q.song,youtube_url=q.youtube_url,thumnail_url=q.thumbnail_url, answer= q.answer, hint= q.hint if q.hint is not None else "", startTime=q.startTime if q.startTime is not None else "", endTime=q.endTime if q.endTime is not None else "") for q in queries]
        return entries


def show_table_bymissionid(missionid):
    Music.__table__.create(bind=engine, checkfirst=True)
    if SuchTable("MusicTable"):
        queries = session.query(Music).filter(Music.mission_id==missionid)
        entries = [dict(id=q.id, title=q.title, song=q.song,youtube_url=q.youtube_url,thumnail_url=q.thumbnail_url, answer= q.answer, hint= q.hint if q.hint is not None else "", startTime=q.startTime if q.startTime is not None else "0", endTime = q.endTime if q.endTime is not None and (q.startTime is None or q.endTime > q.startTime) else "0") for q in queries]
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
        entries = [dict(id=q.id, MapName=q.MapName, MapProducer=q.MapProducer, Thumbnail= q.Thumbnail,MapProducer_id=q.MapProducer_id,MusicNum=session.query(Music).filter(Music.mission_id == q.id).count()) for q in queries]
        return entries


def show_mission_byid(id):
    Mission.__table__.create(bind=engine, checkfirst=True)
    if SuchTable("MissionTable"):
        queries = session.query(Mission).filter(Mission.id == id)
        entries = [dict(id=q.id, MapName=q.MapName,MapProducer=q.MapProducer, Thumbnail= q.Thumbnail, MapProducer_id=q.MapProducer_id) for q in queries]
        return entries

     
#missionid로 맵 삭제 use on map.py deleteMission()
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

#Youtube API 가 POST 방식으로도 요청받는지 확인 해야 됨 (아직 테스트 안해봤음)
'''
def videoid_check(videoid_list):
    result = videoid_list.copy()
    convert_list = set()

    api_url = 'https://www.googleapis.com/youtube/v3/videos'
    api_key = config("YOUTUBE_API_KEY")

    data = {
        'key': api_key,
        'part': 'status',
        'id': list(videoid_list)
    }

    api_result = requests.post(api_url, data=data)
    renewable_list = set(item['id'] for item in api_result.json()['items'] if item['status']['embeddable'])
    result -= renewable_list
    return jsonify(list(result))
'''