const roomNameElementIdPrefix = 'room-count-';
const roomNameElementMissionPrefix = 'room-Mission-'

function fetchData(url, callback) {
    $.getJSON(url, callback);
}

function createRoomElement(room_key, room_name, room_status, user_count, mission, max_user, isPassword) {
    const roomContainer = document.createElement('div');
    roomContainer.id = `roomContainer_${room_key}`;
    roomContainer.classList.add('room-container', 'p-6', 'bg-black', 'text-white', 'shadow-md', 'rounded-xl', 'transition', 'duration-300', 'hover:shadow-xl', 'cursor-pointer', 'space-y-4');

    const titleContainer = document.createElement('div');
    titleContainer.classList.add('flex', 'justify-between', 'items-center');

    const button = document.createElement('a');
    button.textContent = `${room_key} ${room_name}`;
    button.classList.add('room-button', 'text-2xl', 'font-semibold', 'text-green-500', 'hover:text-green-600');
    button.dataset.room_key = room_key;

    const roomPrivateElement = document.createElement('span');
    roomPrivateElement.id = `room-private-${room_key}`;
    roomPrivateElement.classList.add('text-xs', 'text-white', 'px-3', 'py-1', 'rounded-full');
    roomPrivateElement.style.backgroundColor = isPassword ? "#E1306C" : "#1ED760"; // 빨간색은 private, 초록색은 public
    roomPrivateElement.textContent = isPassword ? "Private" : "Public";

    titleContainer.appendChild(button);
    titleContainer.appendChild(roomPrivateElement);

    const detailsContainer = document.createElement('div');
    detailsContainer.classList.add('room-details', 'space-y-2');

    const roomCountElement = document.createElement('span');
    roomCountElement.id = `${roomNameElementIdPrefix}${room_key}`;
    roomCountElement.classList.add('block', 'text-sm', 'font-medium');
    let user = user_count ? user_count + "명" : "0명";
    roomCountElement.textContent = `👥 ${user} / ${max_user}명`;
    if(user == "0명")
    {
        roomContainer.style.display = "none"; 
    }
    const roomMissionElement = document.createElement('span');
    roomMissionElement.id = `${roomNameElementMissionPrefix}1-${room_key}`;
    roomMissionElement.classList.add('block', 'text-sm', 'font-medium');
    roomMissionElement.textContent = `🗺️ ${mission ? mission[0]['MapName'] : "미설정"}`;

    const thumbnailContainer = document.createElement('div');
    thumbnailContainer.classList.add('flex', 'justify-center', 'items-center', 'bg-gray-800', 'rounded-lg', 'overflow-hidden', 'mb-4');
    thumbnailContainer.id = `thumbnail_${room_key}`;

    if (mission && mission[0]['Thumbnail']) {
        const thumbnail = document.createElement('img');
        thumbnail.src = mission[0]['Thumbnail'];
        thumbnail.alt = 'Mission Thumbnail';
        thumbnail.classList.add('w-full', 'h-48', 'object-cover', 'shadow-md', 'transition', 'duration-300', 'hover:shadow-lg');
        thumbnailContainer.appendChild(thumbnail);
    } else {
        const placeholderText = document.createElement('p');
        placeholderText.textContent = '맵 선택 중';
        placeholderText.classList.add('text-lg', 'font-semibold', 'text-gray-400');
        thumbnailContainer.appendChild(placeholderText);
    }

    const MissionProducerElement = document.createElement('span');
    MissionProducerElement.id = `${roomNameElementMissionPrefix}2-${room_key}`;
    MissionProducerElement.classList.add('block', 'text-sm', 'font-medium');
    MissionProducerElement.textContent = `👤 ${mission ? mission[0]['MapProducer'] : "미설정"}`;

    const roomStatusElement = document.createElement('span');
    roomStatusElement.id = `room_status_${room_key}`
    roomStatusElement.classList.add('block', 'text-sm', 'font-semibold', 'text-gray-700');
    roomStatusElement.textContent = room_status ? "🟢 게임중" : "🔴 대기중";

    detailsContainer.appendChild(roomCountElement);
    detailsContainer.appendChild(roomMissionElement);
    detailsContainer.appendChild(MissionProducerElement);
    detailsContainer.appendChild(roomStatusElement);

    roomContainer.appendChild(titleContainer);
    roomContainer.appendChild(thumbnailContainer);
    roomContainer.appendChild(detailsContainer);

    ContaineraddClickListener(roomContainer, room_key);

    return roomContainer;
}


function ContaineraddClickListener(roomContainer, room_key) {
    roomContainer.addEventListener('click', () => {
        socket.emit('user_check', { "room_key": room_key });
        // joinChatRoom(button.dataset.room_name);
    });
}

function updateRoomCount(room_key, playerCount) {
    const roomCountElement = document.getElementById(`${roomNameElementIdPrefix}${room_key}`);
    const roomContainer = document.getElementById(`roomContainer_${room_key}`);
    let player = playerCount ? playerCount + "명" : "0명"
    if (roomCountElement) {
        const textContents = roomCountElement.textContent.split('/');
        roomCountElement.textContent = `👥 ${player} / ${textContents[1]}`;
    }
    if(player == "0명")
    {
        roomContainer.style.display = "none";
    }
    else
    {
        roomContainer.style.display = "block";
    }
}

function create_room_button() {
    // 사용자 정보를 가져옵니다.
    $('#CreateRoomModal').removeClass('hidden');
}

function joinChatRoom(room_key, token) {
    // 새로운 XMLHttpRequest 객체 생성
    // const xhr = new XMLHttpRequest();

    // 요청을 열고 설정
    // xhr.open('GET', `/multi_game?room_name=${room_name}`, true);
    window.location = `/multi_game?room_key=${room_key}`;
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
            for (let room_key in room_dict) {
                const roomInfo = room_dict[room_key]["room_info"];
                const room_name = roomInfo["room_name"];
                const roomStatus = roomInfo["room_status"];
                const user_info = room_dict[room_key]["user"];
                const Mission = roomInfo["room_mission"];
                const user_count = Object.keys(user_info).length;
                const max_user = roomInfo["room_full_user"];
                const isPassword = roomInfo["room_password"];
                console.log(isPassword);
                // roomStatus를 이용하여 원하는 작업 수행
                roomButtonsContainer.appendChild(createRoomElement(room_key, room_name, roomStatus, user_count, Mission, max_user, isPassword));
            }
        });
    });
}

function addRoomToList(room_key, room_name, max_user, isPassword) {
    const roomButtonsContainer = document.getElementById('room-buttons');
    roomButtonsContainer.appendChild(createRoomElement(room_key, room_name, false, false, false, max_user, isPassword));
}

function removeRoomFromList(room_key) {
    const roomButtonsContainer = document.getElementById('room-buttons');
    const roomButtons = roomButtonsContainer.getElementsByClassName('room-container');

    for (let room of roomButtons) {
        const button = room.getElementsByTagName('a')[0];
        if (button.dataset.room_key === room_key) {
            roomButtonsContainer.removeChild(room);
            break;
        }
    }
}

window.onload = () => {
    socket.emit('Waiting', () => {
        firstCreateRoom();
    }); // 클라이언트에서 서버로 데이터를 전송
}

socket.on('room_players_update', (data) => {;
    updateRoomCount(data.room_key, data.player_count);
});

socket.on('room_update', (data) => {
    fetchData("/get_user_info", (user_id) => {
        if (!user_id) return;
        const room_key = data["room_key"];
        const room_name = data["room_name"];
        const max_user = data["max_user"];
        const isPassword = data["is_password"];
        addRoomToList(room_key, room_name, max_user, isPassword);
    });
});

socket.on('Do_not_create_duplicates', () => {
    alert("같은 이름의 방을 만들수 없습니다.");
});

socket.on('user_check_not_ok', () => {
    alert("입장 제한");
});

socket.on('room_removed', (data) => {
    console.log(data);
    removeRoomFromList(data);
});
socket.on('Join_room', (data) => {
    joinChatRoom(data);
})

socket.on('update_waiting_userlist', (data) => {
    console.log(data);
    let userlist = document.getElementById("userlist");
    userlist.innerText = "현재 대기실 인원 수: " + Object.keys(data).length + "명\n" + Object.keys(data).join('\n');
});

socket.on('request_room_changed', (data) => {
    let playing = data["room_status"];
    if (playing) {
        document.getElementById(`room_status_${data['room_key']}`).innerText = "🟢 게임중";
    } else {
        document.getElementById(`room_status_${data['room_key']}`).innerText = "🔴 대기중";
    }
});
socket.on("room_full_user", (data) => {
    alert(data + "방의 인원이 가득 차있습니다.");
})
socket.on("MissionSelect_get", (data) => {
    const room_key = data["room_key"];
    const mission = data['map_data'];
    updateMission(room_key, mission);
})

function updateMission(room_key, mission) {
    console.log(room_key);
    const roomMissionName = document.getElementById(`${roomNameElementMissionPrefix}1-${room_key}`);
    const roomMissionProducer = document.getElementById(`${roomNameElementMissionPrefix}2-${room_key}`);
    const thumbnailContainer = document.getElementById(`thumbnail_${room_key}`);
    thumbnailContainer.innerHTML = "";
    if (mission && mission[0]['Thumbnail']) {
        const thumbnail = document.createElement('img');
        thumbnail.src = mission[0]['Thumbnail'];
        thumbnail.alt = 'Mission Thumbnail';
        thumbnail.classList.add('w-full', 'h-48', 'object-cover', 'shadow-md', 'transition', 'duration-300', 'hover:shadow-lg');
        thumbnailContainer.appendChild(thumbnail);
    } else {
        const placeholderText = document.createElement('p');
        placeholderText.textContent = '맵 선택 중';
        thumbnailContainer.appendChild(placeholderText);
    }

    roomMissionName.innerText = `🗺️ ${mission ? mission[0]['MapName'] : "미설정"}`;
    roomMissionProducer.innerText = `👤 ${mission ? mission[0]['MapProducer'] : "미설정"}`;
}


socket.on("passwordCheck", (data) => {
    let password = prompt("비밀번호를 입력해주세요")
    if (password != null && password != "") {
        console.log(password);
        socket.emit("passwordCheckToServer", { "room_key": data, "password": password })
    } else {
        alert("비밀번호를 입력해주세요");
    }
})
socket.on("passwordFail", () => {
    alert("비밀번호가 틀렸습니다.");
})

$('#CreateRoomModalCloseBtn').click(function() {
    console.log("클릭");
    $('#CreateRoomModal').addClass('hidden');
});
$('#CreateRoomBtn').click(function() {
    $('#CreateRoomModal').addClass('hidden');
    fetchData("/get_user_info", (user_id) => {
        if (user_id) { // 사용자가 로그인된 경우
            const room_name = $("#room_title").val();
            const room_password = $("#room_password").val();
            const room_max_human = $("#room_max_human").val();

            if (room_name && room_name.trim() !== '') {
                socket.emit('room_check', { room_name: room_name, room_password: room_password, room_max_human: room_max_human });
                // 방 이름이 제대로 입력된 경우 방 생성 및 해당 방으로 리다이렉트
            } else if (room_name !== null) { // 취소 버튼을 클릭하지 않은 경우
                alert("올바른 방 이름을 입력해주세요.");
            }
        } else { // 사용자가 로그인되지 않은 경우
            alert("로그인 후 이용해주세요");
            location.href = "/login";
        }
    });
});
socket.on("room_data_update", (data) => {
    const room_key = data["room_key"];
    const room_name = data["room_name"];
    const room_private = data["room_private"];
    const room_max_human = data["room_max_human"];
    const roomCountElement = document.getElementById(`${roomNameElementIdPrefix}${room_key}`);
    if (roomCountElement) {
        const textContents = roomCountElement.textContent.split('/');
        roomCountElement.textContent = `${textContents[0]} / ${room_max_human}명`;
    }
    document.getElementById(`roomContainer_${room_key}`).getElementsByTagName('a')[0].innerText = `${room_key} ${room_name}`;
    document.getElementById(`room-private-${room_key}`).innerText = room_private ? "private" : "public";
    document.getElementById(`room-private-${room_key}`).style.backgroundColor = room_private ? "#F87171" : "#34D399";
});