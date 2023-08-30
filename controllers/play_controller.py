from flask_login import current_user
from flask import jsonify
from models.play_model import room_data_manager
def get_room_dict():
    room_dict = room_data_manager._data_store
    
    return jsonify(room_dict)

def get_user():
    data = ""
    if current_user.is_authenticated:
        data = current_user.name
    return jsonify(data)