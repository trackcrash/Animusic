from flask import request, jsonify
from models import data_model
from views import play_view

def play_controller():
    if request.method == 'POST':
        title = request.form.get('title')
        song = request.form.get('song')
        youtube_url = request.form.get('youtube_url')
        # Save data to DB
        data_model.save_data(title, song, youtube_url)
        
        return play_view.play_post_response({"title": title, "song": song, "youtube_url": youtube_url})
    
    data = data_model.get_data()
    return play_view.play_view(data)

def submit_to_db():
    data = request.json
    data_model.save_to_db(data)
    return jsonify({"message": "Data received and processed!"})