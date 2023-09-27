from flask import Blueprint, render_template, request, jsonify
from models.user_model import insert_character_number,update_profile_background
from flask_login import current_user
from models.notification_model import notification
from PIL import Image
import os

char_bp = Blueprint('char', __name__, url_prefix='')

# 이미지 업로드 경로 설정
UPLOAD_FOLDER = "static/img/profile_background/"

@char_bp.route('/select_character')
def select_character():
    return render_template('account_management/selectCharacter.html', current_user=current_user, notification=notification.get_notification())

@char_bp.route('/insert_character', methods=['POST'])
def insert_character():
    character_number = request.get_json().get('character_number')
    return insert_character_number(character_number)

@char_bp.route('/profile_background')
def profile_background():
    return render_template('account_management/profile_background.html')

@char_bp.route('/api/get_files')
def get_files():
    folder_path = os.path.join(UPLOAD_FOLDER, str(current_user.id))
    try:
        files = os.listdir(folder_path)
        return jsonify({'files': files, 'current_user': current_user.id})
    except Exception as e:
        return jsonify({'error': str(e)})

# 프로필 백그라운드 업로드 API

@char_bp.route("/api/upload_profile_background", methods=["POST"])
def upload_profile_background():
    if "file" not in request.files:
        return jsonify({"success": False, "message": "No file part"})
    
    file = request.files["file"]
    
    if file.filename == "":
        return jsonify({"success": False, "message": "No selected file"})
    
    if file:
        # 파일을 업로드 경로에 저장
        user_folder = os.path.join(UPLOAD_FOLDER, str(current_user.id))
        if not os.path.exists(user_folder):
            os.makedirs(user_folder)
        
        filename = os.path.join(user_folder, file.filename)
        
        # 이미지 사이즈 변경
        image = Image.open(file)
        
        width_ratio = (320 / float(image.size[0]))
        height_size = int((float(image.size[1]) * float(width_ratio)))
        
        resized_image = image.resize((320, height_size), Image.ANTIALIAS)

         # Get the original extension of the file
        _, ext = os.path.splitext(file.filename)

         # Save the image with its original format
        resized_image.save(filename, format=ext.strip('.'))

        update_profile_background(current_user.id, filename)
       
        # 파일 업로드 성공 응답
        return jsonify({"success": True, "filename": filename})

    return jsonify({"success": False, "message": "File upload failed"})
@char_bp.route("/api/update_profile_background", methods=["POST"])
def update_profile_background_endpoint():
    data = request.get_json()
    filename = data.get("filename")

    if filename:
        update_profile_background(current_user.id, filename)
        return jsonify({"success": True})
    else:
        return jsonify({"success": False, "message": "Invalid request"})
# 프로필 백그라운드 제거 API
@char_bp.route("/api/remove_profile_background", methods=["POST"])
def remove_profile_background():
    data = request.get_json()
    filename = data.get("filename")

    if filename:
        filepath = os.path.join(UPLOAD_FOLDER, str(current_user.id), filename)

        if os.path.exists(filepath):
            os.remove(filepath)
            # 데이터베이스 업데이트 코드를 추가하세요 (예: 파일 이름을 데이터베이스에서 삭제)

            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "message": "File not found"})

    return jsonify({"success": False, "message": "Invalid request"})