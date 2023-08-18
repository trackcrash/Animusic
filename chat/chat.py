#chatting, data parse --author: NewKyaru 15/08/2023
from flask import Blueprint, flash, jsonify, redirect, request, url_for
from flask_login import current_user
from controllers.play_controller import show_table_bymissionid
from models.data_model import Mission, Music
import random
chat_bp = Blueprint('chat', __name__)
totalPlayers = 0
room_name = ""
room_dict = dict()
#user_dict = dict()
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
            'song': item['song']
        }
        result.append(music_data)
    random.shuffle(result)
    return result

def get_room_dict():
    return jsonify(room_dict)

# def is_user_in_room(user_name, room_name):
    """Check if user is already in the room."""
    for user_data in user_dict.get(room_name, []):
        if user_data['username'] == user_name:
            return True
    return False

def get_user():
    data = ""
    if current_user.is_authenticated:
        data = current_user.name
    return jsonify(data)
