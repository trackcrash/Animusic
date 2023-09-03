from flask_socketio import emit
from flask import request
from flask_login import current_user
from models.play_model import room_data_manager
from Socket.socket import socket_class
from models.room_model import update_room_player_count

def connect_MySocket(socketio):
    @socketio.on('connect')
    def handle_connect():
        print("SocketConnect")
        # 소켓이 연결되면 실행되는 함수
        num_connected = len(socketio.server.eio.sockets)
        print(f"현재 연결된 소켓 수: {num_connected}")
     
    @socketio.on('Waiting')
    def connect_waiting():
        try:
            socket_class.waitingroom_userlist[current_user.name] = None
            emit('update_waiting_userlist', socket_class.waitingroom_userlist, broadcast=True)
        except:
            pass
    @socketio.on('disconnect')
    def disconnect():
        removed_rooms = []  # 나간 방의 이름을 저장할 리스트
        user_name = ""  # 유저 이름을 저장할 변수

        for room_name, room_data in list(room_data_manager._data_store.items()):
            if 'user' in room_data and request.sid in room_data['user']:
                user_name = room_data['user'][request.sid]['username']
                room = room_data_manager.user_left(room_name, request.sid)
                game_status = room_data_manager._data_store[room_name]['room_info']['room_status']
                print(game_status,"game_statust")
                emit("host_updated", {"user": room, "game_status": game_status}, room=room)
                del room_data['user'][request.sid]  # 해당 유저 제거
                if user_name:
                    update_room_player_count(room_name, "님이 퇴장 하셨습니다.", user_name)  # 플레이어 수 업데이트
                if not room_data['user']:  # 방에 더 이상 유저가 없으면 방 제거
                    removed_rooms.append(room_name)
                else:
                    if room_data_manager._data_store[room_name]['room_info']['room_status']:
                        socket_class.totalPlayers = len(room_data_manager._data_store[room_name]['user'])
                        
                        if user_name in socket_class.voted_users[room_name]:
                            socket_class.vote_counts[room_name] = socket_class.vote_counts[room_name] - 1
                            socket_class.voted_users[room_name].remove(user_name)
                        emit('user_change', {'count': socket_class.vote_counts[room_name], 'totalPlayers': socket_class.totalPlayers}, room=room_name)
                    
        for room_name in removed_rooms:
            room_data_manager.remove_room(room_name)  # 방 제거 메서드 호출
            emit('room_removed', room_name, broadcast=True)
        try:
            if current_user.name in socket_class.waitingroom_userlist:
                del socket_class.waitingroom_userlist[current_user.name]
                emit('update_waiting_userlist', socket_class.waitingroom_userlist, broadcast=True)
        except:
            pass