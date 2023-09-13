from controllers.report_controller import get_report_dtos_by_user_id, create_report_and_notify
from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
report_bp = Blueprint('report', __name__, url_prefix='')

@report_bp.route('/report', methods=['GET'])
@login_required
def view_reports():
    user_id = current_user.id
    reports = get_report_dtos_by_user_id(user_id)
    print(reports)
    return render_template('report/report.html', reports=reports)

@report_bp.route('/create-report', methods=['POST'])
@login_required
def create_report():
    mission_id = request.json.get('mission_id')
    reason = request.json.get('reason')
    description = request.json.get('description')

    reporter_id = current_user.id
    success = create_report_and_notify(reporter_id, mission_id, reason, description)
    if success:
        return jsonify({"status": "success", "message": "Report and notification sent successfully."}), 200
    else:
        return jsonify({"status": "error", "message": "Failed to create report and send notification."}), 500

@report_bp.route('/api/notification', methods=['GET'])
@login_required
def fetch_notifications():
    user_id = current_user.id
    reports = get_report_dtos_by_user_id(user_id)
    unread_reports = [report for report in reports if report.is_read == False]
    notifications = [{"content": report.notification_content} for report in unread_reports]
    return jsonify(notifications)
        