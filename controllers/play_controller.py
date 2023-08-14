from flask import request, jsonify
from models import data_model
from views import play_view
from db.database import session,engine
from flask_login import current_user
from models.data_model import Music,Mission
from sqlalchemy import inspect
#play_controller backup
# if request.method == 'POST':
    #     title = request.form.get('title')
    #     song = request.form.get('song')
    #     youtube_url = request.form.get('youtube_url')
    #     # Save data to DB
    #     data_model.save_data(title, song, youtube_url)
        # return play_view.play_post_response({"title": title, "song": song, "youtube_url": youtube_url})

def play_controller():
    data = None
    if request.args.get('id') != None:
        id = request.args.get('id')
        data = [show_mission_byid(id),show_table_bymissionid(id)]
    return play_view.play_view(data)

def SuchTable(table_Name):
    inspector = inspect(engine)
    if table_Name in inspector.get_table_names():
        return True
    else :
        return False
 
def submit_to_db():
    data = request.json
    data_model.save_to_db(data)
    return jsonify({"message": "Data received and processed!"})

def show_table():
    Music.__table__.create(bind=engine, checkfirst=True)
    if SuchTable("MusicTable"):
        queries = session.query(Music)
        entries = [dict(id=q.id, title=q.title, song=q.song,youtube_url=q.youtube_url,thumnail_url=q.thumbnail_url, answer= q.answer, hint= q.hint) for q in queries]
        return entries
    
def show_table_bymissionid(missionid):
    Music.__table__.create(bind=engine, checkfirst=True)
    if SuchTable("MissionTable"):
        queries = session.query(Music).filter(Music.mission_id==missionid)
        entries = [dict(id=q.id, title=q.title, song=q.song,youtube_url=q.youtube_url,thumnail_url=q.thumbnail_url, answer= q.answer, hint= q.hint) for q in queries]
        return entries

def show_mission_index():
    Mission.__table__.create(bind=engine, checkfirst=True)
    if SuchTable("MusicTable"):
        queries = session.query(Mission)
        entries = [dict(id=q.id, MapName=q.MapName,MapProducer=q.MapProducer, Thumbnail= q.Thumbnail) for q in queries]
        return entries
    
def show_mission():
    Mission.__table__.create(bind=engine, checkfirst=True)
    if SuchTable("MusicTable"):
        queries = session.query(Mission).filter(Mission.MapProducer == current_user.name)
        entries = [dict(id=q.id, MapName=q.MapName, MapProducer=q.MapProducer, Thumbnail= q.Thumbnail) for q in queries]
        return entries
            
def show_mission_byid(id):
    Mission.__table__.create(bind=engine, checkfirst=True)
    if SuchTable("MissionTable"):
        queries = session.query(Mission).filter(Mission.id == id)
        entries = [dict(id=q.id, MapName=q.MapName,MapProducer=q.MapProducer, Thumbnail= q.Thumbnail) for q in queries]
        return entries