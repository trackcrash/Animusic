from flask import Blueprint, render_template, request, jsonify, send_file
from flask_login import current_user
from controllers.map_controller import show_mission, show_table, show_mission_byProducer, show_mission_active
from controllers.map_controller import submit_to_db, update_to_db, delete_Mission, single_make_answer
from controllers.map_controller import map_controller, videoid_check
map_bp = Blueprint('map', __name__, url_prefix='')

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
    data = map_controller()
    return render_template('createmap.html', data=data)

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
    videoid_list = set(request.get_json())
    return videoid_check(videoid_list)

@map_bp.get('/api/get_mission_table')
def get_mission_table():
    mission_table_data = show_mission_active()
    return jsonify(mission_table_data)
