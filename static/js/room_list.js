const roomNameElementIdPrefix = 'room-count-';

function fetchData(url, callback) {
    $.getJSON(url, callback);
}

function createRoomElement(room_name) {
    const roomContainer = document.createElement('div');
    roomContainer.classList.add('room-container', 'grid', 'grid-rows-1', 'gap-4', 'p-4', 'border', 'border-gray-300', 'rounded-lg', 'cursor-pointer', 'transition', 'duration-300', 'hover:bg-gray-100');

    const button = document.createElement('a');
    button.textContent = room_name;
    button.classList.add('room-button', 'px-4', 'py-2', 'bg-blue-500', 'text-white', 'rounded', 'hover:bg-blue-600', 'hover:text-white');
    button.dataset.room_name = room_name;

    const roomCountElement = document.createElement('span');
    roomCountElement.id = `${roomNameElementIdPrefix}${room_name}`;
    roomCountElement.classList.add('room-count', 'text-sm', 'text-gray-600');
    roomCountElement.textContent = "0명";

    const InnerDivContainer = document.createElement('div');
    InnerDivContainer.classList.add('grid', 'grid-rows-2', 'gap-4', 'p-4', 'border', 'border-gray-300', 'rounded-lg', 'cursor-pointer', 'transition', 'duration-300', 'hover:bg-gray-100')
    roomContainer.appendChild(button);
    InnerDivContainer.appendChild(roomCountElement)
    roomContainer.appendChild(InnerDivContainer);
    roomContainer.addEventListener('click', function() {
        socket.emit('user_check',{"room_name":room_name});
        // joinChatRoom(button.dataset.room_name);
    });

    return roomContainer;
}

function updateRoomCount(room_name, playerCount) {
    const roomCountElement = document.getElementById(`${roomNameElementIdPrefix}${room_name}`);
    console.log(roomCountElement, room_name, playerCount);
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
                socket.emit('room_check', {room_name: room_name});
                // 방 이름이 제대로 입력된 경우 방 생성 및 해당 방으로 리다이렉트
            } else if (room_name !== null) { // 취소 버튼을 클릭하지 않은 경우
                alert("올바른 방 이름을 입력해주세요.");
            }
        } else { // 사용자가 로그인되지 않은 경우
            alert("로그인 후 이용해주세요");
        }
    });
}

function joinChatRoom(room_name) {
    location.href = `/multi_game?room_name=${room_name}`;
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
            for (let room_name in room_dict) {
                console.log(room_name)
                roomButtonsContainer.appendChild(createRoomElement(room_name));
                socket.emit('request_room_players_update', { room_name: room_name });
            }
        });
    });
}

function addRoomToList(room_name) {
    const roomButtonsContainer = document.getElementById('room-buttons');
    roomButtonsContainer.appendChild(createRoomElement(room_name));
}

function removeRoomFromList(room_name) {
    const roomButtonsContainer = document.getElementById('room-buttons');
    const roomButtons = roomButtonsContainer.getElementsByClassName('room-container');

    for (let room of roomButtons) {
        const button = room.getElementsByTagName('a')[0];
        if (button.textContent === room_name) {
            roomButtonsContainer.removeChild(room);
            break;
        }
    }
}

window.onload = function() {
    firstCreateRoom();
}

socket.on('room_players_update', function(data) {;
    console.log(data);
    updateRoomCount(data.room_name, data.player_count);
});

socket.on('room_update', function(data) {
    fetchData("/get_user_info", function(user_id) {
        if (!user_id) return;
        console.log(data);
        addRoomToList(data);
    });
});

socket.on('Do_not_create_duplicates', function() {
    alert("방을 중복생성 할 수 없습니다.");
});

socket.on('user_check_not_ok', function() {
    alert("입장 제한");
});

socket.on('room_removed', (data)=>
{
    removeRoomFromList(data);
});
socket.on('Join_room', (data)=>
{
    console.log(data);
    joinChatRoom(data);
})