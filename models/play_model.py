import random
from controllers.map_controller import show_table_bymissionid
from models.user_model import get_user_by_id

class RoomDataManger:
    def __init__(self):
        self._data_store = dict()
    def remove_room(self, room_name):
        if room_name in self._data_store:
            del self._data_store[room_name]
    def user_left(self, room_name, user_id):
        if room_name in self._data_store and "user" in self._data_store[room_name]:
            users = self._data_store[room_name]["user"]
        
            
        if len(users) > 0:
            if user_id in users and users[user_id]["host"] == 1:
            # 가장 오랜 시간 동안 머문 사용자를 새로운 방장으로 설정
                longest_present_user = max(users, key=lambda user: users[user]["joined_time"])
                users[longest_present_user]["host"] = 1
                return longest_present_user
    def room_check(self, room_name):
        if room_name in self._data_store:
            return True
        else:
            return False
    def create_room(self,room_name,session_id):
            if room_name in self._data_store:
                return False
            
            # 방 중복생성 금지 (클라이언트에 해당 이벤트 요청)
            #방을 생성할 사용자의 정보를 room_data_manager에 저장
            #해당 사용자의 세션 id
            print(f"해당 사용자의 방 생성 정보: {session_id, room_name}")
            #방 정보 room_data_manager에 담기 위한 data
            room_data = {
                "room_info":{
                    "session_id":session_id,
                    #room_password, room_status, playing\
                    "room_status" : False
                },
                "user":
                {

                }
            }
            dict_create(self._data_store,room_name,room_data)
            print(f"{room_name}님이 방을 생성하셨습니다.")
            return True
    def join(self, room_name, session_id, current_user,time):
        user_name = current_user.name
        character = get_user_by_id(current_user.id).character
        character_link = str(character)
        print(f"{room_name}방에 연결되었습니다.")
        user_data = {'username': user_name , 'host':0 ,'score':0 ,'joined_time' : time.time(), 'character':character_link}  # 유저 데이터를 리스트로 생성
        dict_join(self._data_store[room_name]["user"], session_id, user_data)
    def host_setting(self,room_name, callback=None):  
        if room_name in self._data_store and "user" in self._data_store[room_name]:
            users = self._data_store[room_name]["user"]
            if users:  # 유저 정보가 있는 경우
                first_user_key = next(iter(users))  # 첫 번째 유저의 키를 가져옵니다.
                if first_user_key in users:
                    users[first_user_key]["host"] = 1  # host를 1로 변경합니다.
                    # 변경된 정보 출력
                    print("First user's data after modification:", users[first_user_key])
                    return first_user_key
                else:
                    print("First user not found in the user dictionary.")
            else:
                print("No user data in the room.")
                return ""
        else:
            print("Room not found or no user data in the room.")
            return ""
        if callback:
            callback()  # 콜백 함수 호출
    def is_user_in_room(self, user_name, room_name):
        dictionaryData = self._data_store[room_name]['user']
        for key, value in dictionaryData.items():
            if 'username' in value and value['username'] == user_name:
                return True
        return False
    def game_status(self, room_name, booldata):
        self._data_store[room_name]['room_info']['room_status'] = booldata
    def game_init(self, room_name):
        dictionaryData = self._data_store[room_name]['user']
        for key, value in dictionaryData.items():
            value['score'] = 0

room_data_manager = RoomDataManger()
class MusicDataManager:
    def __init__(self):
        self._data_store = dict()

    def store_data(self, room_name, data):
        self._data_store[room_name] = {
            'data': data,
            'current_index': 0
        }
    def index_data(self, room_name):
        return self._data_store.get(room_name, {}).get('current_index', 0)
    
    def retrieve_data(self, room_name):
        index = self._data_store.get(room_name, {}).get('current_index', 0)
        return self._data_store.get(room_name, {}).get('data', [])[index]

    def retrieve_next_data(self, room_name):
        room_data = self._data_store.get(room_name, {})
        room_data['current_index'] += 1
        data = room_data.get('data', [])
        idx = room_data.get('current_index', 0)
        if idx < len(data):
            next_item = data[idx]
            return next_item
        return None

    def remove_data(self, room_name):
        if room_name in self._data_store:
            del self._data_store[room_name]
    
    def check_answer(self, room_name, answer):
        room_data = self._data_store.get(room_name, {})
        data = room_data.get('data', [])
        idx = room_data.get('current_index', 0)
        # Data is available
        if idx < len(data):
            next_item = data[idx]
            if answer in next_item['answer_list']:
                return True
        return False

music_data_manager = MusicDataManager()

def make_answer(mission_id, room_name):
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

    music_data_manager.store_data(room_name, result)
    return room_name


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