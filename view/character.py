from flask import Blueprint, render_template, request
from models.user_model import insert_character_number
from flask_login import current_user
from models.notification_model import notification
char_bp = Blueprint('char', __name__, url_prefix='')
@char_bp.route('/select_character')
def select_character():
    return render_template('account_management/selectCharacter.html',current_user=current_user,notification=notification.get_notification())

@char_bp.route('/insert_character', methods=['POST'])
def insert_character():
    character_number = request.get_json().get('character_number')
    return insert_character_number(character_number)