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

let socket = io.connect('http://' + document.domain + ':' + location.port);

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
                let roomContainer = document.createElement('div'); // 방을 묶을 div 요소 생성
                roomContainer.classList.add('room-container'); // CSS 스타일을 적용하기 위한 클래스 추가

                let button = document.createElement('a');
                button.textContent = roomName; // 버튼 이름을 방 이름으로 설정
                button.classList.add('room-button'); // CSS 스타일을 적용하기 위한 클래스 추가


                let roomCountElement = document.createElement('span');
                roomCountElement.id = `room-count-${roomName}`;
                roomCountElement.classList.add('room-count'); // CSS 스타일을 적용하기 위한 클래스 추가

                let roomButtonsContainer = document.getElementById('room-buttons');
                
                roomContainer.appendChild(button); // 버튼을 방 컨테이너에 추가
                roomCountElement.textContent = "0명";

                roomContainer.appendChild(roomCountElement); // 인원 수 요소를 방 컨테이너에 추가
                roomButtonsContainer.appendChild(roomContainer); // 방 컨테이너를 버튼 컨테이너에 추가                
                socket.emit('request_room_players_update', { room_name: roomName }); // 방 인원수 업데이트 요청

                roomContainer.addEventListener('click', function() {
                    joinChatRoom(this.textContent); // 버튼을 누르면 joinChatRoom 함수가 실행되게 설정
                });
            }
        });
    })
}

socket.on('room_players_update', function(data) {
    const roomName = data.room_name;
    const playerCount = data.player_count;

    // 해당 방의 인원 수를 업데이트하는 로직
    const roomCountElement = document.getElementById(`room-count-${roomName}`);
    console.log(roomCountElement, playerCount, roomName)
    if (roomCountElement) {
        roomCountElement.textContent = `${playerCount}명`;
    }
});
// 채팅방 버튼을 누를 경우 방 참여를 요청하고 multi_game.html로 페이지 이동
function joinChatRoom(roomName) {
    socket.emit('join', { room: roomName }); // 서버로 join 요청, 이때 방 번호 데이터를 송신
    socket.emit('request_room_players_update', { room_name: roomName }); // 방 인원수 업데이트 요청
    window.location.href = '/multi_game'; // multi_game.html로 이동
}

// 이용자가 방 생성 버튼을 눌렀을 때
function create_room_button() {
    get_user_info(function(user_id)
    {
        if (user_id != ""&& user_id != null) {
            const room_name = prompt("room_name");
            sessionStorage.setItem('room_name', room_name);
            location.href=`/multi_game?${room_name}`
        }else
        {
            alert("로그인 후 이용해주세요")  
        }
    })
}

// 페이지 로드 시 해당함수 실행
window.onload = function() {
    first_create_room();
}


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

socket.on('room_removed', function(roomName) {
    // 방이 삭제되었을 때의 처리를 여기에 작성
    console.log(`Room "${roomName}" has been removed.`);
    
    // 예를 들어, 해당 방 버튼을 삭제하거나 UI를 업데이트할 수 있습니다.
    const roomButtonsContainer = document.getElementById('room-buttons');
    const roomButtons = roomButtonsContainer.getElementsByClassName('room-container');
    
    for (let i = 0; i < roomButtons.length; i++) {
        const button = roomButtons[i].getElementsByTagName('a')[0];
        if (button.textContent === roomName) {
            roomButtonsContainer.removeChild(roomButtons[i]);
            break; // 해당 방을 찾았으면 루프 종료
        }
    }

});

// room_dict
// user_id