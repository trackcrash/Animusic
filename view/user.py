#user_main --author: NewKyaru 30/08/2023
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import logout_user, login_required, current_user
from controllers.user_controller import user_controller
from models.user_model import delete_account, account_insert, account_insert_in_googleuser, insert_character_number


user_bp = Blueprint('user', __name__, url_prefix='')

@user_bp.get('/delete_account_confirm')
def delete_account_confirm():
    return render_template('account_management/deleteAccountConfirm.html')

@user_bp.get('/delete_account')
def deleting_account():
    result_delete_account = delete_account()
    if result_delete_account:
        return render_template('account_management/deleteAccountComplete.html')
    else:
        return render_template('account_management/deleteAccountFail.html')
@user_bp.get('/account_confirm')
def account_confirm():
    if current_user.is_authenticated == False:
        return render_template('account_management/accountConfirm.html')
    else:
        return render_template('account_management/managementAccountPage.html')
@user_bp.route('/get_current_user_is_google_authenticated', methods=['GET'])
def get_current_user_is_google_authenticated():
    return jsonify({'check_googleuser': current_user.is_google_authenticated})

@user_bp.route('/update_profile', methods=['POST'])
def update_profile():
    data = request.json
    nickname = data[0]['nickname']
    password = data[0]['password']
    newpassword = data[0]['newpassword']

    if current_user.is_google_authenticated: # 구글 유저 인 경우
        if account_insert_in_googleuser(nickname):
            return jsonify({'message': '변경이 완료되었습니다.'}), 200
        else:
            return jsonify({'message': '이미 동일한 닉네임이 존재합니다.'}), 400
    else:
        if account_insert(nickname, password, newpassword):
            return jsonify({'message': '변경이 완료되었습니다.'}), 200
        else:
            return jsonify({'message': '기존 비밀번호가 일치하지 않거나 동일한 닉네임이 존재합니다.'}), 400


@user_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')

    if request.method == 'POST':
        login_successful = user_controller()
        if login_successful:
            return redirect(url_for('index'))

        flash('Invalid email or password')
        return redirect(url_for('login'))
    
@user_bp.get('/login/google')
def google_login():
    return google_login()


@user_bp.get('/login/google/callback')
def google_callback():
    return google_callback()


@user_bp.get('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))


@user_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        return register()
    return render_template('register.html')

@user_bp.route('/select_character')
def select_character():
    return render_template('account_management/selectCharacter.html')

@user_bp.route('/insert_character', methods=['POST'])
def insert_character():
    character_number = request.get_json().get('character_number')
    return insert_character_number(character_number)