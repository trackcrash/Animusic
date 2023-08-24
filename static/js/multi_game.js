//multi game js --author: NewKyaru 15/08/2023
let totalPlayers = 0;
let skipvote = 0;
let currentvideolink = "";
let selectedId = 0;
let player_name = document.getElementById('User_Name').innerText;
let isHost = false;
let player;
let isPlayingVideo = false;

// DOM Elements
const elements = {
    messages: document.getElementById('messages'),
    inputMessage: document.getElementById('inputMessage'),
    videoOverlay: document.getElementById('videoOverlay'),
    nextButton: document.getElementById('nextButton'),
    MapSelect: document.getElementById('MapSelect'),
    StartButton: document.getElementById('StartButton'),
    sendButton: document.getElementById('sendButton'),
    hintButton: document.getElementById('hintButton'),
    textClear: document.getElementById('text_clear')
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

function showHint(hint) {
    const songHint = document.getElementById('songHint');
    songHint.innerText = "힌트: " + hint;
}

function voteSkip() {
    socket.emit('voteSkip', { "room": room_name, "requiredSkipVotes": requiredSkipVotes(totalPlayers) });
}

function playvideo(videolink, startTime = 0) {
    if (isPlayingVideo) {
        // 이미 비디오를 재생 중인 경우 아무 작업도 하지 않음
        return;
    }
    isPlayingVideo = true;
    const videoFrame = document.getElementById("videoFrame");
    videoFrame.innerHTML = "";
    const videoId = getYoutubeVideoId(videolink);

    if (!videoId) {
        console.error("Invalid YouTube URL provided");
        return;
    }

    if (!player) {
        player = new YT.Player(videoFrame, {
            height: '100%',
            width: '100%',
            videoId: videoId,
            events: {
                'onReady': function(event) {
                    onPlayerReady(event, startTime);
                }
            }
        });
    } else {
        player.loadVideoById({ videoId: videoId, startSeconds: startTime });
    }

    videoOverlay.style.display = 'block';
}

function onPlayerReady(event, startTime) {
    setVolume(50);
    event.target.playVideo();
    if (startTime > 0) {
        seekTo(startTime);
    }
}

function getYoutubeVideoId(url) {
    const regex = /(?:https:\/\/www\.youtube\.com\/embed\/)?([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}
//볼륨용
function setVolume(volumeLevel) {
    if (player && player.setVolume) {
        player.setVolume(volumeLevel);
    }
}
//재생시간용
function seekTo(seconds) {
    if (player && player.seekTo) {
        player.seekTo(seconds, true);
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
    // 키보드의 end 버튼을 눌러도 nextButton이 눌리게끔 하는 동작
    document.addEventListener('keydown', (event) => {
        if (event.key === 'End' && elements.nextButton.disabled === false) {
            elements.nextButton.disabled = true;
            voteSkip();
        }
    });
    elements.hintButton.addEventListener('click', () => {
        socket.emit('showHint', { "room": room_name });
    });
    elements.StartButton.addEventListener('click', () => {
        isPlayingVideo = false;
        elements.nextButton.disabled = false;
        socket.emit('MissionSelect', { "room_name": room_name, "selected_id": selectedId }, function() {
            socket.emit('playingStatus_change', room_name, function() {
                let scoreItem = document.querySelectorAll(".ScoreSpan")
                for (const element of scoreItem) {
                    element.innerHTML = 0;
                }
            });
        });
    });
    elements.MapSelect.addEventListener('click', MapSelectPopUp);
    elements.textClear.addEventListener('click', function() {
        elements.messages.innerHTML = "";
    })
}


function initializeSocketEvents() {
    //게임 시작
    socket.on("PlayGame", data => {
        totalPlayers = data.totalPlayers;
        currentvideolink = data.youtubeLink;
        playvideo(currentvideolink, data.startTime);
        elements.MapSelect.style.display = "none";
        elements.nextButton.style.display = "block";
        elements.hintButton.style.display = "block";
        elements.StartButton.style.display = "none";
        nextButton.disabled = false;
        updateVoteCountUI(0);
        showHostContent(true);
    });
    //다음 곡 진행
    socket.on('NextData', function(data) {
        currentvideolink = data.youtubeLink;
        totalPlayers = data['totalPlayers'];
        isPlayingVideo = false;
        playvideo(currentvideolink, data.startTime);
        songTitle.innerText = "";
        elements.nextButton.style.display = "block";
        songArtist.innerText = "";
        correctUser.innerText = "";
        songHint.innerText = "";
        nextButton.disabled = false;
        updateVoteCountUI(0);
        showHostContent(true);
    });
    //게임 끝났을 때 init
    socket.on('EndOfData', function() {
        songTitle.innerText = "";
        songArtist.innerText = "";
        correctUser.innerText = "";
        songHint.innerText = "";
        videoOverlay.style.display = 'block';
        nextButton.disabled = true;
        nextButton.style.display = "none";
        document.getElementById('skipVoteCount').innerText = "";
        player.stopVideo();
        nextButton.style.display = "none";
        hintButton.style.display = "none";
        socket.emit('playingStatus_change', room_name);

        showHostContent(false);
    });

    socket.on('MissionSelect_get', data => {
        socket.emit("playTheGame", data);
    });

    socket.on('correctAnswer', data => {
        isPlayingVideo = false;
        playvideo(currentvideolink, data.startTime);
        elements.videoOverlay.style.display = 'none';
        showSongInfo(data.data.title, data.data.song, data.name);
    });

    socket.on('hint', data => {
        showHint(data.hint);
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
    //     socket.on("new_host_message", (data) => {
    //         // data.message를 이용하여 새로운 방장 알림을 처리
    //         elements.nextButton.style.display = "block";
    //         elements.MapSelect.style.display = "block";
    //         elements.nextButton.disabled = true;
    //         elements.MapSelect.disabled = true;
    //         console.log(data.message);
    //     });
}

window.onload = function() {
    socket.emit('create_room', { room_name: room_name }, () => {
        socket.emit('join', { room_name: room_name }, () => {
            initEventListeners();
            initializeSocketEvents();
            showHostContent(false);
        })
    });
    // nextButton.style.display = "none";
};
socket.on("user_change", (data) => {
    let count = data["count"];
    totalPlayers = data["totalPlayers"];
    updateVoteCountUI(count);
})

socket.on('host_updated', (data) => {
    // 방장 정보가 업데이트되었을 때 클라이언트에서 수행할 동작
    const game_status = data['game_status'];
    if (data.user === socket.id) {
        isHost = true; // 방장이면 isHost를 true로 설정
    }
    showHostContent(game_status);
});

function showHostContent(game_status) {
    if (isHost) {
        if (game_status == false) {
            elements.StartButton.style.display = "block";
            elements.MapSelect.style.display = "block";
            elements.StartButton.disabled = false;
            elements.MapSelect.disabled = false;
            elements.hintButton.style.display = "none";
            elements.nextButton.style.display = "none";
            elements.hintButton.disabled = true;
            elements.nextButton.disabled = true;
        }
        if (game_status == true) {
            elements.hintButton.style.display = "block";
            elements.nextButton.style.display = "block";
            elements.hintButton.disabled = false;
            elements.nextButton.disabled = false;

        }
    } else {
        elements.StartButton.style.display = "none";
        elements.MapSelect.style.display = "none";
        elements.StartButton.disabled = true;
        elements.MapSelect.disabled = true;

        if (game_status == true) {
            elements.nextButton.style.display = "block";
            elements.nextButton.disabled = false;
            elements.hintButton.style.display = "block";
            elements.hintButton.disabled = false;
        } else {
            elements.nextButton.style.display = "none";
            elements.nextButton.disabled = true;
            elements.hintButton.style.display = "none";
            elements.hintButton.disabled = true;
        }

    }
}

function MapSelectPopUp() {
    // AJAX 호출로 데이터 가져오기
    $.ajax({
        url: '/api/get_mission_table',
        type: 'GET',
        success: function(data) {
            openPopupAndDisplayData(data);
        },
        error: function(error) {
            console.error('Error fetching mission table data:', error);
        }
    });
}

function openPopupAndDisplayData(data) {
    const popupContent = populatePopupWithMissionData(data);
    const popupWindow = window.open('', 'mapSelectPopup', 'width=800,height=800,scrollbars=yes');
    popupWindow.document.write(popupContent);
    popupWindow.document.close();
}

function populatePopupWithMissionData(data) {
    let contentHtml = `
        <html>
            <head>
                <title>Select Map</title>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.16/dist/tailwind.min.css" rel="stylesheet">
            </head>
            <body class="bg-gray-100 font-sans">
                <div class="mx-auto max-w-7xl py-10 sm:px-6 lg:px-8">
                    <h1 class="text-center text-3xl font-bold mb-8 text-gray-700">Select Map</h1>
                    <div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6">`;

    for (let i = 0; i < data.length; i++) {
        contentHtml += `
            <a href="#" class="block bg-white p-6 shadow-lg hover:shadow-xl hover:bg-gray-200 rounded transition duration-300" data-id="${data[i].id}" onclick="selectAndClose(${data[i].id})">
                <p class="text-xl mb-4 truncate">${data[i].MapName}</p>
                <div class="mb-4">
                    <img src="${data[i].Thumbnail}" alt="${data[i].MapName}" class="mx-auto w-full h-56 object-cover rounded-lg" />
                </div>
                <p class="text-gray-500 mb-2">제작자: ${data[i].MapProducer}</p>
                <p class="text-indigo-600">곡수: ${data[i].MusicNum}곡</p>
            </a>`;
    }

    contentHtml += `
                    </div>
                </div>
                <script type="text/javascript">
                    function selectAndClose(id) {
                        window.opener.setSelectedId(id);
                        window.close();
                    }
                </script>
            </body>
        </html>`;

    return contentHtml;
}

function setSelectedId(id) {
    selectedId = id;
}

socket.on('room_players_update', function(data) {;
    if (data.room_name == room_name) {
        const item = document.createElement('div');
        item.innerHTML = `<span class="font-semibold">${data.player}</span> ${data.msg}`;
        elements.messages.appendChild(item);
        elements.messages.scrollTop = elements.messages.scrollHeight;
        playerListGet(data.players);

    }
});

function playerListGet(players) {
    let leftContainer = document.getElementById("Players_Box_Left");
    let rightContainer = document.getElementById("Players_Box_Right");

    leftContainer.innerHTML = "";
    rightContainer.innerHTML = "";

    let index = 0;

    Object.entries(players).forEach(function([key, value]) {
        let username = value["username"];
        let score = value['score'];

        // 캐릭터 이미지 URL
        let characterImageUrl = value['character'];

        let userDiv = document.createElement("div");
        userDiv.classList.add("w-full", "border-black", "border-1", "player-space");
        userDiv.innerHTML = `
            Name: ${username} 
            <img src="${characterImageUrl}" alt="Character Image" width="50" height="50"> 
            Score: <span class='ScoreSpan'>${score}</span>
        `;

        if (index % 2 === 0) {
            leftContainer.appendChild(userDiv);
        } else {
            rightContainer.appendChild(userDiv);
        }

        index++;
    });
}