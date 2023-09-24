#user login & api register -- Newkyaru 13/08/2023
import json,requests
from decouple import config
from flask import flash, redirect, render_template, request, url_for
from flask_login import login_user
from oauthlib.oauth2 import WebApplicationClient

from models import user_model

import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

GOOGLE_CLIENT_ID = config('GOOGLE_CLIENT_ID')
GOOGLE_ID = config('GOOGLE_ID')
GOOGLE_PW = config('GOOGLE_PW')
GOOGLE_CLIENT_SECRET = config('GOOGLE_CLIENT_SECRET')
GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"
client = WebApplicationClient(GOOGLE_CLIENT_ID)
emailDict = {}

with open('banned_words.txt', 'r', encoding='utf-8') as f:
    BANNED_WORDS = f.read().split('\n')

def register(request):
    if request.method == 'GET':
        return render_template('register.html')

    if request.method == 'POST':
        email = request.form.get('email')
        name = request.form.get('name')
        password = request.form.get('password')

        for word in BANNED_WORDS:
            if word in name:
                flash('Invalid name')
                return redirect(url_for('user.register'))

        # 사용자 정보 저장
        user = user_model.save_user(email, name, password)
        if user:
            flash('Successfully registered.')
            return redirect(url_for('user.login'))
        else:
            flash('Registration failed.')
            return redirect(url_for('user.register'))


def user_controller():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        # 일반 로그인 검증
        user = user_model.validate_user(email, password)
        if user:
            login_user(user)
            return redirect(url_for('index'))
        else:
            flash('Invalid email or password')
            return False


def google_login():
    google_provider_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]

    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        #redirect_uri="https://www.igeo.site/login/google/callback",
        redirect_uri=request.base_url + "/callback",
        scope=["openid", "email", "profile"],
    )
    return redirect(request_uri)


def google_callback():
    token_endpoint = requests.get(GOOGLE_DISCOVERY_URL).json()["token_endpoint"]
    # temp = request.url
    # token_url, headers, body = client.prepare_token_request(
    #     token_endpoint,
    #     authorization_response=temp.replace('http','https'),
    #     redirect_url="https://www.igeo.site/login/google/callback",
    #     code=request.args.get("code")
    # )
    token_url, headers, body = client.prepare_token_request(
        token_endpoint,
        authorization_response=request.url,
        redirect_url=request.base_url,
        code=request.args.get("code")
    )
    token_response = requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
    )
    client.parse_request_body_response(json.dumps(token_response.json()))
    userinfo_endpoint = requests.get(GOOGLE_DISCOVERY_URL).json()["userinfo_endpoint"]
    uri, headers, body = client.add_token(userinfo_endpoint)
    userinfo_response = requests.get(uri, headers=headers, data=body)

    user_info = userinfo_response.json()
    user,session = user_model.save_google_user(user_info)

    # Use Flask-Login to login user
    login_user(user)
    session.close()
    return redirect(url_for('index'))



# 이메일 보내는 함수
def send_verification_email(email, verification_code):
    smtp_server = 'smtp.gmail.com'
    smtp_port = 587
    smtp_username = GOOGLE_ID  # 보내는 이메일 주소
    smtp_password = GOOGLE_PW  # 이메일 비밀번호

    # 이메일 내용 설정
    subject = '이메일 인증 코드'
    message = f'''
    아이거에서 보낸 이메일 인증 코드입니다,

    인증코드: {verification_code}

    이 인증 코드를 웹사이트에 입력하여 이메일 인증을 완료해주세요.

    감사합니다.
    '''

    # 이메일 보내기 
    try:
        smtp = smtplib.SMTP(smtp_server, smtp_port)
        smtp.starttls()
        smtp.login(smtp_username, smtp_password)

        msg = MIMEMultipart()
        msg['From'] = f"아이거 Igeo <{smtp_username}>"
        msg['To'] = email
        msg['Subject'] = subject
        msg.attach(MIMEText(message, 'plain'))


        smtp.sendmail(smtp_username, email, msg.as_string())
        emailDict[email] = verification_code
        smtp.quit()
        print("이메일 전송 성공")
        return True
    except Exception as e:
        print(f"이메일 전송 실패: {str(e)}")
        return False

# 무작위 인증 번호 생성 함수
def generate_verification_code():
    return str(random.randint(1000, 9999))