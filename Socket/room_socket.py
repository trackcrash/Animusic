from flask_socketio import emit,join_room
from flask import request
from flask_login import current_user
from models.play_model import room_data_manager
from Socket.socket import socket_class
from models.room_model import update_room_player_count
from models.user_model import get_userinfo_by_name
import time

tempRoomdict = {}
def room_Socket(socketio):
    @socketio.on('room_check')
    def room_check_sock(data):
        session_id = request.sid
        room_name = data['room_name'] 
        room_keys = room_data_manager._data_store.keys()
        room_key = str(max((int(key) for key in room_keys), default=0) + 1)
        if not room_data_manager.room_check(room_key):
            tempRoomdict[room_key] = {"room_name": room_name, "room_password" :data['room_password'], "room_max_human": data['room_max_human']}
            emit('Join_room', room_key, room=session_id)

    @socketio.on('create_room')
    def create_room_sock(data):
        session_id = request.sid
        room_key = data['room_key']
        if room_data_manager.create_room(room_key,session_id): 
            if room_key in tempRoomdict:
                room_data_manager._data_store[room_key]["room_info"]['room_name'] = tempRoomdict[room_key]["room_name"]
                room_data_manager._data_store[room_key]["room_info"]['room_password'] = tempRoomdict[room_key]["room_password"]
                room_data_manager._data_store[room_key]["room_info"]['room_full_user'] = tempRoomdict[room_key]["room_max_human"]
                tempRoomdict.pop(room_key)
            room_name = room_data_manager._data_store[room_key]["room_info"]['room_name']
            isPassword = False if room_data_manager._data_store[room_key]["room_info"]["room_password"] in ('', None) else True
            max_user = room_data_manager._data_store[room_key]["room_info"]["room_full_user"]
            emit('room_update', {'room_key': room_key,'room_name': room_name, "max_user": max_user, "is_password": isPassword}, broadcast=True)

    @socketio.on('join')
    def join_sock(data):
        room_key = data['room_key']
        session_id = request.sid
        if current_user.is_authenticated:
            print(current_user.name," multi_game join current_user")
            if room_data_manager.is_user_in_room(current_user.name, room_key):
                emit("duplicate", {"message": "이미 방에 입장해 있습니다."}, room=session_id)
                return
            join_room(room_key)
            room_data_manager.join(room_key,session_id,current_user, time)
            user_id = room_data_manager.host_setting(room_key)
            game_status = room_data_manager._data_store[room_key]['room_info']['room_status']
            emit("set_session_id", {"user":user_id, "session_id":session_id}, room=session_id)
            update_room_player_count(room_key, "님이 참가 하셨습니다.", room_data_manager._data_store[room_key]['user'][session_id]['username'],0,0)
            if user_id != "":
                emit("host_updated", {"user":user_id, "game_status":game_status}, room=room_key)
            try:
                if current_user.name in socket_class.waitingroom_userlist:
                    del socket_class.waitingroom_userlist[current_user.name]
                    emit('update_waiting_userlist', socket_class.waitingroom_userlist, broadcast=True)
            except:
                pass
        
    @socketio.on("passwordCheckToServer")
    def password_check(data):
        room_key = data['room_key']
        if data['password'] == room_data_manager._data_store[room_key]["room_info"]["room_password"]:
            emit('Join_room', room_key, room=request.sid)
        else:
            emit('passwordFail',room=request.sid)
    @socketio.on('user_check')
    def user_check(data):
        if current_user.is_authenticated:
            user_name = current_user.name
            room_key = data['room_key']
            session_id = request.sid
            if room_data_manager.is_user_in_room(user_name,room_key):
                emit('user_check_not_ok', room=session_id)
            else :
                if room_data_manager.room_user_check(room_key) < int(room_data_manager._data_store[room_key]["room_info"]["room_full_user"]):
                    if room_data_manager._data_store[room_key]["room_info"]["room_password"] != None and room_data_manager._data_store[room_key]["room_info"]["room_password"] != "":
                        emit("passwordCheck",room_key, room=session_id)
                    else:
                        emit('Join_room',room_key, room=session_id)
                else : 
                    emit("room_full_user", room_key, room=session_id)

    @socketio.on('playingStatus_true')
    def playingroom_hidden(room_key):
        room_data_manager.game_status(room_key,True)
        room_status = room_data_manager._data_store[room_key]["room_info"]["room_status"]
        room_data_manager.game_init(room_key)
        emit('request_room_changed', {"room_key":room_key,"room_status":room_status},  broadcast = True)

    @socketio.on('playingStatus_false')
    def playingroom_hidden(room_key):
        room_data_manager.game_status(room_key, False)
        room_status = room_data_manager._data_store[room_key]["room_info"]["room_status"]
        room_data_manager.game_init(room_key)
        emit('request_room_changed', {"room_key":room_key,"room_status":room_status},  broadcast = True)
    
    @socketio.on("room_setting_change")
    def room_setting_changehandler(data):
        room_key = data['room_key']
        room_name = data['room_name']
        room_password = data['room_password']
        room_max_human = data['room_max_human']
        if int(room_max_human) < room_data_manager.room_user_check(room_key):
            emit("failed_user_change", room = request.sid)
            return
        room_info = room_data_manager._data_store[room_key]["room_info"]
        room_info["room_name"] = room_name
        room_info["room_password"] = room_password
        room_info["room_full_user"] = room_max_human
        room_private = True
        if room_info["room_password"] == "" or room_info["room_password"] == None:
            room_private = False
        emit("room_data_update_inroom", {"room_key": room_key, "room_name": room_name, "room_max_human": room_max_human, "room_password":room_password}, room = room_key)    
        emit("room_data_update", {"room_key": room_key, "room_name": room_name, "room_max_human": room_max_human, "room_private":room_private}, broadcast = True)

    @socketio.on("kick")
    def kickPlayer(data):
        room_key = data["room_key"]
        user_name = data["user_name"]
        if room_key not in socket_class.BanList:
            socket_class.BanList[room_key] = []

        userid=get_userinfo_by_name(user_name).id
        socket_class.BanList[room_key].append(userid)

        # 찾고자 하는 user_name 값

        # room_data 딕셔너리를 순회하면서 user_name 값을 비교하고 일치하는 키를 찾음

        for key, value in room_data_manager._data_store[room_key]["user"].items():
            if "username" in value and value["username"] == user_name:
                emit("kick_player",{"user_name" : user_name, "session_id": key},room=room_key)

    @socketio.on("host_change")
    def host_change(data):
        room_key = data["room_key"]
        user_name = data["user_name"]
        room_data_manager._data_store[room_key]["user"][request.sid]["host"] = 0
        # room_data 딕셔너리를 순회하면서 user_name 값을 비교하고 일치하는 키를 찾음
        game_status = room_data_manager._data_store[room_key]["room_info"]["room_status"]
        for key, value in room_data_manager._data_store[room_key]["user"].items():
            if "username" in value and value["username"] == user_name:
                value["host"] = 1
                user_id = key
                emit("host_updated", {"user":user_id, "game_status":game_status}, room=room_key)
