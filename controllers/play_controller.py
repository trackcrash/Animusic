from flask import request, jsonify
from models import data_model
from views import play_view
from db.database import session
from models.data_model import Music

def play_controller():
    if request.method == 'POST':
        title = request.form.get('title')
        song = request.form.get('song')
        youtube_url = request.form.get('youtube_url')
        # Save data to DB
        data_model.save_data(title, song, youtube_url)
        
        return play_view.play_post_response({"title": title, "song": song, "youtube_url": youtube_url})
    
    data = data_model.get_data()
    return play_view.play_view(data)

def submit_to_db():
    data = request.json
    data_model.save_to_db(data)
    return jsonify({"message": "Data received and processed!"})

def show_table():
    queries = session.query(Music)
    entries = [dict(id=q.id, title=q.title, song=q.song,youtube_url=q.youtube_url, answer= q.answer) for q in queries]
    # for entry in entries:
    #     entry['answer'] = entry['answer'].split(',')
    return entries
# 앞으로 추가할 기능 일단 각 맵마다 mission_id 부여 mission_id기준으로 항목을
# def show_question_map(mission_id):
#     mission = session.query(Music).filter(Music.mission_id == mission_id).all()
#     return mission
# 