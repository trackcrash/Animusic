from flask import render_template
from flask_login import current_user

@app.route('/room_list')
def room_list():
    if current_user.is_authenticated == False:
        user_id = ""
        print(f"로그인 되어있지 않으므로 멀티플레이는 불가합니다.")
    else:
        user_id = current_user.name
        print(f"{user_id} 유저 아이디 확인됨.")
    return render_template('room_list.html')
