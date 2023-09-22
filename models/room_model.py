from flask_socketio import emit
from models.play_model import room_data_manager
import time
import random
import threading
def update_room_player_count(room_key, msg, player_name, color):
    player_count= len(room_data_manager._data_store[room_key]['user'])
    player = player_name
    msg_color = color
    players = room_data_manager._data_store[room_key]['user']
    emit('room_players_update', {'room_key': room_key, 'player_count':player_count,'player' : player, 'players': players, 'msg': msg, 'color': msg_color}, broadcast=True)
def remove_empty_rooms(socketio):
    while True:
        try:
            empty_rooms = []  # 삭제할 비어 있는 방의 리스트
            for room_key, room_data in list(room_data_manager._data_store.items()):
                if 'user' in room_data and not room_data['user']:
                    empty_rooms.append(room_key)
            print(empty_rooms)
            # 비어 있는 방 삭제
            for room_key in empty_rooms:
                room_data_manager.remove_room(room_key)
            time.sleep(300+300*random.random())  # Pause the thread for 1 second.
        except Exception as e:
            print(e, "except")

def thread_start():
    thread = threading.Thread(target=remove_empty_rooms)
    thread.start()