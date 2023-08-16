#chatting, data parse --author: NewKyaru 15/08/2023
from flask import Blueprint, flash, jsonify, redirect, request, url_for
from flask_login import current_user
from controllers.play_controller import show_table_bymissionid
from models.data_model import Mission, Music
chat_bp = Blueprint('chat', __name__)

room_dict = dict()
user_dict = dict()
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
            'hint': item['hint'],
            'is_answered': 'false',
            'answer_list': answer_list,
            'youtube_embed_url': youtube_embed_url,
            'title': item['title'],
            'song': item['song'],
            'answer_hint': item['hint']
        }
        result.append(music_data)
    return jsonify(result)


def get_room_dict():
    return jsonify(room_dict)

def get_user():
    data = ""
    if current_user.is_authenticated:
        data = current_user.name
    return jsonify(data)
