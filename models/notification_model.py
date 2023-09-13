from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from db.database import Base, create_session,close_session
class Notification():
    notificationContents = ""
    def __init__(self):
        self.notificationContents = "" 
    def notification_change(self, contents):
        self.notificationContents = contents
    def get_notification(self):
        return self.notificationContents

class Report(Base):
    __tablename__ = 'ReportTable'
    id = Column(Integer, primary_key=True)
    reporter_id = Column(Integer, ForeignKey('UserTable.id', ondelete='CASCADE'), nullable=False)
    mission_id = Column(Integer, ForeignKey('MissionTable.id', ondelete='CASCADE'), nullable=False)
    reason = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)

class Notifications(Base):
    __tablename__ = 'NotificationTable'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('UserTable.id', ondelete='CASCADE'), nullable=False)
    report_id = Column(Integer, ForeignKey('ReportTable.id', ondelete='CASCADE'), nullable=True)
    content = Column(String(500), nullable=False)
    is_read = Column(Boolean, default=False)


notification = Notification()