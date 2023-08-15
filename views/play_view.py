from flask import jsonify, render_template


def play_view(data=None):
    return render_template('play.html', data=data)


def play_post_response(data):
    return jsonify(data)
