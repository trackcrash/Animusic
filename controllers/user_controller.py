#user login & api register -- Newkyaru 13/08/2023
import json

import requests
from decouple import config
from flask import flash, redirect, render_template, request, url_for
from flask_login import login_user
from oauthlib.oauth2 import WebApplicationClient

from models import user_model


GOOGLE_CLIENT_ID = config('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = config('GOOGLE_CLIENT_SECRET')
GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"
client = WebApplicationClient(GOOGLE_CLIENT_ID)


def register():
    if request.method == 'GET':
        return render_template('register.html')

    if request.method == 'POST':
        email = request.form.get('email')
        name = request.form.get('name')
        password = request.form.get('password')

        # 사용자 이메일 중복 검사
        existing_user = user_model.get_user_by_email(email)
        if existing_user:
            flash('Email already exists.')
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
            return True

        flash('Invalid email or password')
        return False


def google_login():
    google_provider_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]

    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=request.base_url + "/callback",
        scope=["openid", "email", "profile"],
    )

    return redirect(request_uri)


def google_callback():
    token_endpoint = requests.get(GOOGLE_DISCOVERY_URL).json()["token_endpoint"]
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
    user = user_model.save_google_user(user_info)

    # Use Flask-Login to login user
    login_user(user)
    return redirect(url_for('index'))
