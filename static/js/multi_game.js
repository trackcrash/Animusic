//multi game js --author: NewKyaru 15/08/2023
let totalPlayers = 0;
let skipvote = 0;
let currentvideolink = "";
let selectedId = 0;
let player_name = document.getElementById('User_Name').innerText;


// DOM Elements
const elements = {
    messages: document.getElementById('messages'),
    inputMessage: document.getElementById('inputMessage'),
    videoOverlay: document.getElementById('videoOverlay'),
    nextButton: document.getElementById('nextButton'),
    MapSelect: document.getElementById('MapSelect'),
    StartButton: document.getElementById('StartButton'),
    sendButton: document.getElementById('sendButton')
};

const room_name = new URLSearchParams(window.location.search).get('room_name');

function sendMessage() {
    const content = elements.inputMessage.value.trim();
    if (content) {
        socket.emit('message', { content, room: room_name });
        elements.inputMessage.value = '';
    }
}
//정답 출력용
function showSongInfo(title, song, correctusername) {
    const songTitle = document.getElementById('songTitle');
    const songArtist = document.getElementById('songArtist');
    const correctUser = document.getElementById('correctUser');
    songTitle.innerText = title;
    songArtist.innerText = song;
    correctUser.innerText = "정답자: " + correctusername;
}



function voteSkip() {
    socket.emit('voteSkip', { "room": room_name, "requiredSkipVotes": requiredSkipVotes(totalPlayers) });
}

function playvideo(videolink) {
    const iframe = document.createElement("iframe");
    iframe.src = videolink;
    iframe.allow = "autoplay";
    iframe.width = "100%";
    iframe.height = "100%";

    const videoFrame = document.getElementById("videoFrame");
    videoFrame.innerHTML = "";
    videoFrame.appendChild(iframe);
    videoOverlay.style.display = 'block';
}


function requiredSkipVotes(players) {
    return players <= 2 ? players : players <= 6 ? Math.ceil(players / 2) : Math.ceil(players * 0.7);
}

function updateVoteCountUI(count) {
    const requiredVotes = requiredSkipVotes(totalPlayers);
    document.getElementById('skipVoteCount').innerText = `현재 스킵 투표 수: ${count}/${requiredVotes}`;
}

function initEventListeners() {
    elements.sendButton.addEventListener('click', sendMessage);
    elements.inputMessage.addEventListener('keyup', event => {
        if (event.key === 'Enter') sendMessage();
    });
    elements.nextButton.addEventListener('click', () => {
        elements.nextButton.disabled = true;
        voteSkip();
    });
    // 키보드의 end 버튼을 눌러도 nextButton이 눌리게끔 하는 동작
    document.addEventListener('keydown', (event) => {
        if (event.key === 'End' && elements.nextButton.disabled === false) {
            elements.nextButton.disabled = true;
            voteSkip();
        }
    });
    elements.StartButton.addEventListener('click', () => {
        elements.nextButton.disabled = false;
        socket.emit('MissionSelect', { "room_name": room_name, "selected_id": selectedId });
        socket.emit('playingRoom_hidden', room_name);
    });
    elements.MapSelect.addEventListener('click', MapSelectPopUp);
}


function initializeSocketEvents() {
    //게임 시작
    socket.on("PlayGame", data => {
        totalPlayers = data.totalPlayers;
        currentvideolink = data.youtubeLink;
        playvideo(currentvideolink);
        elements.MapSelect.style.display = "none";
        elements.nextButton.style.display = "block";
        elements.StartButton.style.display = "none";
        nextButton.disabled = false;
        updateVoteCountUI(0);
    });
    //다음 곡 진행
    socket.on('NextData', function(data) {
        currentvideolink = data.youtubeLink;
        playvideo(currentvideolink);
        songTitle.innerText = "";
        songArtist.innerText = "";
        correctUser.innerText = "";
        nextButton.disabled = false;
        updateVoteCountUI(0);
    });
    //게임 끝났을 때 init
    socket.on('EndOfData', function() {
        songTitle.innerText = "";
        songArtist.innerText = "";
        correctUser.innerText = "";
        videoOverlay.style.display = 'block';
        MapSelect.style.display = "block";
        nextButton.disabled = true;
        StartButton.style.display = "block";
        document.getElementById('skipVoteCount').innerText = "";
        playvideo("");
        nextButton.style.display = "none";
        socket.emit('playingRoom_show', room_name);
    });

    socket.on('MissionSelect_get', data => {
        socket.emit("playTheGame", data);
    });

    socket.on('correctAnswer', data => {
        playvideo(currentvideolink);
        elements.videoOverlay.style.display = 'none';
        showSongInfo(data.data.title, data.data.song, data.name);
    });

    socket.on('user_disconnect', data => {
        socket.emit('request_room_players_update', { room_name });
    });

    socket.on('message', data => {
        const item = document.createElement('div');
        item.innerHTML = `<span class="font-semibold">${data.name}:</span> ${data.msg}`;
        elements.messages.appendChild(item);
        elements.messages.scrollTop = elements.messages.scrollHeight;
    });


    socket.on('updateVoteCount', function(data) {
        skipvote = data.count;
        updateVoteCountUI(skipvote);
    });

}

window.onload = function() {
    socket.emit('create_room', { room_name: room_name }, () => {
        socket.emit('join', { room_name: room_name }, () => {
            initEventListeners();
            initializeSocketEvents();
        })
    });
    nextButton.style.display = "none";
};


function MapSelectPopUp() {
    createMapSelectModal();

    $('#missionTableModal').modal('show');

    $.ajax({
        url: '/api/get_mission_table',
        type: 'GET',
        success: function(data) {
            populateModalWithMissionData(data);
        },
        error: function(error) {
            console.error('Error fetching mission table data:', error);
        }
    });
}

function populateModalWithMissionData(data) {
    let contentHtml = '<div class="grid grid-cols-5 gap-6">';

    for (let i = 0; i < data.length; i++) {
        contentHtml += `
            <a href="#" class="block bg-white p-4 shadow-md hover:bg-gray-100 rounded text-center transition duration-300" data-id="${data[i].id}" onclick="selectAndClose(${data[i].id})">
                <p>ID: ${data[i].id}</p>
                <p>Name: ${data[i].MapName}</p>
                <p>Producer: ${data[i].MapProducer}</p>
                <img src="${data[i].Thumbnail}" alt="${data[i].MapName}" />
                <p>${data[i].MusicNum}곡</p>
            </a>`;
    }

    contentHtml += '</div>';
    $('#popup-content').html(contentHtml);
}

function createMapSelectModal() {
    $('#missionTableModal').remove();
    const modalHtml = `
    <div class="modal fade" id="missionTableModal" tabindex="-1" aria-labelledby="missionTableModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="missionTableModalLabel"></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="popup-content">
                        <div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8 ">
                            <div class="grid grid-cols-5 gap-6">
                                <!-- 예시 아이템. 실제 사용 시에는 이 부분을 동적으로 생성해야 합니다. -->
                                <a href="#" class="block bg-white p-4 shadow-md hover:bg-gray-100 rounded text-center transition duration-300">
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    $('body').append(modalHtml);
}

function selectAndClose(id) {
    selectedId = id;
    $('#missionTableModal').modal('hide');
}