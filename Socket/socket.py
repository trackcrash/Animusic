#chatting, data parse --author: NewKyaru 15/08/2023
from flask_socketio import SocketIO
socketio = SocketIO()

class socketClass:
    def __init__(self):
        self.waitingroom_userlist = {}
        self.totalPlayers = 0
        self.room_name = ""
        self.waitingroom_userlist = {}
        self.vote_counts = {}
        self.voted_users = {}
    
socket_class = socketClass()