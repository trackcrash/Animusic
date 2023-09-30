#user_main --author: NewKyaru 30/08/2023
import jwt, datetime
from decouple import config
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, Flask

from flask_login import logout_user, login_required, current_user,login_user
from controllers.user_controller import site_login, google_login, google_callback,register as user_register,send_verification_email,generate_verification_code,emailDict
from models.user_model import delete_account, account_insert, account_insert_in_googleuser, insert_character_number,email_check_model,name_check_model,password_update

SECRET_KEY = config('SECRET_KEY')
EXPIRATION_TIME = datetime.timedelta(minutes=10)
tokenDict = {}
user_bp = Blueprint('user', __name__, url_prefix='')

@user_bp.get('/delete_account_confirm')
@login_required
def delete_account_confirm():
    return render_template('account_management/deleteAccountConfirm.html')

@user_bp.get('/delete_account')
@login_required
def deleting_account():
    result_delete_account = delete_account()
    if result_delete_account:
        return render_template('account_management/deleteAccountComplete.html')
    else:
        return render_template('account_management/deleteAccountFail.html')
@user_bp.get('/account_confirm')
@login_required
def account_confirm():
    if current_user.is_authenticated == False:
        return render_template('account_management/accountConfirm.html')
    else:
        return render_template('account_management/managementAccountPage.html')
@user_bp.route('/get_current_user_is_google_authenticated', methods=['GET'])
def get_current_user_is_google_authenticated():
    return jsonify({'check_googleuser': current_user.is_google_authenticated})

@user_bp.route('/update_profile', methods=['POST'])
@login_required
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
        return site_login()
        
    
@user_bp.get('/login/google')
def move_google_login():
    return google_login()


@user_bp.get('/login/google/callback')
def move_google_callback():
    return google_callback()


@user_bp.get('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))


@user_bp.route('/register', methods=['GET', 'POST'])
def register():
    return user_register(request)

@user_bp.route('/select_character')
@login_required
def select_character():
    return render_template('account_management/selectCharacter.html')

@user_bp.route('/insert_character', methods=['POST'])
@login_required
def insert_character():
    character_number = request.get_json().get('character_number')
    return insert_character_number(character_number)

@user_bp.route('/api/send_verification_email', methods=['POST'])
def send_verification():
    email = request.get_json().get('email')
    verification_email =  generate_verification_code()
    send_verification_email(email, verification_email)
    return "이메일 전송완료"

@user_bp.route('/api/verify_verification_code', methods=['POST'])
def verify_verification_code():
    client_code = request.form.get('code')  # 클라이언트에서 전송한 인증 코드
    email = request.form.get('email')  # 클라이언트에서 전송한 인증 코드
    if emailDict[email]:
        server_code = emailDict[email]
    if client_code == server_code:
        return "success"  # 인증 코드가 일치할 때 성공 응답 반환
    else:
        return "error"  # 인증 코드가 일치하지 않을 때 오류 응답 반환

@user_bp.route('/api/verify_forgot_password', methods=['POST'])
def verify_forgot_password():
    client_code = request.form.get('code')  
    email = request.form.get('email')  
    if emailDict[email]:
        server_code = emailDict[email]
    if client_code == server_code:
        payload = {
            'email': email,
            'exp': datetime.datetime.utcnow() + EXPIRATION_TIME
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
        tokenDict[email] = token
        return jsonify({'token': token, 'message': 'success'})
    else:
        return "error"
    
@user_bp.route('/api/password_reset', methods=['POST'])
def password_reset():
    token = request.form.get('token')
    password = request.form.get('password')
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        email = payload['email']
        if tokenDict[email] == token:
            tokenDict.pop(email)
            #DB에 비밀번호 변경
            password_update(email,password)
            return "success"
        else:
            return "error"
    except jwt.ExpiredSignatureError:
        return "error"
    
@user_bp.route('/api/email_check', methods=['GET'])
def email_check():
    email = request.args.get('email')
    if email_check_model(email):
        return "Success"
    return "Fail"

@user_bp.route('/api/name_check', methods=['GET'])
def name_check():
    name = request.args.get('name')
    if name_check_model(name):
        return "Success"
    return "Fail"

@user_bp.route('/api/get_user')
def get_user():
    data = {}
    data["id"] = current_user.id
    data["permissions"] = current_user.permissions
    return data
@user_bp.route('/kick_page')
def kick():
    return render_template("kick.html")