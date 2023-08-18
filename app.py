#flask main --author: NewKyaru 11/08/2023
import os, math
import sys
sys.stdout.reconfigure(encoding='utf-8')
from decouple import config
from flask import flash, Flask, jsonify, redirect, render_template, request, url_for
from flask_login import current_user, login_required, LoginManager, logout_user
from controllers import login_controller, play_controller
from models import login_model
from flask_socketio import SocketIO ,emit, join_room, leave_room
from chat.chat import chat_bp, make_answer, get_room_dict, get_user,room_dict, totalPlayers
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
app = Flask(__name__)
app.config['SECRET_KEY'] = config('SECRET_KEY')

login_manager = LoginManager()
login_manager.init_app(app)

socketio = SocketIO(app)


@login_manager.user_loader
def load_user(user_id):
    return login_model.get_user_by_id(user_id)


@app.route('/')
def index():
    missions = play_controller.show_mission()
    return render_template('index.html', current_user=current_user, missions=missions)

@app.route('/play', methods=['GET', 'POST'])
def play():
    return play_controller.play_controller()

@app.route('/Show')
def show():
    return play_controller.show_table()

@app.route('/submit-to-db', methods=['POST'])
def submit():
    return play_controller.submit_to_db()


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')

    if request.method == 'POST':
        login_successful = login_controller.user_controller()
        if login_successful:
            return redirect(url_for('index'))

        flash('Invalid email or password')
        return redirect(url_for('login'))


#인증 관련 부분
@app.get('/login/google')
def google_login():
    return login_controller.google_login()


@app.get('/login/google/callback')
def google_callback():
    return login_controller.google_callback()


@app.get('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        return login_controller.register()
    return render_template('register.html')

#----------회원 탈퇴 & 회원 정보수정-----------
@app.get('/delete_account_confirm')
def delete_account_confirm():
    return render_template('account_management/deleteAccountConfirm.html')

@app.get('/delete_account')
def deleting_account():
    print(f"\033[92;1m{current_user.name}님의 회원탈퇴 시도중...\033[0m")
    print("MissionTableTsest",play_controller.show_mission_byProducer())
    result_delete_account = login_model.delete_account()
    if result_delete_account:
        print("\033[92;1m회원 탈퇴처리 완료\033[0m")
        return render_template('account_management/deleteAccountComplete.html')
    else:
        print("\033[92;1m회원 탈퇴처리 실패\033[0m")
        return render_template('account_management/deleteAccountFail.html')
@app.get('/account_confirm')
def account_confirm():
    if current_user.is_authenticated == False:
        return render_template('account_management/accountConfirm.html')
    else:
        return render_template('account_management/managementAccountPage.html')
@app.route('/get_current_user_is_google_authenticated', methods=['GET'])
def get_current_user_is_google_authenticated():
    return jsonify({'check_googleuser': current_user.is_google_authenticated})

@app.route('/update_profile', methods=['POST'])
def update_profile():
    data = request.json
    nickname = data[0]['nickname']
    password = data[0]['password']
    newpassword = data[0]['newpassword']

    if current_user.is_google_authenticated: # 구글 유저 인 경우
        if login_model.account_insert_in_googleuser(nickname):
            print(f"\033[92;1m사용자의 닉네임이 {nickname}으로 변경되었습니다.\033[0m")
            return jsonify({'message': '변경이 완료되었습니다.'}), 200
        else:
            print("\033[92;1m이미 존재하는 닉네임을 가진 회원이 있으므로 변경할 수 없습니다.\033[0m")
            return jsonify({'message': '이미 동일한 닉네임이 존재합니다.'}), 400
    else:
        if login_model.account_insert(nickname, password, newpassword):
            print("\033[92;1m사용자의 회원정보가 변경되었습니다.\033[0m")
            return jsonify({'message': '변경이 완료되었습니다.'}), 200
        else:
            print("\033[92;1m사용자의 회원정보 변경이 실패하였습니다.\033[0m")
            return jsonify({'message': '기존 비밀번호가 일치하지 않거나 동일한 닉네임이 존재합니다.'}), 400
# -------------------------------------
####################################################################################

#미션 관리부분
@app.route('/Map')
def mymap():
    data_list = play_controller.show_mission_byProducer()
    return render_template('Map.html', data_list=data_list)

@app.post('/update-to-db')
def update():
    return play_controller.update_to_db()


@app.get("/delete-mission")
def deleteMission():
    return play_controller.delete_Mission(request.args.get('id'))
#######################################################
#socket 연결부분
# ------------------------------------
@socketio.on('connect')
def handle_connect():
    # 소켓이 연결되면 실행되는 함수
    num_connected = len(socketio.server.eio.sockets)
    print(f"현재 연결된 소켓 수: {num_connected}")

@socketio.on('create_room')
def create_room(data):
    room_name = data['room_name']  # 사용자 ID
    # 방 중복생성 금지 (클라이언트에 해당 이벤트 요청)
    if room_name in room_dict:
        emit('Do_not_create_duplicates')
    else:
        #방을 생성할 사용자의 정보를 room_dict에 저장
        session_id = request.sid                #해당 사용자의 세션 id
        print(f"해당 사용자의 방 생성 정보: {session_id, room_name}")
        #방 정보 room_dict에 담기 위한 data        
        room_data = {
            "room_info":{
                "session_id":session_id,
                #room_password, room_status, playing
            },
            "user":
            {

            }
        }
        dict_create(room_dict,room_name,room_data)
        print(f"{room_name}님이 방을 생성하셨습니다.")
        emit('room_update', room_dict, broadcast=True)
@socketio.on('join')
def join(data):
    room_name = data['room_name']
    print("확인",room_name)
    session_id = request.sid
    user_name = current_user.name
    print(f"{room_name}방에 연결되었습니다.")
    user_data = {'username': user_name }  # 유저 데이터를 리스트로 생성
    dict_join(room_dict[room_name]["user"], session_id, user_data)
    print("room_dict2=", room_dict[room_name])
    join_room(room_name)
    update_room_player_count(room_name)

def dict_join(dict_name,dict_index,dict_value):
    if dict_index in dict_name:
        dict_name[dict_index].update(dict_value)
    else :
        dict_name[dict_index] = dict_value

def dict_create(dict_name,dict_index,dict_value):
        dict_name[dict_index] = dict_value
@socketio.on('disconnect')
def disconnect():
    removed_rooms = []  # 나간 방의 이름을 저장할 리스트
    user_name = ""  # 유저 이름을 저장할 변수
    for room_name, room_data in room_dict.items():
        if 'user' in room_data and request.sid in room_data['user']:
            user_name = room_data['user'][request.sid]['username']
            del room_data['user'][request.sid]  # 해당 유저 제거
            if not room_data['user']:  # 방에 더 이상 유저가 없으면 방 제거
                removed_rooms.append(room_name)
            update_room_player_count(room_name)  # 플레이어 수 업데이트
    for room_name in removed_rooms:
        remove_room(room_name)  # 방 제거
    if user_name:
        emit('user_disconnect', {'username': user_name})  # 유저 연결 종료 이벤트 전송
#############################################################################
#play 부분
# -------- 채팅 관련 기능 부분 -----------
@app.route('/room_list')
def room_list():
    if current_user.is_authenticated == False:
        user_id = ""
        print(f"로그인 되어있지 않으므로 멀티플레이는 불가합니다.")
    else:
        user_id = current_user.name
        print(f"{user_id} 유저 아이디 확인됨.")
    return render_template('room_list.html')


@app.get("/get-room-dict")
def get_room_dictAll():
    return get_room_dict()

@app.get("/get_user_info")
def get_user_info():
    return get_user()

@app.route('/multi_game', methods=['GET', 'POST'])
def chat():
    mission_id = request.args.get('id')
    make_answer(mission_id)
    return render_template('multi_game/multi_game.html',current_user=current_user)

@app.get('/api/get_mission_table')
def get_mission_table():
    mission_table_data = play_controller.show_mission_active()
    return jsonify(mission_table_data)

#socket
@socketio.on('message')
def handle_message(data):
    msg = data['content']
    room = data.get('room')
    name = current_user.name
    emit('message', {'name': name, 'msg': msg}, room=room)

@socketio.on("playTheGame")
def playTheGame(room_name):
    totalPlayers= len(room_dict[room_name]['user'])
    emit('PlayGame', totalPlayers ,room = room_name)

@socketio.on('MissionSelect')
def send_saved_data(data):
    room_name = data.get("room_name")
    get_music = make_answer(play_controller.get_music_data(data['selected_id']))
    response = {
        'get_music': get_music,
        'data': data.get("selected_id"),
        'room_name': room_name
    }
    emit('MissionSelect_get', response, broadcast=True)

@socketio.on('correctAnswer')
def handle_correct_answer(data):
    room = data.get('room')
    emit('correctAnswer', data, room=data['room'])

vote_counts = {}

#스킵투표
@socketio.on('voteSkip')
def handle_vote_skip(data):
    index = data.get('index')
    if index not in vote_counts:
        vote_counts[index] = 0
    vote_counts[index] += 1
    required_votes = totalPlayers if totalPlayers <= 2 else math.ceil(totalPlayers / 2)
    if vote_counts[index] >= required_votes:
        vote_counts[index] = 0  # 해당 인덱스의 투표 카운트 초기화
        emit('nextVideo', {}, room=data['room'])
    else:
        emit('updateVoteCount', {'index': index, 'count': vote_counts[index]}, room=data['room'])

############################################################################################
#방 리스트 부분
@socketio.on('request_room_players_update')
def handle_request_room_players_update(data):
    room_name = data['room_name']
    update_room_player_count(room_name)

    # 방마다 인원 수를 클라이언트에게 전달
def update_room_player_count(room_name):
    player_count= len(room_dict[room_name]['user'])
    
    emit('room_players_update', {'room_name': room_name, 'player_count':player_count}, broadcast=True)

# def remove_room(room_name):
#     if room_name in room_dict:
#         emit('room_removed', room_dict[room_name], broadcast=True)
#         del room_dict[room_name]

########################################################################################
if __name__ == '__main__':
    play_controller.ensure_tables_exist()
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)