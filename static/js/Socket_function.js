const socket = io.connect('http://' + document.domain + ':' + location.port+"/");

window.onload = function() 
{
    socket.on('connect', () => {
        console.log('Connected to server');
    });
}