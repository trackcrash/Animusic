#flask main --author: NewKyaru 11/08/2023
from flask import Flask, render_template, request,flash, redirect, url_for, jsonify
from controllers import play_controller
app = Flask(__name__)
client = app.test_client()

@app.route('/')
def index():
    return render_template('/index.html')

@app.route('/play', methods=['GET', 'POST'])
def play():
    return play_controller.play_controller()

@app.route('/submit-to-db', methods=['POST'])
def submit():
    return play_controller.submit_to_db()

@app.route('/Show')
def show():
    return play_controller.show_table()

if __name__ == '__main__':
    app.run(debug=True)
