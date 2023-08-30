from models.play_model import make_answer ,get_room_dict, get_user
from flask import Blueprint, render_template, request
from flask_login import current_user
from flask import Blueprint
from models.play_model import make_answer
play_bp = Blueprint('play', __name__, url_prefix='')

@play_bp.route('/single-play', methods=['GET', 'POST'])
def single_play():
    return render_template('single_game.html',current_user=current_user)

@play_bp.get("/get-room-dict")
def get_room_dictAll():
    return get_room_dict()

@play_bp.get("/get_user_info")
def get_user_info():
    return get_user()

@play_bp.get('/multi_game')
def chat():
    return render_template('multi_game/multi_game.html',current_user=current_user)

@play_bp.post('/multi_game')
def chat_post():
    mission_id = request.args.get('id')
    make_answer(mission_id, request.args.get('room_name'))
    return render_template('multi_game/multi_game.html',current_user=current_user)
