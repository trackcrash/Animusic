const roomNameElementIdPrefix = 'room-count-';

function fetchData(url, callback) {
    $.getJSON(url, callback);
}

function createRoomElement(roomName) {
    const roomContainer = document.createElement('div');
    roomContainer.classList.add('room-container');

    const button = document.createElement('a');
    button.textContent = roomName;
    button.classList.add('room-button');
    button.dataset.roomName = roomName;

    const roomCountElement = document.createElement('span');
    roomCountElement.id = `${roomNameElementIdPrefix}${roomName}`;
    roomCountElement.classList.add('room-count');
    roomCountElement.textContent = "0명";

    roomContainer.appendChild(button);
    roomContainer.appendChild(roomCountElement);
    roomContainer.addEventListener('click', function() {
        joinChatRoom(button.dataset.roomName);
    });

    return roomContainer;
}

function updateRoomCount(roomName, playerCount) {
    const roomCountElement = document.getElementById(`${roomNameElementIdPrefix}${roomName}`);
    console.log(roomCountElement, roomName, playerCount);
    if (roomCountElement) {
        roomCountElement.textContent = `${playerCount}명`;
    }
}

function create_room_button() {
    // 사용자 정보를 가져옵니다.
    fetchData("/get_user_info", function(user_id) {
        if (user_id) { // 사용자가 로그인된 경우
            const room_name = prompt("방 이름을 입력하세요:");
            if (room_name && room_name.trim() !== '') {
                console.log(room_name);
                socket.emit('create_room', { room_name: room_name },()=>
                {
                    joinChatRoom(room_name);
                });
                // 방 이름이 제대로 입력된 경우 방 생성 및 해당 방으로 리다이렉트
            } else if (room_name !== null) { // 취소 버튼을 클릭하지 않은 경우
                alert("올바른 방 이름을 입력해주세요.");
            }
        } else { // 사용자가 로그인되지 않은 경우
            alert("로그인 후 이용해주세요");
        }
    });
}

function joinChatRoom(roomName) {
    location.href = `/multi_game?room_name=${roomName}`;
}







function firstCreateRoom() {
    fetchData("/get_user_info", function(user_id) {
        if (!user_id) {
            alert("로그인 후에 이용가능합니다.");
            location.href = "/";
            return;
        }

        fetchData("/get-room-dict", function(room_dict) {
            const roomButtonsContainer = document.getElementById('room-buttons');
            for (let roomId in room_dict) {
                const roomData = room_dict[roomId];
                const roomName = roomData.room_name;
                console.log(roomName)
                roomButtonsContainer.appendChild(createRoomElement(roomName));
                socket.emit('request_room_players_update', { room_name: roomName });
            }
        });
    });
}

function addRoomToList(room_name) {
    const roomButtonsContainer = document.getElementById('room-buttons');
    roomButtonsContainer.appendChild(createRoomElement(room_name));
}

function removeRoomFromList(roomName) {
    const roomButtonsContainer = document.getElementById('room-buttons');
    const roomButtons = roomButtonsContainer.getElementsByClassName('room-container');

    for (let room of roomButtons) {
        const button = room.getElementsByTagName('a')[0];
        if (button.textContent === roomName) {
            roomButtonsContainer.removeChild(room);
            break;
        }
    }
}

window.onload = function() {
    firstCreateRoom();
}

socket.on('room_players_update', function(data) {;
    updateRoomCount(data.room[room_name], data.player_count[data.room.room_name].length);
});

socket.on('room_update', function(data) {
    fetchData("/get_user_info", function(user_id) {
        if (!user_id) return;
        addRoomToList(data.room_name);
    });
});

socket.on('Do_not_create_duplicates', function() {
    alert("방을 중복생성 할 수 없습니다.");
});

socket.on('room_removed', removeRoomFromList);