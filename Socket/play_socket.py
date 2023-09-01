from threading import Lock
from flask_socketio import emit
from flask import request
from controllers import map_controller
from flask_login import current_user
from models.play_model import make_answer, music_data_manager, room_data_manager
from Socket.socket import socket_class
from models.room_model import update_room_player_count
from models.user_model import get_userinfo_by_name, update_level_info
vote_lock = Lock()
def get_info_for_room(room_name):
    data = room_data_manager._data_store[room_name]['user']
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
            user_update_info = exp_calculator(username,user.exp, user.nextexp, name['score'], user.level, room_name,session_id)
            update_info[username] = user_update_info
            print(user_info)
            print(update_info)
    
    return user_info, update_info

def exp_calculator(name, exp, nextexp, score, level, room_name,session_id):
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
    room_data_manager.user_update(room_name,session_id)
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

    @socketio.on('message')
    def handle_message(data):
        msg = data['content']
        room = data.get('room')
        name = current_user.name
        if music_data_manager.check_answer(room, msg) and music_data_manager.retrieve_data(room).get('is_answered') == 'false':
            if data['timeOut'] :
                current_data = music_data_manager.retrieve_data(room)
                current_data['is_answered'] = 'true'
                startTime = float(current_data['startTime'])
                emit('correctAnswer', {'name':name,'data':current_data,'startTime':startTime}, room=room)
                room_data_manager._data_store[room]['user'][request.sid]['score'] += 1 
                update_room_player_count(room, "님이 정답을 맞췄습니다.", name)
            emit('message', {'name': name, 'msg': msg}, room=room)
        else:
            emit('message', {'name': name, 'msg': msg}, room=room)
    #다음 데이터 요청

    @socketio.on('showHint')
    def showHint(data):
        room_name = data.get("room")
        current_data = music_data_manager.retrieve_data(room_name)
        if current_data:
            emit('hint', {'hint': current_data['hint']}, room=room_name)

    @socketio.on("playTheGame")
    def playTheGame(room_name):
        socket_class.totalPlayers = len(room_data_manager._data_store[room_name]['user'])
        first_data = music_data_manager.retrieve_data(room_name)
        totalSong = len(music_data_manager._data_store[room_name]['data'])
        nowSong = int(music_data_manager._data_store.get(room_name, {})['current_index']) + 1
        if first_data:
            youtube_embed_url = first_data['youtube_embed_url']
            start_time = float(first_data['startTime'])
            end_time = float(first_data['endTime'])
            emit('PlayGame', {'totalPlayers': socket_class.totalPlayers, 'youtubeLink': youtube_embed_url, 'startTime': start_time, 'endTime': end_time, 'totalSong': totalSong, 'nowSong': nowSong}, room=room_name)

    @socketio.on('MissionSelect')
    def send_saved_data(data):
        room_name = data.get("room_name")
        make_answer(map_controller.get_music_data(data['selected_id']), room_name)
        emit('MissionSelect_get', room_name, room=room_name)

    #스킵투표
    @socketio.on('voteSkip')
    def handle_vote_skip(data):
        if data["TimeOut"]:
            with vote_lock:
                room = data.get("room")
                user = current_user.name
                if room not in socket_class.vote_counts:
                    socket_class.vote_counts[room] = 0
                if user not in socket_class.voted_users:
                    socket_class.voted_users[room] = [] 
                # 이름 기준으로 이미 투표한 사용자는 다시 투표할 수 없도록 처리
                if user in socket_class.voted_users[room]:
                    return
                socket_class.vote_counts[room] += 1
                socket_class.voted_users[room].append(user)
                required_votes = data['requiredSkipVotes']
                if socket_class.vote_counts[room] >= required_votes:
                    player_count = socket_class.vote_counts[room]
                    socket_class.vote_counts[room] = 0
                    socket_class.voted_users[room] = [] #초기화
                    next_data = music_data_manager.retrieve_next_data(room)
                    if next_data:
                        socket_class.totalPlayers = len(room_data_manager._data_store[room]['user'])
                        youtube_embed_url = next_data['youtube_embed_url']
                        startTime = float(next_data['startTime'])
                        endTime = float(next_data['endTime'])
                        totalSong = len(music_data_manager._data_store[room]['data'])
                        nowSong = int(music_data_manager._data_store.get(room, {})['current_index'])+1
                        emit('NextData', {'youtubeLink': youtube_embed_url, "totalPlayers" : socket_class.totalPlayers, "startTime": startTime, "endTime":endTime, 'totalSong':totalSong,'nowSong':nowSong}, room=room)
                    else:
                        before_data,new_data = get_info_for_room(room)
                        emit('EndOfData', {'before_data': before_data,'new_data':new_data,'players': room_data_manager._data_store[room]['user']}, room=room)
                else:
                    emit('updateVoteCount', {'count': socket_class.vote_counts[room]}, room=room)