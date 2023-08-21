#chatting, data parse --author: NewKyaru 15/08/2023
from flask import request, jsonify
from flask_login import current_user
from flask_socketio import SocketIO, emit, join_room
from controllers import play_controller
from flask import Blueprint
from chat.chat_model import make_answer, music_data_manager, room_data_manager
import time
chat_bp = Blueprint('chat', __name__)
totalPlayers = 0
room_name = ""
waitingroom_userlist = {}
socketio = SocketIO()
vote_counts = {}
voted_users = {}
@socketio.on('connect')
def handle_connect():
    # 소켓이 연결되면 실행되는 함수
    num_connected = len(socketio.server.eio.sockets)
    print(f"현재 연결된 소켓 수: {num_connected}")
    try:
        waitingroom_userlist[current_user.name] = None
        emit('update_waiting_userlist', waitingroom_userlist, broadcast = True)
    except:
        pass

@socketio.on('disconnect')
def disconnect():
    removed_rooms = []  # 나간 방의 이름을 저장할 리스트
    user_name = ""  # 유저 이름을 저장할 변수

    for room_name, room_data in room_data_manager._data_store.items():
        if 'user' in room_data and request.sid in room_data['user']:
            user_name = room_data['user'][request.sid]['username']
            room = room_data_manager.user_left(room_name, request.sid)
            game_status = room_data_manager._data_store[room_name]['room_info']['room_status']
            emit("host_updated", {"user": room, "game_status": game_status}, room=room)
            del room_data['user'][request.sid]  # 해당 유저 제거

            if not room_data['user']:  # 방에 더 이상 유저가 없으면 방 제거
                removed_rooms.append(room_name)
                room_data_manager.remove_room(room_name)  # 방 제거 메서드 호출
                emit('room_removed', room_name, broadcast=True)  # 방 제거 이벤트 전송

            if room_data_manager._data_store[room_name]['room_info']['room_status']:
                totalPlayers = len(room_data_manager._data_store[room_name]['user'])
                if user_name in voted_users[room_name]:
                    vote_counts[room_name] = vote_counts[room_name] - 1
                    voted_users[room_name].remove(user_name)
                if room_name not in vote_counts:
                    emit('user_change', {'count': vote_counts[room_name], 'totalPlayers': totalPlayers}, room=room_name)
                else:
                    emit("user_change", {'count': 0, 'totalPlayers': totalPlayers}, room=room_name)

    if user_name:
        emit('user_disconnect', {'username': user_name})  # 유저 연결 종료 이벤트 전송
        update_room_player_count(room_name)  # 플레이어 수 업데이트
    try:
        if current_user.name in waitingroom_userlist:
            del waitingroom_userlist[current_user.name]
            emit('update_waiting_userlist', waitingroom_userlist, broadcast=True)
    except:
        pass


#############################################################################
#play 부분
# -------- 채팅 관련 기능 부분 -----------


#socket
#싱글용 메시지
@socketio.on('single_message')
def handle_single_message(data):
    msg = data['content']
    name = current_user.name
    emit('single_message', {'name': name, 'msg': msg})

@socketio.on('message')
def handle_message(data):
    msg = data['content']
    room = data.get('room')
    name = current_user.name
    if music_data_manager.check_answer(room, msg) and music_data_manager.retrieve_data(room).get('is_answered') == 'false':
        current_data = music_data_manager.retrieve_data(room)
        current_data['is_answered'] = 'true'
        emit('message', {'name': name, 'msg': msg}, room=room)
        emit('correctAnswer', {'name':name,'data':current_data}, room=room)
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
    totalPlayers = len(room_data_manager._data_store[room_name]['user'])
    first_data = music_data_manager.retrieve_data(room_name)
    if first_data:
        youtube_embed_url = first_data['youtube_embed_url']
        emit('PlayGame', {'totalPlayers': totalPlayers, 'youtubeLink': youtube_embed_url}, room=room_name)
    else:
        emit('PlayGame', {'totalPlayers': totalPlayers}, room=room_name)


@socketio.on('MissionSelect')
def send_saved_data(data):
    room_name = data.get("room_name")
    make_answer(play_controller.get_music_data(data['selected_id']), room_name)
    emit('MissionSelect_get', room_name, room=room_name)

#스킵투표
@socketio.on('voteSkip')
def handle_vote_skip(data):
    room = data.get("room")
    user = current_user.name
    if room not in vote_counts:
        vote_counts[room] = 0
    if user not in voted_users:
        voted_users[room] = []
    # 이름 기준으로 이미 투표한 사용자는 다시 투표할 수 없도록 처리
    if user in voted_users[room]:
        return
    vote_counts[room] += 1
    voted_users[room].append(user)
    required_votes = data['requiredSkipVotes']
    if vote_counts[room] >= required_votes:
        player_count = vote_counts[room]
        vote_counts[room] = 0
        voted_users[room] = [] #초기화
        next_data = music_data_manager.retrieve_next_data(room)
        print(next_data)
        if next_data:
            totalPlayers = len(room_data_manager._data_store[room]['user'])
            youtube_embed_url = next_data['youtube_embed_url']
            emit('NextData', {'youtubeLink': youtube_embed_url, "totalPlayers" : totalPlayers}, room=room)
        else:
            emit('EndOfData', {}, room=room)



    else:
        emit('updateVoteCount', {'count': vote_counts[room]}, room=room)

############################################################################################
# 방마다 인원 수를 클라이언트에게 전달
def update_room_player_count(room_name):
    player_count= len(room_data_manager._data_store[room_name]['user'])
    emit('room_players_update', {'room_name': room_name, 'player_count':player_count}, broadcast=True)

########################################################################################
#방 관리
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
    room_data_manager.join(room_name,session_id,current_user,time)
    join_room(room_name)
    update_room_player_count(room_name)
    user_id = room_data_manager.host_setting(room_name)
    game_status = room_data_manager._data_store[room_name]['room_info']['room_status']
    # if game_status :
        # totalPlayers = len(room_data_manager._data_store[room_name]['user'])
        # if room_name not in vote_counts:
        #     emit('user_change', {'count': vote_counts[room_name], 'totalPlayers': totalPlayers}, room=room_name)
        # else :
        #     emit("user_change", {'count': 0, 'totalPlayers': totalPlayers}, room=room_name)
    if user_id != "":
        emit("host_updated", {"user":user_id, "game_status":game_status}, room=room_name)
    try:
        if current_user.name in waitingroom_userlist:
            del waitingroom_userlist[current_user.name]
            emit('update_waiting_userlist', waitingroom_userlist, broadcast=True)
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
        emit('Join_room',room_name, room=session_id)


def get_room_dict():
    room_dict = room_data_manager._data_store
    
    return jsonify(room_dict)

def get_user():
    data = ""
    if current_user.is_authenticated:
        data = current_user.name
    return jsonify(data)

# 게임중인 방 room_list.html 에서 안보이게 하기
@socketio.on('playingStatus_change')
def playingroom_hidden(room_name):
    room_data_manager.game_status(room_name)
    room_status = room_data_manager._data_store[room_name]["room_info"]["room_status"]
    emit('request_room_changed', {"room_name":room_name,"room_status":room_status},  broadcast = True)
