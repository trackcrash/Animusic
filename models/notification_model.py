class Notification():
    notificationContents = ""
    def __init__(self):
        self.notificationContents = "" 
    def notification_change(self, contents):
        self.notificationContents = contents
    def get_notification(self):
        return self.notificationContents
    

notification = Notification()