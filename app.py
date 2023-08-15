#flask main --author: NewKyaru 11/08/2023
import os

from decouple import config
from flask import flash, Flask, jsonify, redirect, render_template, request, url_for
from flask_login import current_user, login_required, LoginManager, logout_user

from controllers import login_controller, play_controller
from models import login_model
from chat.chat import chat_bp, make_answer, socketio

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
app = Flask(__name__)
app.config['SECRET_KEY'] = config('SECRET_KEY')

login_manager = LoginManager()
login_manager.init_app(app)

socketio.init_app(app)
app.register_blueprint(chat_bp)


@login_manager.user_loader
def load_user(user_id):
    return login_model.get_user_by_id(user_id)


@app.route('/')
def index():
    missions = play_controller.show_mission()
    return render_template('index.html', current_user=current_user, missions=missions)


@app.route('/play', methods=['GET', 'POST'])
def play():
    return play_controller.play_controller()


@app.get('/Show')
def show():
    return play_controller.show_table()


@app.post('/submit-to-db')
def submit():
    return play_controller.submit_to_db()


@app.route('/play-test', methods=['GET', 'POST'])
def play_test():
    mission_id = request.args.get('id')
    make_answer(mission_id)
    return render_template('TestPlay.html',current_user=current_user)


@app.get('/get-music-data')
def get_music_data():
    mission_id = request.args.get('id')
    return make_answer(mission_id)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')

    if request.method == 'POST':
        login_successful = login_controller.user_controller()
        if login_successful:
            return redirect(url_for('index'))

        flash('Invalid email or password')
        return redirect(url_for('login'))


@app.get('/login/google')
def google_login():
    return login_controller.google_login()


@app.get('/login/google/callback')
def google_callback():
    return login_controller.google_callback()


@app.get('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        return login_controller.register()
    return render_template('register.html')


@app.get('/Map')
def mymap():
    data_list = play_controller.show_mission_byProducer()
    return render_template('Map.html', data_list=data_list)


@app.post('/update-to-db')
def update():
    return play_controller.update_to_db()


@app.get("/delete-mission")
def deleteMission():
    return play_controller.delete_Mission(request.args.get('id'))


if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
