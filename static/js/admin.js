function sendNotification()
{
    const contents=document.getElementById("notificationCt").value;
    socket.emit("notification",{"contents": contents})
    console.log(contents);
    document.getElementById("notificationCt").value="";
}
document.getElementById("sendnotification").querySelector("button").addEventListener('click', sendNotification);
$.get('/api/socket_number')
.done((data)=>
{
    document.getElementById('socket_number').textContent = data;
})
.fail(error =>
{
    console.log(error)
});
socket.on("socket_connected_user", (data)=>
{
    console.log(data);
    document.getElementById('socket_number').textContent = data;
})