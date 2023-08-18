//multi game js --author: NewKyaru 15/08/2023
let totalPlayers = 0;
let musicData = [];
let currentIndex = 0;
let skipvote = 0;
let selectedId = 0;
let player_name = 'name_blank';

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
        console.log(content);
        socket.emit('message', { content, room: room_name });
        elements.inputMessage.value = '';
        checkAnswer(content);
    }
}
//정답 출력용
function showSongInfo(index, correctusername) {
    const songTitle = document.getElementById('songTitle');
    const songArtist = document.getElementById('songArtist');
    const correctUser = document.getElementById('correctUser');
    songTitle.innerText = musicData[index].title;
    songArtist.innerText = musicData[index].song;
    correctUser.innerText = "정답자: "+ correctusername;
}

function nextVideo() {
    currentIndex += 1;
    skipvote = 0;
    updateVoteCountUI(skipvote);
    const songTitle = document.getElementById('songTitle')
    const songArtist = document.getElementById('songArtist')
    const correctUser = document.getElementById('correctUser');
    if (currentIndex < musicData.length) {
        playvideo(currentIndex);
        songTitle.innerText = "";
        songArtist.innerText = "";
        correctUser.innerText = "";
        nextButton.disabled = false;
    } else {
        songTitle.innerText = "";
        songArtist.innerText = "";
        correctUser.innerText = "";
        currentIndex = 0;
        videoOverlay.style.display = 'block';
        console.log("게임이 끝났습니다.");
        MapSelect.style.display = "block";
        nextButton.disabled = true;
    }
}

function voteSkip() {
    console.log("스킵에 투표하셨습니다.")
    socket.emit('voteSkip', { "index": currentIndex, "room": room_name, "requiredSkipVotes": requiredSkipVotes(totalPlayers) });
}

function playvideo(index) {
    let embedLink = musicData[index].youtube_embed_url;
    const iframe = document.createElement("iframe");
    iframe.src = embedLink;
    iframe.allow = "autoplay";
    iframe.width = "100%";
    iframe.height = "100%";

    const videoFrame = document.getElementById("videoFrame");
    videoFrame.innerHTML = "";
    videoFrame.appendChild(iframe);
    videoOverlay.style.display = 'block';
}



function checkAnswer(answer) {
    // 이미 해당 문제의 정답을 맞췄다면 체크하지 않음
    if (musicData.length >= 1) {
        if (musicData[currentIndex].is_answered === "true") {
            return;
        }
        //안맞춰졌다면

        if (musicData[currentIndex].answer_list.includes(answer)) {
            musicData[currentIndex].is_answered = "true";
            socket.emit('correctAnswer', { index: currentIndex, room: room_name, correctuser: player_name}); // 내가 수정한 부분

        }
    }

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
    elements.StartButton.addEventListener('click', () => {
        elements.nextButton.disabled = false;
        currentIndex = 0;
        socket.emit('MissionSelect', { "room_name": room_name, "selected_id": selectedId });
    });
    elements.MapSelect.addEventListener('click', MapSelectPopUp);
}

function initializeSocketEvents() {
    socket.on("PlayGame", data => {
        playvideo(currentIndex);
        totalPlayers = data;
        console.log(data);
        elements.MapSelect.style.display = "none";
        updateVoteCountUI(0);
    });

    socket.on('MissionSelect_get', data => {
        musicData = data.get_music;
        console.log(musicData);
        socket.emit("playTheGame", data.room_name);
    });

    socket.on('correctAnswer', data => {
        if (data.index === currentIndex) {
            musicData[currentIndex].is_answered = "true";
            playvideo(currentIndex);
            elements.videoOverlay.style.display = 'none';
            showSongInfo(currentIndex, data.correctuser);
        }
    });

    socket.on('user_disconnect', data => {
        console.log(`${data} 가Disconnected from the server`);
        socket.emit('request_room_players_update', { room_name });
    });

    socket.on('message', data => {
        console.log(data);
        const item = document.createElement('div');
        item.innerHTML = `<span class="font-semibold">${data.name}:</span> ${data.msg}`;
        elements.messages.appendChild(item);
        elements.messages.scrollTop = elements.messages.scrollHeight;
    });
    socket.on('nextVideo', function() {
        nextVideo();
    });

    socket.on('updateVoteCount', function(data) {
        if (data.index === currentIndex) {
            skipvote = data.count;
            updateVoteCountUI(skipvote);
        }
    });

}

window.onload = function() {
    socket.emit('join', { room_name: room_name }, () => {
        initEventListeners();
        initializeSocketEvents();
    })
    socket.on('player_name', function(data) {player_name = data})

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
    console.log('Selected ID:', selectedId);
    $('#missionTableModal').modal('hide');
}