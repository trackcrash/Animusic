#user_main --author: NewKyaru 30/08/2023
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import logout_user, login_required, current_user
from controllers.login_controller import user_controller
from models.user_model import delete_account, account_insert, account_insert_in_googleuser


login_bp = Blueprint('login', url_prefix='')

@login_bp.get('/delete_account_confirm')
def delete_account_confirm():
    return render_template('account_management/deleteAccountConfirm.html')

@login_bp.get('/delete_account')
def deleting_account():
    print(f"\033[92;1m{current_user.name}님의 회원탈퇴 시도중...\033[0m")
    result_delete_account = delete_account()
    if result_delete_account:
        print("\033[92;1m회원 탈퇴처리 완료\033[0m")
        return render_template('account_management/deleteAccountComplete.html')
    else:
        print("\033[92;1m회원 탈퇴처리 실패\033[0m")
        return render_template('account_management/deleteAccountFail.html')
@login_bp.get('/account_confirm')
def account_confirm():
    print("체크 중: ", current_user.is_authenticated)
    if current_user.is_authenticated == False:
        return render_template('account_management/accountConfirm.html')
    else:
        return render_template('account_management/managementAccountPage.html')
@login_bp.route('/get_current_user_is_google_authenticated', methods=['GET'])
def get_current_user_is_google_authenticated():
    return jsonify({'check_googleuser': current_user.is_google_authenticated})

@login_bp.route('/update_profile', methods=['POST'])
def update_profile():
    data = request.json
    nickname = data[0]['nickname']
    password = data[0]['password']
    newpassword = data[0]['newpassword']

    if current_user.is_google_authenticated: # 구글 유저 인 경우
        if account_insert_in_googleuser(nickname):
            print(f"\033[92;1m사용자의 닉네임이 {nickname}으로 변경되었습니다.\033[0m")
            return jsonify({'message': '변경이 완료되었습니다.'}), 200
        else:
            print("\033[92;1m이미 존재하는 닉네임을 가진 회원이 있으므로 변경할 수 없습니다.\033[0m")
            return jsonify({'message': '이미 동일한 닉네임이 존재합니다.'}), 400
    else:
        if account_insert(nickname, password, newpassword):
            print("\033[92;1m사용자의 회원정보가 변경되었습니다.\033[0m")
            return jsonify({'message': '변경이 완료되었습니다.'}), 200
        else:
            print("\033[92;1m사용자의 회원정보 변경이 실패하였습니다.\033[0m")
            return jsonify({'message': '기존 비밀번호가 일치하지 않거나 동일한 닉네임이 존재합니다.'}), 400


@login_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')

    if request.method == 'POST':
        login_successful = user_controller()
        if login_successful:
            return redirect(url_for('index'))

        flash('Invalid email or password')
        return redirect(url_for('login'))
    
@login_bp.get('/login/google')
def google_login():
    return google_login()


@login_bp.get('/login/google/callback')
def google_callback():
    return google_callback()


@login_bp.get('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))


@login_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        return register()
    return render_template('register.html')