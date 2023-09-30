from flask_socketio import emit
from flask import request
from flask_login import current_user
from models.play_model import room_data_manager
from Socket.socket import socket_class,get_socket_number
from models.room_model import update_room_player_count
from models.notification_model import notification
def connect_MySocket(socketio):
    @socketio.on("notification")
    def notification_all(data):
        contents = data["contents"]
        notification.notification_change(contents)
        emit("all_notification", {"contents":contents}, broadcast = True)
    @socketio.on('connect')
    def handle_connect():
        print("SocketConnect")
        # 소켓이 연결되면 실행되는 함수
        num_connected = get_socket_number()
        emit("socket_connected_user", num_connected, broadcast = True)
        print(f"현재 연결된 소켓 수: {num_connected}")
     
    @socketio.on('Waiting')
    def connect_waiting():
        try:
            if current_user.is_authenticated:
                print(current_user.name, "update_waiting_userlist current_user")
                socket_class.waitingroom_userlist[current_user.name] = None
            emit('update_waiting_userlist', socket_class.waitingroom_userlist, broadcast=True)
        except:
            pass
    @socketio.on('disconnect')
    def disconnect():
        removed_rooms = []  # 나간 방의 이름을 저장할 리스트
        user_name = ""  # 유저 이름을 저장할 변수
        num_connected = int(get_socket_number())-1
        emit("socket_connected_user", num_connected, broadcast = True)
        for room_key, room_data in list(room_data_manager._data_store.items()):
            if 'user' in room_data and request.sid in room_data['user']:
                user_name = room_data['user'][request.sid]['username']
                game_status = room_data_manager._data_store[room_key]['room_info']['room_status']
                del room_data['user'][request.sid]  # 해당 유저 제거
                room = room_data_manager.host_setting(room_key)
                if user_name:
                    update_room_player_count(room_key, "님이 퇴장 하셨습니다.", user_name,0,0)  # 플레이어 수 업데이트
                if room:
                    host = room_data_manager._data_store[room_key]["user"][room]
                    emit("host_updated", {"user":room, "game_status":game_status, "room_key" : room_key, "host" : host}, room=room_key)
                    emit("room_host_updated", {"room_key" : room_key, "host" : host}, broadcast = True)
                if not room_data['user']:  # 방에 더 이상 유저가 없으면 방 제거
                    removed_rooms.append(room_key)
                else:
                    if room_data_manager._data_store[room_key]['room_info']['room_status']:
                        socket_class.totalPlayers[room_key] = len(room_data_manager._data_store[room_key]['user'])
                        
                        if user_name in socket_class.voted_users[room_key]:
                            socket_class.vote_counts[room_key] = socket_class.vote_counts[room_key] - 1
                            socket_class.voted_users[room_key].remove(user_name)
                        emit('user_change', {'count': socket_class.vote_counts[room_key], 'totalPlayers': socket_class.totalPlayers[room_key]}, room=room_key)
                    
        for room_key in removed_rooms:
            room_data_manager.remove_room(room_key)  # 방 제거 메서드 호출
            emit('room_removed', room_key, broadcast=True)
        try:
            if current_user.is_authenticated:
                if current_user.name in socket_class.waitingroom_userlist:
                    del socket_class.waitingroom_userlist[current_user.name]
                    emit('update_waiting_userlist', socket_class.waitingroom_userlist, broadcast=True)
            emit("room_number_update", str(room_data_manager.get_room_list()), broadcast = True)
        except:
            pass