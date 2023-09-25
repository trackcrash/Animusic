import json,requests
from decouple import config
from flask import flash, redirect, render_template, request, url_for
from flask_login import login_user,current_user
from oauthlib.oauth2 import WebApplicationClient

from models import donate_model
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
def donation(amount):
    try:
        # 금액을 이용한 실제 입금 처리 로직을 여기에 추가합니다.
        # 이 예시에서는 로그에 금액을 출력하는 것으로 대체합니다.
        donate_model.save_donation(amount)
        
        print(f'금액 {amount} 원이 입금되었습니다.')
        
        # 실제로는 여기에서 결제 처리 서비스와 연동하여 금액을 처리해야 합니다.
        
        return True  # 입금 처리가 성공적으로 완료됐을 경우 True 반환
    except Exception as e:
        # 오류가 발생하면 오류 메시지 출력
        print(f'입금 처리 중 오류 발생: {str(e)}')
        return False  # 입금 처리가 실패한 경우 False 반환

def donate_del():
    donate_model.donation_delete()