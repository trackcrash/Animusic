function sendNotification()
{
    const contents=document.getElementById("notificationCt").value;
    socket.emit("notification",{"contents": contents})
    console.log(contents);
    document.getElementById("notificationCt").value="";
}
document.getElementById("sendnotification").querySelector("button").addEventListener('click', sendNotification);