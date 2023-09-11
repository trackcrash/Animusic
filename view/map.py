from flask import Blueprint, render_template, request, jsonify, send_file
from flask_login import current_user, login_required
from controllers.map_controller import show_mission, show_table, show_mission_byProducer, show_mission_active
from controllers.map_controller import submit_to_db, update_to_db, delete_Mission
from models.play_model import single_make_answer
from controllers.map_controller import map_controller, videoid_check
from models.notification_model import notification
map_bp = Blueprint('map', __name__, url_prefix='')

@map_bp.get('/get-music-data')
def get_music_data():
    mission_id = request.args.get('id')
    return single_make_answer(mission_id)

@map_bp.route('/single_list')
def single_select():
    missions = show_mission()
    return render_template('single_select.html', current_user=current_user,missions=missions, notificaiotn=notification.get_notification())

@map_bp.route('/make_map', methods=['GET', 'POST'])
@login_required
def make_map():
    data = map_controller()
    return render_template('createmap.html', data=data)

@map_bp.route('/view_maps', methods=['GET', 'POST'])
def view_map():
    missions = show_mission()
    return render_template('view_maps.html', current_user=current_user,missions=missions)

@map_bp.route('/Show')
def show():
    return show_table()

@map_bp.route('/submit-to-db', methods=['POST'])
@login_required
def submit():
    return submit_to_db()

@map_bp.route('/Map')
@login_required
def mymap():
    data_list = show_mission_byProducer()
    return render_template('Map.html', data_list=data_list)

@map_bp.post('/update-to-db')
@login_required
def update():
    return update_to_db()

@map_bp.get("/delete-mission")
@login_required
def deleteMission():
    return delete_Mission(request.args.get('id'))

@map_bp.route('/download_excelfile', methods=['GET'])
@login_required
def download_template():
    return send_file('static/file_form/MakingMap_form.xlsx', as_attachment=True)

@map_bp.route('/check_videoid', methods=['POST'])
@login_required
#재생가능한 비디오링크인지 체크해주는 기능(요청 1번에 최대 42개의 비디오링크까지 가능)
def check_videoid():
    videoid_list = set(request.get_json())
    return videoid_check(videoid_list)

@map_bp.get('/api/get_mission_table')
def get_mission_table():
    mission_table_data = show_mission_active()
    return jsonify(mission_table_data)

# 튜토리얼 html 요청
@map_bp.route('/request_htmlContent', methods=['POST'])
def open_tutorial():
    data = request.get_json().get('data')
    if data.split('.')[1] == 'html':
        with open(f'templates/createmap_tutorial/{data}', 'r', encoding='utf-8') as file:
            html_content = file.read()
    elif data.split('.')[1] == 'js':
        with open(f'static/js/createmap_tutorial/{data}', 'r', encoding='utf-8') as file:
            html_content = file.read()
    return html_content