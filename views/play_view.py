from flask import render_template, jsonify

def play_view(data=None):
    return render_template('play.html', data=data)

def play_post_response(data):
    return jsonify(data)