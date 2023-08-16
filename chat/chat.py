#chatting, data parse --author: NewKyaru 15/08/2023
from flask import Blueprint, flash, jsonify, redirect, request, url_for
from flask_login import current_user
from flask_socketio import emit, SocketIO

from controllers.play_controller import show_table_bymissionid
from models.data_model import Mission, Music

chat_bp = Blueprint('chat', __name__)
socketio = SocketIO(cors_allowed_origins="*")

<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
@socketio.on('message')
def handle_message(data):
    msg = data['content']
    name = current_user.name
    #answer_list = [item['answer'] for item in data]
    emit('message', {'name': name, 'msg': msg}, broadcast=True)

# use to get json
def make_answer(mission_id):
    if mission_id is None:
        flash('잘못된 접근입니다.')
        return redirect(url_for('index'))

    data = show_table_bymissionid(mission_id)
    result = []

    for item in data:
        youtube_embed_url = f"https://www.youtube.com/embed/{item['youtube_url'].split('=')[-1]}?autoplay=1"

        answer_list = item['answer'].split(',')

        # JSON 객체 생성
        music_data = {
            'is_answered': "false",
            'show_next_button': "false",
            'answer_list': answer_list,
            'youtube_embed_url': youtube_embed_url,
            'title': item['title'],
            'song': item['song'],
            'answer_hint': item['hint']
        }
        result.append(music_data)
<<<<<<< Updated upstream
    return jsonify(result)
=======
    return jsonify(result)
>>>>>>> Stashed changes
