#flask main --author: NewKyaru 11/08/2023
from flask import Flask, render_template, request, flash, redirect, url_for
from flask_login import LoginManager, current_user, logout_user, login_required
from controllers import play_controller, login_controller
from models import login_model
from decouple import config
app = Flask(__name__)
app.config['SECRET_KEY'] = config('SECRET_KEY')

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return login_model.get_user_by_id(user_id)

@app.route('/')
def index():
    return render_template('index.html', current_user=current_user)

@app.route('/play', methods=['GET', 'POST'])
def play():
    return play_controller.play_controller()

@app.route('/submit-to-db', methods=['POST'])
def submit():
    return play_controller.submit_to_db()

@app.route('/Show')
def show():
    return play_controller.show_table()

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        login_successful = login_controller.user_controller()
        if login_successful:
            return redirect(url_for('index'))
        else:
            flash('Invalid email or password')
            return redirect(url_for('login'))
    if request.method == 'GET':
        return render_template('login.html')

@app.route('/login/google')
def google_login():
    return login_controller.google_login()

@app.route('/login/google/callback')
def google_callback():
    return login_controller.google_callback()

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        response = login_controller.register()
        return response
    return render_template('register.html')

if __name__ == '__main__':
    app.run(debug=True)