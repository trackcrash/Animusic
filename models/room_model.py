from flask_socketio import emit
from models.play_model import room_data_manager
def update_room_player_count(room_key, msg, player_name, color):
    player_count= len(room_data_manager._data_store[room_key]['user'])
    player = player_name
    msg_color = color
    players = room_data_manager._data_store[room_key]['user']
    emit('room_players_update', {'room_key': room_key, 'player_count':player_count,'player' : player, 'players': players, 'msg': msg, 'color': msg_color}, broadcast=True)