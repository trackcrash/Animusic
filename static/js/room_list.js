const roomNameElementIdPrefix = 'room-count-';

function fetchData(url, callback) {
    $.getJSON(url, callback);
}

function createRoomElement(room_name, room_status, user_count) {
    const roomContainer = document.createElement('div');
    roomContainer.id = `roomContainer_${room_name}`;
    roomContainer.classList.add('room-container', 'grid', 'grid-rows-1', 'gap-4', 'p-4', 'border', 'border-gray-300', 'rounded-lg', 'cursor-pointer', 'transition', 'duration-300', 'hover:bg-gray-100');

    const button = document.createElement('a');
    button.textContent = room_name;
    button.classList.add('room-button', 'px-4', 'py-2', 'bg-blue-500', 'text-white', 'rounded', 'hover:bg-blue-600', 'hover:text-white');
    button.dataset.room_name = room_name;

    const roomCountElement = document.createElement('span');
    roomCountElement.id = `${roomNameElementIdPrefix}${room_name}`;
    roomCountElement.classList.add('room-count', 'text-sm', 'text-gray-600');
    roomCountElement.textContent = user_count ? `${user_count}명` : "0명";

    const InnerDivContainer = document.createElement('div');
    InnerDivContainer.classList.add('grid', 'grid-rows-3', 'gap-4', 'p-4', 'border', 'border-gray-300', 'rounded-lg', 'cursor-pointer', 'transition', 'duration-300', 'hover:bg-gray-100');
    
    const roomStatusElement = document.createElement('span');
    roomStatusElement.classList.add('room-status', 'text-sm', 'text-gray-600');
    roomStatusElement.textContent = room_status ? "게임중" : "대기중";

    roomContainer.appendChild(button);
    InnerDivContainer.appendChild(roomCountElement);
    InnerDivContainer.appendChild(roomStatusElement); // 여기에 roomStatusElement 추가
    roomContainer.appendChild(InnerDivContainer);
    ContaineraddClickListener(roomContainer, room_name);
    return roomContainer;
}

function ContaineraddClickListener(roomContainer, room_name)
{
    roomContainer.addEventListener('click', () => {
        socket.emit('user_check',{"room_name":room_name});
        // joinChatRoom(button.dataset.room_name);
    });
}
function updateRoomCount(room_name, playerCount) {
    const roomCountElement = document.getElementById(`${roomNameElementIdPrefix}${room_name}`);
    if (roomCountElement) {
        roomCountElement.textContent = `${playerCount}명`;
    }
}

function create_room_button() {
    // 사용자 정보를 가져옵니다.
    fetchData("/get_user_info", (user_id) => {
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

function joinChatRoom(room_name, token) {
    // 새로운 XMLHttpRequest 객체 생성
    // const xhr = new XMLHttpRequest();

    // 요청을 열고 설정
    // xhr.open('GET', `/multi_game?room_name=${room_name}`, true);
    window.location = `/multi_game?room_name=${room_name}`;
    // 헤더에 토큰 추가
    // xhr.setRequestHeader('Authorization', 'Bearer ' + token);

    // 요청 보내기
    // xhr.send();
}

function firstCreateRoom() {
    fetchData("/get_user_info", (user_id) => {
        if (!user_id) {
            alert("로그인 후에 이용가능합니다.");
            location.href = "/login";
            return;
        }

        fetchData("/get-room-dict", (room_dict) => {
            const roomButtonsContainer = document.getElementById('room-buttons');
            for (let room_name in room_dict) {
                const roomInfo = room_dict[room_name]["room_info"];
                const roomStatus = roomInfo["room_status"];
                const user_info = room_dict[room_name]["user"];
                const user_count = Object.keys(user_info).length;
                // roomStatus를 이용하여 원하는 작업 수행
                roomButtonsContainer.appendChild(createRoomElement(room_name, roomStatus,user_count));
            }
        });
    });
}

function addRoomToList(room_name) {
    const roomButtonsContainer = document.getElementById('room-buttons');
    roomButtonsContainer.appendChild(createRoomElement(room_name,false));
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

window.onload = () => {
    socket.emit('Waiting',()=>{
        firstCreateRoom();
    }); // 클라이언트에서 서버로 데이터를 전송

}

socket.on('room_players_update', (data)=> {;
    updateRoomCount(data.room_name, data.player_count);
});

socket.on('room_update', (data) => {
    fetchData("/get_user_info", (user_id) => {
        if (!user_id) return;
        addRoomToList(data);
    });
});

socket.on('Do_not_create_duplicates', () => {
    alert("방을 중복생성 할 수 없습니다.");
});

socket.on('user_check_not_ok', () => {
    alert("입장 제한");
});

socket.on('room_removed', (data) =>
{
    console.log("삭제되었습니다.");
    removeRoomFromList(data);
});
socket.on('Join_room', (data)=>
{
    joinChatRoom(data);
})

socket.on('update_waiting_userlist', (data) => {
    let userlist = document.getElementById("userlist");
    userlist.innerText = "현재 대기실 인원 수: " + Object.keys(data).length + "명\n" + Object.keys(data).join('\n');
});

// 해당 방을 안보이게 처리함
socket.on('request_room_changed', (data) => {
    let playing = data["room_status"];
    if(playing)
    {
        document.getElementById('roomContainer_' + data["room_name"]).querySelector('.room-status').innerText = "게임중";
    }else
    {
        document.getElementById('roomContainer_' + data["room_name"]).querySelector('.room-status').innerText = "대기중";
    }
});
socket.on("room_full_user", (data) =>
{
    alert(data+"방의 인원이 가득 차있습니다.");
})