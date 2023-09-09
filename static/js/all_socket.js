socket.on("all_notification",(data)=>
{
  document.getElementById("all_user_notification").innerText = data["contents"];  
})