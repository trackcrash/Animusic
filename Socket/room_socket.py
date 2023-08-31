from flask_socketio import emit,join_room
from flask import request
from flask_login import current_user
from models.play_model import room_data_manager
from Socket.socket import socket_class
from models.room_model import update_room_player_count
import time

def room_Socket(socketio):

    @socketio.on('room_check')
    def room_check_sock(data):
        session_id = request.sid
        room_name = data['room_name'] 
        booldata = room_data_manager.room_check(room_name)
        if booldata :
            emit('Do_not_create_duplicates', room=session_id)
        else : 
            emit('Join_room', room_name, room=session_id)

    @socketio.on('create_room')
    def create_room_sock(data):
        session_id = request.sid
        room_name = data['room_name']
        if room_data_manager.create_room(room_name,session_id):
            emit('room_update', room_name, broadcast=True)

    @socketio.on('join')
    def join_sock(data):
        room_name = data['room_name']
        session_id = request.sid
        room_data_manager.join(room_name,session_id,current_user, time)
        join_room(room_name)
        user_id = room_data_manager.host_setting(room_name)
        game_status = room_data_manager._data_store[room_name]['room_info']['room_status']
        if user_id != "":
            emit("host_updated", {"user":user_id, "game_status":game_status}, room=room_name)
        update_room_player_count(room_name, "님이 참가 하셨습니다.", room_data_manager._data_store[room_name]['user'][session_id]['username'])
        try:
            if current_user.name in socket_class.waitingroom_userlist:
                del socket_class.waitingroom_userlist[current_user.name]
                emit('update_waiting_userlist', socket_class.waitingroom_userlist, broadcast=True)
        except:
            pass
        

    @socketio.on('user_check')
    def user_check(data):
        user_name = current_user.name
        room_name = data['room_name']
        session_id = request.sid
        if room_data_manager.is_user_in_room(user_name,room_name):
            emit('user_check_not_ok', room=session_id)
        else :
            if room_data_manager.room_user_check(room_name) < room_data_manager._data_store[room_name]["room_info"]["room_full_user"]:
                emit('Join_room',room_name, room=session_id)
            else : 
                emit("room_full_user", room_name, room=session_id)

    @socketio.on('playingStatus_true')
    def playingroom_hidden(room_name):
        room_data_manager.game_status(room_name,True)
        room_status = room_data_manager._data_store[room_name]["room_info"]["room_status"]
        print("wpqkf",room_status)
        room_data_manager.game_init(room_name)
        emit('request_room_changed', {"room_name":room_name,"room_status":room_status},  broadcast = True)

    @socketio.on('playingStatus_false')
    def playingroom_hidden(room_name):
        room_data_manager.game_status(room_name, False)
        room_status = room_data_manager._data_store[room_name]["room_info"]["room_status"]
        print("wpqkf",room_status)
        room_data_manager.game_init(room_name)
        emit('request_room_changed', {"room_name":room_name,"room_status":room_status},  broadcast = True)