from flask import Blueprint, request, flash, redirect, url_for
from flask_login import current_user
from flask_socketio import emit, SocketIO
from models.data_model import Music,Mission
from controllers.play_controller import show_table_bymissionid
chat_bp = Blueprint('chat', __name__)
socketio = SocketIO(cors_allowed_origins="*")


@socketio.on('message')
def handle_message(data):
    msg = data['content']
    name = current_user.name
    #answer_list = [item['answer'] for item in data]
    emit('message', {'name': name, 'msg': msg}, broadcast=True)

def make_answer(mission_id):
    data = None
    if mission_id:
        data = show_table_bymissionid(mission_id)
    else:
        flash('잘못된 접근입니다.')
        return redirect(url_for('index'))
    
    answer_list = [item['answer'] for item in data]
    youtube_embed_url = f"https://www.youtube.com/embed/{data[0]['youtube_url'].split('=')[-1]}?autoplay=1"
    music_data = {
        'is_answered': False,
        'show_next_button': False,
        'answer_list': answer_list,
        'youtube_embed_url': youtube_embed_url
    }
    return music_data