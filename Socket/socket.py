#chatting, data parse --author: NewKyaru 15/08/2023
from flask_socketio import SocketIO, emit
from models.play_model import room_data_manager
socketio = SocketIO()

class socketClass:
    def __init__(self):
        self.waitingroom_userlist = {}
        self.totalPlayers = 0
        self.room_name = ""
        self.waitingroom_userlist = {}
        self.vote_counts = {}
        self.voted_users = {}
    
    
    def update_room_player_count(room_name, msg, player_name):
        player_count= len(room_data_manager._data_store[room_name]['user'])
        player = player_name
        players = room_data_manager._data_store[room_name]['user']
        emit('room_players_update', {'room_name': room_name, 'player_count':player_count,'player' : player, 'players': players, 'msg': msg}, broadcast=True)
    
    
socket_class = socketClass()