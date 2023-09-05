from flask_socketio import emit
from flask import request
from controllers import map_controller
from flask_login import current_user
from models.play_model import make_answer, music_data_manager, room_data_manager
from Socket.socket import socket_class
from models.room_model import update_room_player_count
from models.user_model import get_userinfo_by_name, update_level_info
from controllers.map_controller import show_mission_byid
#반복이라 함수로 분리
def skip_song(room):
    next_data = music_data_manager.retrieve_next_data(room)
    if next_data:
        socket_class.totalPlayers[room] = len(room_data_manager._data_store[room]['user'])
        youtube_embed_url = next_data['youtube_embed_url']
        emit('NextData', {'youtubeLink': youtube_embed_url, "totalPlayers" : socket_class.totalPlayers[room]}, room=room)
        if room not in socket_class.isDuplication :
            socket_class.isDuplication[room] = True
        socket_class.isDuplication[room] = True
        if room not in socket_class.play_vote :
            socket_class.play_vote[room] = []
        socket_class.play_vote[room] = []
    else:
        session_id = request.sid
        before_data,new_data = get_info_for_room(room)
        emit('EndOfData', {'before_data': before_data,'new_data':new_data,'players': room_data_manager._data_store[room]['user']}, room=room)
def get_info_for_room(room_key):
    data = room_data_manager._data_store[room_key]['user']
    user_info = {}
    update_info = {}
    for session_id, name in data.items():
        username = name.get('username')
        user = get_userinfo_by_name(username)
        if user:
            nextexp = int(user.nextexp)
            user_info[username]={
                'score': name['score'],
                'exp' : user.exp,
                'nextexp' : nextexp,
                'level' : user.level
            }
            user_update_info = exp_calculator(username,user.exp, user.nextexp, name['score'], user.level, room_key,session_id)
            update_info[username] = user_update_info
    return user_info, update_info

def exp_calculator(name, exp, nextexp, score, level, room_key,session_id):
    if level == -1:
        return {
            'exp': exp,
            'nextexp': nextexp,
            'level': level
        }
    if score == 0:
        return {
            'exp': exp,
            'nextexp': nextexp,
            'level': level
        }
    exp += score
    while True:
        if exp >= nextexp:
            level += 1
            nextexp += 30+(level**1.77)
        else:
            break
    update_level_info(name, level, exp, int(nextexp))
    room_data_manager.user_update(room_key,session_id)
    return {
        'exp': exp,
        'nextexp': int(nextexp),
        'level': level
    }

def play_Socket(socketio):
    @socketio.on('single_message')
    def handle_single_message(data):
        msg = data['content']
        if not current_user.is_authenticated:
            emit('single_message',{'name': '','msg':msg}, room=request.sid)
        else:
            name = current_user.name
            emit('single_message', {'name': name, 'msg': msg},room=request.sid)
    @socketio.on("Skip")
    def skip(data):
        skip_song(data["room_key"])
    @socketio.on('message')
    def handle_message(data):
        msg = data['content']
        room = data.get('room')
        name = current_user.name
        if music_data_manager.check_answer(room, msg) and data['isAnswer'] and socket_class.isDuplication[room]:
            current_data = music_data_manager.retrieve_data(room)
            current_data['endTime'] = "stop"
            emit('correctAnswer', {'name':name,'data':current_data}, room=room)
            if room not in socket_class.isDuplication :
                socket_class.isDuplication[room] = False
            socket_class.isDuplication[room] = False
            if room not in socket_class.play_vote :
                socket_class.play_vote[room] = []
            socket_class.play_vote[room] = []
            room_data_manager._data_store[room]['user'][request.sid]['score'] += 1 
            emit('message', {'name': name, 'msg': msg}, room=room)
            update_room_player_count(room, "님이 정답을 맞췄습니다.", name)
        else:
            emit('message', {'name': name, 'msg': msg}, room=room)
    #다음 데이터 요청

    @socketio.on('showHint')
    def showHint(data):
        room_key = data.get("room")
        current_data = music_data_manager.retrieve_data(room_key)
        if current_data:
            emit('hint', {'hint': current_data['hint']}, room=room_key)

    @socketio.on("playTheGame")
    def playTheGame(data):
        room_key = data['room_key']
        mission_id = data['selected_id']
        if mission_id != None:
            make_answer(mission_id ,room_key)
            socket_class.totalPlayers[room_key] = len(room_data_manager._data_store[room_key]['user'])
            first_data = music_data_manager.retrieve_data(room_key)
            print(first_data)
            if first_data:
                youtube_embed_url = first_data['youtube_embed_url']
                emit('PlayGame', {'totalPlayers': socket_class.totalPlayers[room_key], 'youtubeLink': youtube_embed_url}, room=room_key)
                if room_key not in socket_class.isDuplication :
                    socket_class.isDuplication[room_key] = True
                socket_class.isDuplication[room_key] = True
                if room_key not in socket_class.play_vote :
                    socket_class.play_vote[room_key] = []
                socket_class.play_vote[room_key] = []
        else : 
            emit("MapNotSelect", room=request.sid)
    @socketio.on('MissionSelect')
    def send_saved_data(data):
        room_key = data.get("room_key")
        # make_answer(map_controller.get_music_data(data['selected_id']), room_name)
        mission = show_mission_byid(data['selected_id'])
        room_data_manager.Mission_select(room_key, mission)
        emit('MissionSelect_get', {'room_key' : room_key, "map_data": mission}, broadcast= True)

    #스킵투표
    @socketio.on('voteSkip')
    def handle_vote_skip(data):
        room = data.get("room")
        user = current_user.name
        # 이름 기준으로 이미 투표한 사용자는 다시 투표할 수 없도록 처리
        if user in socket_class.voted_users[room]:
            return
        socket_class.vote_counts[room] += 1
        socket_class.voted_users[room].append(user)
        required_votes = data['requiredSkipVotes']
        if socket_class.vote_counts[room] >= required_votes:
            if room_data_manager._data_store[room]["room_info"]["is_skip"]:
                room_data_manager._data_store[room]["room_info"]["is_skip"] = False
                skip_song(room)
        else:
            emit('updateVoteCount', {'count': socket_class.vote_counts[room]}, room=room)
            
    @socketio.on("ReadyPlay")
    def ReadyPlay(data):
        room_key = data["room_key"]
        socket_class.play_vote[room_key].append(request.sid)
        current_data = music_data_manager.retrieve_data(room_key)
        emit("CheckPlayer", {"room_key":room_key,'endTime': data['endTime'] if data['endTime'] == "stop" else current_data['endTime'], "vote": len(socket_class.play_vote[room_key]), "totalPlayer": socket_class.totalPlayers[room_key] })
    @socketio.on("WaitPlay")
    def WaitPlay(data):
        endTime = data['endTime']
        room_key = data["room_key"]
        socket_class.play_vote[room_key] = []
        emit("reCheck", room = {'room_key':room_key , 'endTime': endTime});
    @socketio.on("ReadyPlayer")
    def ReadyPlayer(data):
        room_key = data["room_key"]
        current_data = music_data_manager.retrieve_data(room_key)
        current_data['totalSong'] =len(music_data_manager._data_store[room_key]['data'])
        current_data["nowSong"] = int(music_data_manager._data_store.get(room_key, {})['current_index'])+1     
        startTime = float(current_data['startTime'])
        if len(socket_class.play_vote[room_key]) >= socket_class.totalPlayers[room_key] :
            emit("PlayVideoReadyOk", {'current_data':current_data,'startTime':startTime, 'endTime': data['endTime'] if data['endTime'] == "stop" else current_data['endTime'], "vote": len(socket_class.play_vote[room_key]), "totalPlayer": socket_class.totalPlayers[room_key]} , room=room_key)
            if data["endTime"] != "stop":
                if room_key not in socket_class.vote_counts:
                    socket_class.vote_counts[room_key] = 0
                if room_key not in socket_class.voted_users:
                    socket_class.voted_users[room_key] = [] 
                socket_class.vote_counts[room_key] = 0
                socket_class.voted_users[room_key] = [] 
                room_data_manager._data_store[room_key]["room_info"]["is_skip"] = True            
