from flask import Blueprint, render_template, request
from models.user_model import insert_character_number
char_bp = Blueprint('char', url_prefix='')
@char_bp.route('/select_character')
def select_character():
    return render_template('account_management/selectCharacter.html')

@char_bp.route('/insert_character', methods=['POST'])
def insert_character():
    character_number = request.get_json().get('character_number')
    return insert_character_number(character_number)