from flask import Blueprint, render_template, request, jsonify,redirect
from flask_login import current_user
from controllers.donate_controller import donation
donate_bp = Blueprint('donate', __name__, url_prefix='')

@donate_bp.get('/donate')
def donate_page():
    if current_user.is_authenticated and current_user.level == -1: 
        return render_template('donate.html')
    else:
        return redirect('/')
@donate_bp.route('/api/donate', methods=['POST'])
def donate_api():
    data = request.json
    amount = float(data.get('amount'))
    # donation 함수를 호출하여 후원 금액을 처리합니다.
    donation_result = donation(amount)
    
    if donation_result:
        response_data = {'message': '후원이 성공적으로 처리되었습니다.'}
        return jsonify(response_data), 200
    else:
        response_data = {'message': '후원 처리 중 오류가 발생했습니다.'}
        return jsonify(response_data), 500
