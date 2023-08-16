// 페이지가 처음 로드될 때 서버에 있는 채팅방 목록 정보들을 받아서 생성하는 함수
function get_room_dict(callback) {
    $.getJSON("/get-room-dict", function(data) {
        callback(data); // 호출자에게 데이터를 전달
    });
}

function get_user_info(callback)
{
    $.getJSON("/get_user_info", function(data)
    {
        callback(data);
    })
}
function first_create_room() {
    get_user_info(function(user_id)
    {
        if (user_id == "")
        {
            alert("로그인 후에 이용가능합니다.");
            location.href = "/";
            return;
        }
        get_room_dict(function(room_dict){
            for (let roomName in room_dict) {
                let button = document.createElement('button');
                button.textContent = roomName; // 버튼 이름을 방 이름으로 설정
                let roomButtonsContainer = document.getElementById('room-buttons');
                roomButtonsContainer.appendChild(button); //버튼을 컨테이너에 추가
                button.addEventListener('click', function() {
                    joinChatRoom(this.textContent); // 버튼을 누르면 joinChatRoom 함수가 실행되게 설정
                });
            }
        });
    })
}

// 채팅방 버튼을 누를 경우 방 참여를 요청하고 multi_game.html로 페이지 이동
function joinChatRoom(roomName) {
    socket.emit('join', { room: roomName }); // 서버로 join 요청, 이때 방 번호 데이터를 송신
    window.location.href = '/multi_game'; // multi_game.html로 이동
}

// 이용자가 방 생성 버튼을 눌렀을 때
function create_room_button() {
    get_user_info(function(user_id)
    {
        console.log(user_id);
        if (user_id != "") {
            socket.emit('create_room', { room_name: user_id });
        }
    })
}

// multi_game.html 페이지로 이동
function move_multi_game() {
    window.location.href = '/multi_game';
}
// 페이지 로드 시 해당함수 실행
window.onload = function() {
    first_create_room();
}

let socket = io.connect('http://' + document.domain + ':' + location.port);

socket.on('move_multi_game', move_multi_game);

// 특정 이용자가 방을 생성했을 때 그 정보를 추가하여 채팅방 버튼 추가 생성
socket.on('room_update', function(room_name) {
    // 서버로 create_room 실행 + room_name: user_id 라는 데이터 송신
    get_user_info(function(user_id)
    {
        if (user_id != "") {
            return;
        }
    })
    
    let button = document.createElement('button');

    button.textContent = room_name;
    button.addEventListener('click', function() {
        socket.emit('join', { room: room_name });
        window.location.href = 'multi_game';
    });

    roomButtonsContainer.appendChild(button);
});

// 이용자가 방을 중복으로 생성하려 할때
socket.on('Do_not_create_duplicates', function() {
    alert("방을 중복생성 할 수 없습니다.");
});


// room_dict
// user_id