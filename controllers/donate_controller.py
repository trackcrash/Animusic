import hmac, hashlib,decouple
from decouple import config
from flask import flash, redirect, render_template, request, url_for
from flask_login import login_user,current_user
from oauthlib.oauth2 import WebApplicationClient

from models import donate_model
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

coffeecode = config('BUY_COFFEE_KEY')

def donation(amount, name):
    try:
        donate_model.save_donation(amount, name)
        print(f'금액 {amount} 원이 입금되었습니다.')
        
        return True
    except Exception as e:
        print(f'입금 처리 중 오류 발생: {str(e)}')
        return False
    
def verify_signature(request_body, received_signature):
    computed_signature = hmac.new(bytes(coffeecode , 'latin-1'), msg = request_body , digestmod = hashlib.sha256).hexdigest()
    return hmac.compare_digest(computed_signature, received_signature)

def donate_del():
    donate_model.donation_delete()