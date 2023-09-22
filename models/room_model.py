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

def remove_empty_rooms():
    while True:
        empty_rooms = []  # 삭제할 비어 있는 방의 리스트
        for room_key, room_data in list(room_data_manager.items()):
            if 'user' in room_data and not room_data['user']:
                empty_rooms.append(room_key)
        
        # 비어 있는 방 삭제
        for room_key in empty_rooms:
            del room_data_manager[room_key]
            print(f"Room '{room_key}' has been removed due to inactivity.")
        
        # 5분에서 10분마다 체크
        time.sleep(300 + 300 * random.random())  # 5분에서 10분 사이의 랜덤한 시간으로 설정

def thread_start():
    background_thread = threading.Thread(target=remove_empty_rooms)
    background_thread.daemon = True  # 메인 스레드 종료 시 백그라운드 스레드도 종료
    background_thread.start()