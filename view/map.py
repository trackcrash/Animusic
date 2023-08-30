from flask import Blueprint, render_template, request
from controllers.map_controller import show_mission, show_table,single_make_answer,submit_to_db
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