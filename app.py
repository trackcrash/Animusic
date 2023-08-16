#flask main --author: NewKyaru 11/08/2023
import os

from decouple import config
from flask import flash, Flask, jsonify, redirect, render_template, request, url_for
from flask_login import current_user, login_required, LoginManager, logout_user

from controllers import login_controller, play_controller
from models import login_model
from chat.chat import chat_bp, make_answer, socketio

<<<<<<< Updated upstream
=======
from flask_socketio import SocketIO, emit, join_room, leave_room

>>>>>>> Stashed changes
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
app = Flask(__name__)
app.config['SECRET_KEY'] = config('SECRET_KEY')

login_manager = LoginManager()
login_manager.init_app(app)

<<<<<<< Updated upstream
socketio.init_app(app)
app.register_blueprint(chat_bp)


=======
socketio = SocketIO(app)
>>>>>>> Stashed changes
@login_manager.user_loader
def load_user(user_id):
    return login_model.get_user_by_id(user_id)


@app.route('/')
def index():
    missions = play_controller.show_mission()
    return render_template('index.html', current_user=current_user, missions=missions)
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes

@app.route('/play', methods=['GET', 'POST'])
def play():
    return play_controller.play_controller()

<<<<<<< Updated upstream

@app.get('/Show')
def show():
    return play_controller.show_table()


@app.post('/submit-to-db')
def submit():
    return play_controller.submit_to_db()


=======
@app.route('/Show')
def show():
    return play_controller.show_table()

@app.route('/submit-to-db', methods=['POST'])
def submit():
    return play_controller.submit_to_db()

>>>>>>> Stashed changes
@app.route('/play-test', methods=['GET', 'POST'])
def play_test():
    mission_id = request.args.get('id')
    make_answer(mission_id)
    return render_template('TestPlay.html',current_user=current_user)

<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
@app.get('/get-music-data')
def get_music_data():
    mission_id = request.args.get('id')
    return make_answer(mission_id)

<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')

    if request.method == 'POST':
        login_successful = login_controller.user_controller()
        if login_successful:
            return redirect(url_for('index'))
<<<<<<< Updated upstream
=======

        flash('Invalid email or password')
        return redirect(url_for('login'))

>>>>>>> Stashed changes

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

<<<<<<< Updated upstream

@app.get('/Map')
=======
@app.route('/Map')
>>>>>>> Stashed changes
def mymap():
    data_list = play_controller.show_mission_byProducer()
    return render_template('Map.html', data_list=data_list)

<<<<<<< Updated upstream

@app.post('/update-to-db')
def update():
    return play_controller.update_to_db()


@app.get("/delete-mission")
def deleteMission():
    return play_controller.delete_Mission(request.args.get('id'))


if __name__ == '__main__':
    play_controller.ensure_tables_exist()
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
=======
# -------- 채팅 관련 기능 부분 -----------
room_dict = dict()
@app.route('/room_list')
def room_list():
    if current_user.is_authenticated == False:
        user_id = ""
        print(f"로그인 되어있지 않으므로 멀티플레이는 불가합니다.")
    else:
        user_id = current_user.name
        print(f"{user_id} 유저 아이디 확인됨.")
    return render_template('room_list.html', room_dict=room_dict, user_id=user_id)

@app.route('/multi_game')
def chat():
    return render_template('multi_game/multi_game.html')
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

        room_dict[room_name] = session_id       #해당 정보를 key : 방 이름, value : sessionID 로 저장

        join_room(room_name) # 사용자가 만든 제목으로 방 입장시킴
        print(f"{room_name}님이 방을 생성하셨습니다.")

        # multi_game.html로 이동
        emit('move_multi_game')
        # 방이 새로 추가된 것을 room_list 페이지에 접속한 모든 사용자에게 채팅방 추가 요청
        emit('room_update', room_name, broadcast=True)

@socketio.on('join')
def join(data):
    print(socketio.server.enter_room[request.sid, room])
    room = data['room']
    join_room(room)
    print(f"{room}방에 연결되었습니다.")

# ------------------------------------

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
>>>>>>> Stashed changes
