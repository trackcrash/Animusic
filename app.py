#flask main --author: NewKyaru 11/08/2023
from decouple import config 
from flask import Flask,render_template, send_file
from flask_login import LoginManager, current_user
#controller&model&view(blueprint)
from controllers.map_controller import ensure_tables_exist
from models.user_model import get_user_by_id
from view.play import play_bp
from view.map import map_bp
from view.user import user_bp
from view.room import room_bp
from view.character import char_bp
#socket
from Socket.socket import socketio
from Socket.connect_socket import connect_MySocket
from Socket.play_socket import play_Socket
from Socket.room_socket import room_Socket

app = Flask(__name__)
app.config['SECRET_KEY'] = config('SECRET_KEY')

app.register_blueprint(play_bp)
app.register_blueprint(map_bp)
app.register_blueprint(user_bp)
app.register_blueprint(room_bp)
app.register_blueprint(char_bp)
socketio.init_app(app, cors_allowed_origins="*")


connect_MySocket(socketio)
play_Socket(socketio)
room_Socket(socketio)


login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'user.login'

@login_manager.user_loader
def load_user(user_id):
    return get_user_by_id(user_id)

@app.route('/')
def index():
    return render_template('index.html', current_user=current_user)

@app.route('/robots.txt')
def robots():
    return send_file('robots.txt')

@app.route('/sitemap.xml')
def sitemap():
    return send_file('sitemap.xml')

if __name__ == '__main__':
    ensure_tables_exist()
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
