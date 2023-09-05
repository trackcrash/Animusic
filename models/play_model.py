import random
from controllers.map_controller import show_table_bymissionid
from models.user_model import get_user_by_id
from flask import jsonify
from flask_login import current_user
from models.user_model import get_userinfo_by_name
from controllers.map_controller import show_mission_byid
from Socket.socket import socket_class
import copy
class RoomDataManger:
    def __init__(self):
        self._data_store = dict()
    def remove_room(self, room_key):
        if room_key in self._data_store:
            del self._data_store[room_key]
        if room_key in socket_class.play_vote:
            del socket_class.play_vote[room_key]
        if room_key in socket_class.totalPlayers:
            del socket_class.totalPlayers[room_key]
        if room_key in socket_class.isDuplication:
            del socket_class.isDuplication[room_key]
        if room_key in socket_class.BanList:
            del socket_class.BanList[room_key]
    def room_check(self, room_key):
        if room_key in self._data_store:
            return True
        else:
            return False
        
    def create_room(self,room_key,session_id):
            if room_key in self._data_store:
                return False
            
            # 방 중복생성 금지 (클라이언트에 해당 이벤트 요청)
            #방을 생성할 사용자의 정보를 room_data_manager에 저장
            #해당 사용자의 세션 id
            print(f"해당 사용자의 방 생성 정보: {session_id, room_key}")
            #방 정보 room_data_manager에 담기 위한 data
            room_data = {
                "room_info":{
                    "room_name" : "temp",
                    "session_id":session_id,
                    "room_password": None,
                    "room_status" : False,
                    "room_full_user" : 8,
                    "room_mission" : None,
                    "is_skip" : True
                },
                "user":
                {

                }
            }
            dict_create(self._data_store,room_key,room_data)
            return True
    
    def join(self, room_key, session_id, current_user,time):
        user_name = current_user.name
        user=get_user_by_id(current_user.id)
        character = user.character
        level = user.level
        character_link = str(character)
        print(f"{room_key}방에 연결되었습니다.")
        user_data = {'username': user_name , 'host':0 ,'score':0 ,'joined_time' : time.time(), 'character':character_link,'level':level}  # 유저 데이터를 리스트로 생성
        dict_join(self._data_store[room_key]["user"], session_id, user_data)
    
    def get_all_session_ids_in_rooms(self):
        session_ids = []

        # 모든 방에 대해서 반복
        for room_key, room_data in self._data_store.items():
            if "user" in room_data:
                # 방에 있는 모든 세션 아이디를 리스트에 추가
                session_ids.extend(room_data["user"].keys())

        return session_ids
    def user_update(self, room_key, session_id):
        user_name=self._data_store[room_key]["user"][session_id]['username']
        user = get_userinfo_by_name(user_name)
        character = user.character
        level = user.level
        character_link = str(character)
        previous_user = self._data_store[room_key]["user"][session_id]
        user_data = {'username': user_name , 'host':previous_user['host'] ,'score':previous_user['score'] ,'joined_time' :previous_user['joined_time'], 'character':character_link,'level':level}
        dict_join(self._data_store[room_key]["user"], session_id, user_data)

    def host_setting(self, room_key, callback=None):
        if room_key in self._data_store and "user" in self._data_store[room_key]:
            users = self._data_store[room_key]["user"]
            print("users",users)
            if users:  # 유저 정보가 있는 경우
                all_hosts_zero = all(user["host"] == 0 for user in users.values())
                if all_hosts_zero:
                    first_user_key = list(users.keys())[0] # 첫 번째 사용자의 키를 가져옵니다.
                    users[first_user_key]["host"] = 1  # host를 1로 변경합니다.
                    # 변경된 정보 출력
                    print(f"Host setting for user {first_user_key}: {users[first_user_key]}")
                    return first_user_key
                else:
                    print("Not all users have host set to 0.")
            else:
                print("No user data in the room.")
        else:
            print("Room not found or no user data in the room.")
        if callback:
            callback()  # 콜백 함수 호출

    def is_user_in_room(self, user_name, room_key):
        if room_key not in self._data_store:  # 방 이름이 존재하지 않는 경우
            return False  # 사용자는 방에 없는 것으로 간주
        if room_key not in socket_class.BanList:
            socket_class.BanList[room_key] = []
        user_id = get_userinfo_by_name(user_name).id
        if user_id in socket_class.BanList[room_key]:
            return True
        dictionaryData = self._data_store[room_key]['user']
        for key, value in dictionaryData.items():
            if 'username' in value and value['username'] == user_name:
                return True
        return False
    
    def game_status(self, room_key, booldata):
        self._data_store[room_key]['room_info']['room_status'] = booldata
    def Mission_select(self, room_key, mission):
        self._data_store[room_key]['room_info']['room_mission'] = mission
    def game_init(self, room_key):
        dictionaryData = self._data_store[room_key]['user']
        for key, value in dictionaryData.items():
            value['score'] = 0

    def room_user_check(self, room_key):
        playerNum = len(self._data_store[room_key]['user'])
        return playerNum
                
room_data_manager = RoomDataManger()
class MusicDataManager:
    def __init__(self):
        self._data_store = dict()

    def store_data(self, room_key, data):
        self._data_store[room_key] = {
            'data': data,
            'current_index': 0
        }
    def index_data(self, room_key):
        return self._data_store.get(room_key, {}).get('current_index', 0)
    
    def retrieve_data(self, room_key):
        index = self._data_store.get(room_key, {}).get('current_index', 0)
        return self._data_store.get(room_key, {}).get('data', [])[index]

    def retrieve_next_data(self, room_key):
        room_data = self._data_store.get(room_key, {})
        room_data['current_index'] += 1
        data = room_data.get('data', [])
        idx = room_data.get('current_index', 0)
        if idx < len(data):
            next_item = data[idx]
            return next_item
        return None

    def remove_data(self, room_key):
        if room_key in self._data_store:
            del self._data_store[room_key]
    
    def check_answer(self, room_key, answer):
        room_data = self._data_store.get(room_key, {})
        data = room_data.get('data', [])
        idx = room_data.get('current_index', 0)
        # Data is available
        if idx < len(data):
            next_item = data[idx]
            if answer in next_item['answer_list']:
                return True
        return False

music_data_manager = MusicDataManager()

def make_answer(mission_id, room_key):
    data = show_table_bymissionid(mission_id)
    result = []

    for item in data:
        youtube_embed_url = f"https://www.youtube.com/embed/{item['youtube_url'].split('=')[-1]}?autoplay=1"
        answer_list = [answer.strip() for answer in item['answer'].split(',')]
        starttime = float(item['startTime'])
        endTime = float(item['endTime'])
        music_data = {
            'hint': item['hint'],
            'startTime': starttime,
            'endTime' : endTime ,
            'is_answered': 'false',
            'answer_list': answer_list,
            'youtube_embed_url': youtube_embed_url,
            'title': item['title'],
            'song': item['song']
        }
        result.append(music_data)

    random.shuffle(result)

    music_data_manager.store_data(room_key, result)
    return room_key


def single_make_answer(mission_id):
    data = show_table_bymissionid(mission_id)
    result = []

    for item in data:
        youtube_embed_url = f"https://www.youtube.com/embed/{item['youtube_url'].split('=')[-1]}?autoplay=1"
        answer_list = [answer.strip() for answer in item['answer'].split(',')]
        music_data = {
            'hint': item['hint'],
            'is_answered': 'false',
            'answer_list': answer_list,
            'youtube_embed_url': youtube_embed_url,
            'title': item['title'],
            'song': item['song'],
            'startTime' : item['startTime'],
            'endTime' : item['endTime']
        }
        result.append(music_data)

    random.shuffle(result)
    return result



def dict_join(dict_name,dict_index,dict_value):
    if dict_index in dict_name:
        dict_name[dict_index].update(dict_value)
    else :
        dict_name[dict_index] = dict_value

def dict_create(dict_name,dict_index,dict_value):
        dict_name[dict_index] = dict_value

def get_room_dict():
    room_dict = copy.deepcopy(room_data_manager._data_store)
    for key, value in room_dict.items():
        room_dict[key]["room_info"]["room_password"] = False if room_dict[key]["room_info"]["room_password"] in ('', None) else True 
    return jsonify(room_dict)

def get_thisroom_dict(room_key):
    room_dict = copy.deepcopy(room_data_manager._data_store[room_key])
    
    return jsonify(room_dict)

def get_user():
    data = ""
    if current_user.is_authenticated:
        data = current_user.name
    return jsonify(data)