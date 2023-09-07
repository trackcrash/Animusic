from flask import Blueprint, jsonify
from controllers.map_controller import show_table_mission_top_five
index_bp = Blueprint('index', __name__, url_prefix='')

@index_bp.get('/api/get_ranking_data')
def get_ranking():
    return jsonify(show_table_mission_top_five())
