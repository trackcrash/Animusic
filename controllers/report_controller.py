from db.database import create_session, close_session
from models.notification_model import Report, Notifications
from controllers.map_controller import get_mission_by_id
def create_report_and_notify(reporter_id, mission_id, reason, description):
    engine, session = create_session()
    try:
        report = Report(reporter_id=reporter_id, mission_id=mission_id, reason=reason, description=description)
        session.add(report)
        session.flush()
        mission = get_mission_by_id(mission_id)
        if not mission:
            return False
        
        notification_content = f"당신의 맵'{mission.MapName}'이 신고되었습니다."
        notification = Notifications(user_id=mission.MapProducer_id, content=notification_content,report_id=report.id)
        session.add(notification)
        session.commit()
        return True
    except Exception as e:
        print(f"An error occurred while creating report: {str(e)}")
        return False
    finally:
        close_session(engine, session)

def get_report_dtos_by_user_id(user_id):
    engine, session = create_session()
    report_dtos = []
    try:
        # 해당 유저에게 전송된 알림 모두 불러옴
        notifications = session.query(Notifications).filter(Notifications.user_id == user_id).all()      
        for notification in notifications:
            # 각 알림과 연관된 신고 정보 불러옴
            report = session.query(Report).filter(Report.mission_id == notification.mission_id).first()
            if report:
                report_dto = ReportDTO(
                    notification_content=notification.content,
                    report_reason=report.reason,
                    report_description=report.description,
                    is_read=notification.is_read
                )
                report_dtos.append(report_dto)
        return report_dtos

    except Exception as e:
        print(f"An error occurred while getting DTOs: {str(e)}")
        return []
    finally:
        close_session(engine, session)

def mark_report_as_read(report_id):
    engine, session = create_session()
    try:
        notification = session.query(Notifications).filter(Notifications.report_id == report_id).first()
        notification.is_read = True
        session.commit()
        return True
    except Exception as e:
        print(f"An error occurred while marking report as read: {str(e)}")
        return False
    finally:
        close_session(engine, session)

class ReportDTO:
    def __init__(self, notification_content, report_reason, report_description, is_read):
        self.notification_content = notification_content
        self.report_reason = report_reason
        self.report_description = report_description
        self.is_read = is_read

    def to_dict(self):
        return {
            'notification_content': self.notification_content,
            'report_reason': self.report_reason,
            'report_description': self.report_description,
            'is_read': self.is_read
        }