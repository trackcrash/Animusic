import requests
from decouple import config
from flask import Blueprint, render_template, request, jsonify, send_file
from controllers.map_controller import show_mission, show_table,single_make_answer,submit_to_db,show_mission_byProducer,update_to_db,delete_Mission
from flask_login import current_user
from controllers import map_controller
map_bp = Blueprint('map', __name__, url_prefix='/map')

@map_bp.get('/get-music-data')
def get_music_data():
    mission_id = request.args.get('id')
    return single_make_answer(mission_id)

@map_bp.route('/single_list')
def single_select():
    missions = show_mission()
    return render_template('single_select.html', current_user=current_user,missions=missions)

@map_bp.route('/make_map', methods=['GET', 'POST'])
def make_map():
    return map_controller()

@map_bp.route('/Show')
def show():
    return show_table()

@map_bp.route('/submit-to-db', methods=['POST'])
def submit():
    return submit_to_db()

@map_bp.route('/Map')
def mymap():
    data_list = show_mission_byProducer()
    return render_template('Map.html', data_list=data_list)

@map_bp.post('/update-to-db')
def update():
    return update_to_db()


@map_bp.get("/delete-mission")
def deleteMission():
    return delete_Mission(request.args.get('id'))

@map_bp.route('/download_excelfile', methods=['GET'])
def download_template():
    return send_file('static/file_form/MakingMap_form.xlsx', as_attachment=True)

@map_bp.route('/check_videoid', methods=['POST'])
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