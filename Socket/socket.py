#chatting, data parse --author: NewKyaru 15/08/2023
from flask_socketio import SocketIO
socketio = SocketIO()

class socketClass:
    def __init__(self):
        self.waitingroom_userlist = {}
        self.totalPlayers = {}
        self.room_name = {}
        self.vote_counts = {}
        self.voted_users = {}
        self.play_vote = {}
        self.isDuplication ={}
        self.BanList = {}
socket_class = socketClass()