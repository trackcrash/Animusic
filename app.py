#flask main --author: NewKyaru 11/08/2023
from decouple import config
from flask import Flask,render_template, request, redirect, url_for, jsonify, flash, send_file
from flask_login import LoginManager, current_user, login_required, logout_user
from view.play import play_bp
from view.map import map_bp
from view.user import login_bp
from controllers.play_controller import get_room_dict, get_user
from controllers import map_controller, login_controller
from models.user_model import get_user_by_id, delete_account, account_insert, account_insert_in_googleuser, insert_character_number
from models.play_model import make_answer
import requests, os
app = Flask(__name__)
app.config['SECRET_KEY'] = config('SECRET_KEY')

app.register_blueprint(play_bp)
app.register_blueprint(map_bp)
app.register_blueprint(login_bp)
login_manager = LoginManager()
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id):
    return get_user_by_id(user_id)

@app.route('/single-play', methods=['GET', 'POST'])
def single_play():
    return render_template('single_game.html',current_user=current_user)

@app.route('/')
def index():
    return render_template('index.html', current_user=current_user)


#----------회원 탈퇴 & 회원 정보수정-----------

# 캐릭터 변경기능
@app.route('/select_character')
def select_character():
    character_list = [file for file in os.listdir('static/img/character')]
    print("캐릭터 이미지파일 리스트: ", character_list)
    return render_template('account_management/selectCharacter.html', character_list=character_list)

@app.route('/insert_character', methods=['POST'])
def insert_character():
    character_number = request.get_json().get('character_number')
    return insert_character_number(character_number)
# -------------------------------------
####################################################################################

#미션 관리부분
@app.route('/Map')
def mymap():
    data_list = map_controller.show_mission_byProducer()
    return render_template('Map.html', data_list=data_list)

@app.post('/update-to-db')
def update():
    return map_controller.update_to_db()


@app.get("/delete-mission")
def deleteMission():
    return map_controller.delete_Mission(request.args.get('id'))

@app.route('/download_excelfile', methods=['GET'])
def download_template():
    return send_file('static/file_form/MakingMap_form.xlsx', as_attachment=True)

@app.route('/check_videoid', methods=['POST'])
#재생가능한 비디오링크인지 체크해주는 기능(요청 1번에 최대 42개의 비디오링크까지 가능)
def check_videoid():
    videoid_list, convert_list = set(request.get_json()), set()
    result = videoid_list.copy()
    for id_count, videoid in enumerate(videoid_list):
        convert_list.add("&id=" + videoid)
        if (id_count + 1) % 42 == 0:
            request_text = "".join(map(str, convert_list))
            api_result = requests.get(f'https://www.googleapis.com/youtube/v3/videos?key={config("YOUTUBE_API_KEY")}&part=status{request_text}')
            renewable_list = set(item['id'] for item in api_result.json()['items'] if item['status']['embeddable'])
            result -= renewable_list
            convert_list.clear()
    if len(convert_list) > 0:
        request_text = "".join(map(str, convert_list))
        api_result = requests.get(f'https://www.googleapis.com/youtube/v3/videos?key={config("YOUTUBE_API_KEY")}&part=status{request_text}')
        renewable_list = set(item['id'] for item in api_result.json()['items'] if item['status']['embeddable'])
        result -= renewable_list
    return jsonify(list(result))

#########################################################################################

@app.route('/room_list')
def room_list():
    if current_user.is_authenticated == False:
        user_id = ""
        print(f"로그인 되어있지 않으므로 멀티플레이는 불가합니다.")
    else:
        user_id = current_user.name
        print(f"{user_id} 유저 아이디 확인됨.")
    return render_template('room_list.html')

@app.route('/sitemap.xml')
def sitemap():
    return send_file('sitemap.xml')

@app.get("/get-room-dict")
def get_room_dictAll():
    return get_room_dict()

@app.get("/get_user_info")
def get_user_info():
    return get_user()

@app.get('/multi_game')
def chat():
    return render_template('multi_game/multi_game.html',current_user=current_user)

@app.post('/multi_game')
def chat_post():
    mission_id = request.args.get('id')
    make_answer(mission_id, request.args.get('room_name'))
    return render_template('multi_game/multi_game.html',current_user=current_user)

@app.get('/api/get_mission_table')
def get_mission_table():
    mission_table_data = map_controller.show_mission_active()
    return jsonify(mission_table_data)

@app.route('/robots.txt')
def robots():
    return send_file('robots.txt')

if __name__ == '__main__':
    map_controller.ensure_tables_exist()
    app.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)