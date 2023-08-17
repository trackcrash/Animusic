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
from chat.chat import chat_bp, make_answer, get_room_dict, get_user,is_user_in_room ,room_dict, user_dict, totalPlayers
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
    if play_controller.show_mission_byProducer():
        play_controller.delete_Mission(current_user.id)
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

#----------회원 탈퇴 & 회원 정보수정-----------
@app.get('/delete_account_confirm')
def delete_account_confirm():
    return render_template('account_management/deleteAccountConfirm.html')

@app.get('/delete_account')
def deleting_account():
    print(f"\033[92;1m{current_user.name}님의 회원탈퇴 시도중...\033[0m")
    print("MissionTableTsest",play_controller.show_mission_byProducer())
    if play_controller.show_mission_byProducer():
        play_controller.delete_Mission(current_user.id)
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



# -------- 채팅 관련 기능 부분 -----------
@app.route('/room_list')
def room_list():
    if current_user.is_authenticated == False:
        user_id = ""
        print(f"\033[92;1m로그인 되어있지 않으므로 멀티플레이는 불가합니다.\033[0m")
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
        print(f"\033[92;1m해당 사용자의 방 생성 정보: {session_id, room_name}\033[0m")
        room_data = {"room_name": room_name}
        dict_create(room_dict,session_id,room_data)

        #해당 정보를 key : 방 이름, value : sessionID 로 저장
        # user_data = {'username': current_user.name,'usersid': session_id }  # 유저 데이터를 리스트로 생성
        # if room_name in user_dict:
        #     user_dict[room_name].append(user_data)  # 이미 등록된 방이라면 유저 데이터 리스트에 추가
        # else:
        #     user_dict[room_name] = user_data  # 새로운 방이라면 유저 데이터 리스트를 생성하여 저장

        #join_room(room_name) # 사용자가 만든 제목으로 방 입장시킴
        print(f"\033[92;1m{room_name}님이 방을 생성하셨습니다.\033[0m")

        # multi_game.html로 이동
        # 방이 새로 추가된 것을 room_list 페이지에 접속한 모든 사용자에게 채팅방 추가 요청
        emit('room_update', room_dict[session_id], broadcast=True)
@socketio.on('join')
def join(data):
    room = data['room']
    print("\033[92;1m확인\033[0m",room)
    session_id = request.sid
    user_name = current_user.name
    if is_user_in_room(user_name, room):
        emit('already_in_room', {'message': 'You are already in the room.'})
        return
    print(f"\033[92;1m{room}방에 연결되었습니다.\033[0m")
    user_data = {'username': user_name,'usersid': session_id }  # 유저 데이터를 리스트로 생성
    dict_join(user_dict, session_id, user_data)
    join_room(room)
    update_room_player_count(room)
    print(f"\033[92;1m{room}방에 연결되었습니다.\033[0m")

def dict_join(dict_name,dict_index,dict_value):
    if dict_index in dict_name:
        dict_name[dict_index].append(dict_value)
    else :
        dict_name[dict_index] = dict_value

def dict_create(dict_name,dict_index,dict_value):
        dict_name[dict_index] = dict_value


@socketio.on('message')
def handle_message(data):
    msg = data['content']
    room = data.get('room')
    name = current_user.name
    emit('message', {'name': name, 'msg': msg}, room=room)

@socketio.on("playTheGame")
def playTheGame(room_name):
    print("start", user_dict)
    totalPlayers = len(user_dict.get(room_name, []))

    emit('PlayGame', totalPlayers ,broadcast=True)

@socketio.on('MissionSelect')
def send_saved_data(data):
    get_music = make_answer(play_controller.get_music_data(data))

    response = {
        'get_music': get_music,
        'data': data
    }
    emit('MissionSelect_get', response, broadcast=True)




@socketio.on('correctAnswer')
def handle_correct_answer(data):
    # 모든 클라이언트에게 정답을 맞췄다는 정보를 중계합니다.
    room = data.get('room')
    emit('correctAnswer', data, room=room)

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
        emit('nextVideo', {}, broadcast=True)
    else:
        emit('updateVoteCount', {'index': index, 'count': vote_counts[index]}, broadcast=True)






@socketio.on('disconnect')
def disconnect():
    # 유저가 연결을 끊을 때 방을 나갔다고 처리
    removed_rooms = []
    user_name = ""
    for room_name, room_users in user_dict.items():
        if request.sid in room_users:
            user_name = room_users.username
            room_users.remove(request.sid)
            update_room_player_count(room_name)
            if len(room_users) == 0:
                removed_rooms.append(room_name)
    for room_name in removed_rooms:
        remove_room(room_name)
    emit('user_disconnect', user_name)

@socketio.on('request_room_players_update')
def handle_request_room_players_update(data):
    room_name = data['room_name']
    update_room_player_count(room_name)

    # 방마다 인원 수를 클라이언트에게 전달
def update_room_player_count(room_name):
    # print("유저 딕셔너리 확인",user_dict)
    # print("룸 딕셔너리 확인",room_dict)

    emit('room_players_update', {'room_name': room_name, 'player_count': user_dict}, broadcast=True)

def find_key_by_room_name(dictionary, room_name):
    for key, val in dictionary.items():
        if val.get("room_name") == room_name:
            return key
    return None

    # 방 삭제 함수
def remove_room(room_name):
    if room_name in room_dict:
        del room_dict[room_name]
        del user_dict[room_name]
        emit('room_removed', room_dict[room_name], broadcast=True)

if __name__ == '__main__':
    play_controller.ensure_tables_exist()
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)