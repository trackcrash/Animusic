from flask import Blueprint, render_template, request, jsonify,redirect
from flask_login import current_user
from controllers.donate_controller import donation
donate_bp = Blueprint('donate', __name__, url_prefix='')

@donate_bp.get('/donate')
def donate_page():
    return render_template('donate.html')
    
@donate_bp.route('/api/donate', methods=['POST'])
def donate_api():
    #received_signature = request.headers.get('X-Signature')
    # request_body = request.data

    # if not verify_signature(request_body, received_signature):
    #     return jsonify({"message": "Invalid signature"}), 400
    # inner_data = data.get('data', {})
    # amount = float(inner_data.get('amount', 0))
    data = request.json
    amount = float(data.get('amount'))
    name = data.get('name')
    donation_result = donation(amount, name)

    if donation_result:
        response_data = {'message': '후원이 성공적으로 처리되었습니다.'}
        return jsonify(response_data), 200
    else:
        response_data = {'message': '후원 처리 중 오류가 발생했습니다.'}
        return jsonify(response_data), 500

