import random
from controllers.play_controller import show_table_bymissionid
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
        music_data = {
            'hint': item['hint'],
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

def is_user_in_room(user_name, room_name, room_dict):
    dictionaryData = room_dict[room_name]['user']
    for key, value in dictionaryData.items():
        if 'username' in value and value['username'] == user_name:
            return True
    return False