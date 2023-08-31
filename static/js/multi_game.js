//multi game js --author: NewKyaru 15/08/2023
let totalPlayers = 0;
let skipvote = 0;
let currentvideolink = "";
let selectedId = 0;
let player_name = document.getElementById('User_Name').innerText;
let isHost = false;
let player;
let isPlayingVideo = false;
let GameTimer = 0;
let doMessage = true;
let playerStateChangeHandler; // 이벤트 핸들러를 저장할 변수
let gameTimerInterval; //setInteval 이벤트
let isSkipFlag = true;
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
    if (doMessage) {
        doMessage = false;
        const content = elements.inputMessage.value.trim();
        if (content) {
            socket.emit('message', { content, room: room_name });
            elements.inputMessage.value = '';
        }
        setTimeout(() => {
            doMessage = true;
        }, 200);
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
    songHint.style.display = "block"
    songHint.innerText = "힌트: " + hint;
}

function voteSkip() {
    socket.emit('voteSkip', { "room": room_name, "requiredSkipVotes": requiredSkipVotes(totalPlayers) }, () => {
        isSkipFlag = true;
    });
}


function dummyplay() {
    let embedLink = "https://www.youtube.com/embed/LN1ASBClb0Q?autoplay=1&loop=1";
    const iframe = document.createElement("iframe");
    iframe.src = embedLink;
    iframe.allow = "autoplay";
    iframe.width = "100%";
    iframe.height = "100%";
    const dummy = document.getElementById('dummy');
    dummy.innerHTML = "";
    dummy.style.display = 'none';
    dummy.appendChild(iframe);
    console.log("더미재생중");
}

function playvideo(videolink, startTime = 0, endTime = 0, totalSong, nowSong, callback = null) {
    if (isPlayingVideo) {
        // 이미 비디오를 재생 중인 경우 아무 작업도 하지 않음
        return;
    }
    console.log("재생시작");
    isPlayingVideo = true;
    const videoFrame = document.getElementById("videoFrame");
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
            playerVars: {
                'showinfo': 0,
                'rel': 0,
            },
            events: {
                'onReady': (event) => {
                    // 비디오 정보를 가져와서 endTime을 설정합니다.
                    onPlayerReady(event, startTime, endTime, totalSong, nowSong, callback); // endTime와 callback 전달
                },
            }
        });
    } else {
        // 기존 플레이어를 사용하여 비디오를 변경합니다.
        player.cueVideoById({ videoId: videoId, startSeconds: startTime });
        setTimeout(()=> {
            onNextReady(startTime, endTime, totalSong, nowSong, callback);
        }, 1000)

    }
    videoOverlay.style.display = 'block';
}

function onPlayerReady(event, startTime, endTime, totalSong, nowSong, callback) {
    setVolume(document.querySelector("#VolumeBar").value);
    clearInterval(gameTimerInterval);
    event.target.playVideo();
    if (startTime > 0) {
        seekTo(startTime);
    }
    if (callback != null) {
        callback(startTime, endTime, totalSong, nowSong); // endTime을 콜백으로 전달
    }

}

function onNextReady(startTime, endTime, totalSong, nowSong, callback) {
    clearInterval(gameTimerInterval);
    player.playVideo();
    if (startTime > 0) {
        seekTo(startTime);
    }
    if (endTime == "stop") {
        console.log("이벤트제거");
        return;
    }
    if (callback != null) {
        callback(startTime, endTime, totalSong, nowSong); // endTime을 콜백으로 전달
    }
}

function EndTimeTest(startTime, fendTime, totalSong, nowSong) {
    let endTime = fendTime;

    console.log(endTime);
    if (endTime == 0 || endTime > player.getDuration()) {
        endTime = player.getDuration();
    }
    GameTimer = endTime - startTime;
    let Num = 3;
    gameTimerInterval = setInterval(() => {
        document.querySelector("#GameTimer span").innerText = GameTimer;
        if (GameTimer <= 0) {
            if(Num == 0)
            {
                dummyplay();
                Num = 3;
            }
            Num--;
            socket.emit("TimeOut", { "room": room_name });
            return;
        }
        GameTimer--;
    }, 1000);
    document.querySelector("#AllNumber").innerText = totalSong;
    document.querySelector("#nowNumber").innerText = nowSong;
    isSkipFlag = false;
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
        if (!isSkipFlag) {
            elements.nextButton.disabled = true;
            voteSkip();
        }
    });
    // 키보드의 end 버튼을 눌러도 nextButton이 눌리게끔 하는 동작
    document.addEventListener('keydown', (event) => {
        if (event.key === 'End' && elements.nextButton.disabled === false) {
            if (!isSkipFlag) {
                elements.nextButton.disabled = true;
                voteSkip();
            }
        }
    });
    elements.hintButton.addEventListener('click', () => {
        socket.emit('showHint', { "room": room_name });
    });
    elements.StartButton.addEventListener('click', () => {
        isPlayingVideo = false;
        elements.nextButton.disabled = false;
        socket.emit('MissionSelect', { "room_name": room_name, "selected_id": selectedId });
    });
    elements.MapSelect.addEventListener('click', MapSelectPopUp);
    elements.textClear.addEventListener('click', ()=> {
        elements.messages.innerHTML = "";
    })
}


function initializeSocketEvents() {
    //게임 시작
    socket.on("PlayGame", data => {
        totalPlayers = data.totalPlayers;
        currentvideolink = data.youtubeLink;
        totalSong = data.totalSong;
        nowSong = data.nowSong;
        playvideo(currentvideolink, data.startTime, data.endTime, totalSong, nowSong, EndTimeTest);
        elements.MapSelect.style.display = "none";
        elements.nextButton.style.display = "block";
        elements.hintButton.style.display = "block";
        elements.StartButton.style.display = "none";
        nextButton.disabled = false;
        updateVoteCountUI(0);
        showHostContent(true);
        socket.emit('playingStatus_true', room_name, ()=> {
            let scoreItem = document.querySelectorAll(".ScoreSpan")
            for (const element of scoreItem) {
                element.innerHTML = 0;
            }
        })
    });
    //다음 곡 진행
    socket.on('NextData', (data) => {
        currentvideolink = data.youtubeLink;
        totalPlayers = data['totalPlayers'];
        isPlayingVideo = false;
        clearInterval(gameTimerInterval);
        nowSong = data.nowSong;
        totalSong = data.totalSong
        playvideo(currentvideolink, data.startTime, data.endTime, totalSong, nowSong, EndTimeTest);
        songTitle.innerText = "";
        songArtist.innerText = "";
        correctUser.innerText = "";
        songHint.style.display = "none";
        songHint.innerText = "";
        elements.nextButton.style.display = "block";
        nextButton.disabled = false;
        updateVoteCountUI(0);
        showHostContent(true);
    });
    //게임 끝났을 때 init
    socket.on('EndOfData', () => {
        songTitle.innerText = "";
        songArtist.innerText = "";
        correctUser.innerText = "";
        songHint.innerText = "";
        songHint.style.display = "none";
        videoOverlay.style.display = 'block';
        nextButton.disabled = true;
        nextButton.style.display = "none";
        document.getElementById('skipVoteCount').innerText = "";
        console.log("재생종료");
        nextButton.style.display = "none";
        hintButton.style.display = "none";
        isPlayingVideo = false;
        setTimeout(() => {
            player.stopVideo();
            clearInterval(gameTimerInterval);

        }, 1000)

        socket.emit('playingStatus_false', room_name);

        showHostContent(false);
    });

    socket.on('MissionSelect_get', data => {
        socket.emit("playTheGame", data);
    });

    socket.on('correctAnswer', data => {
        isPlayingVideo = false;
        nowSong = data.nowSong;
        totalSong = data.totalSong;
        playvideo(currentvideolink, data.startTime, "stop", totalSong, nowSong, null);
        elements.videoOverlay.style.display = 'none';
        showSongInfo(data.data.title, data.data.song, data.name);
        if (document.querySelector("#NextVideo").checked) {
            setTimeout(
                () => {
                    if (!isSkipFlag) {
                        elements.nextButton.disabled = true;
                        voteSkip();
                    }
                }, 1000
            )
        }
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


    socket.on('updateVoteCount', (data) => {
        skipvote = data.count;
        updateVoteCountUI(skipvote);
    });

}

window.onload = () => {
    socket.emit('create_room', { room_name: room_name }, () => {
        socket.emit('join', { room_name: room_name }, () => {
            initEventListeners();
            initializeSocketEvents();
            showHostContent(false);
            dummyplay();
        })
    });
};
window.addEventListener('scroll', () => {
    let scrollYvalue = window.scrollY;
    if(scrollYvalue > 140)
    {
        this.document.getElementById('Players_Box_Left').style.transform = `translateY(${scrollYvalue-140}px)`;
        this.document.getElementById('Players_Box_Right').style.transform = `translateY(${scrollYvalue-140}px)`

    }
});
socket.on("user_change", (data) => {
    console.log(data["totalPlayer"]);
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
document.querySelector("#VolumeBar").addEventListener("input", () => {
    if (player) {
        player.setVolume(document.querySelector("#VolumeBar").value);
    }
})

function MapSelectPopUp() {
    $.get('/api/get_mission_table')
        .done(displayDataInModal)
        .fail(error => {
            console.error('Error fetching mission table data:', error);
        });
}

function displayDataInModal(data) {
    videoOverlay.style.display = 'none';
    const modalContent = populateModalWithMissionData(data);
    const modal = document.getElementById('mapModal');
    modal.querySelector('div').innerHTML = modalContent; // Insert content into the modal's inner div
    modal.classList.remove('hidden'); // Display the modal
    document.getElementById('mapModal').style.zIndex = 1;
}

function populateModalWithMissionData(data) {
    const mapItems = data.map(item => `
        <a href="#" class="block bg-white p-6 shadow-lg hover:shadow-xl hover:bg-gray-200 rounded transition duration-300" data-id="${item.id}" onclick="selectAndClose(${item.id})">
            <p class="text-xl mb-4 truncate">${item.MapName}</p>
            <div class="mb-4">
                <img src="${item.Thumbnail}" alt="${item.MapName}" class="mx-auto w-full h-56 object-cover rounded-lg" />
            </div>
            <p class="text-gray-500 mb-2">제작자: ${item.MapProducer}</p>
            <p class="text-indigo-600">곡수: ${item.MusicNum}곡</p>
        </a>`).join('');

    return `
        <div class="mx-auto max-w-7xl py-10 sm:px-6 lg:px-8">
            <h1 class="text-center text-3xl font-bold mb-8 text-gray-700">Select Map</h1>
            <button onclick="closeModal()" class="absolute top-2 right-2 text-white bg-red-500 rounded px-2 py-1 hover:bg-red-600 transition duration-300">닫기</button>
            <div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                ${mapItems}
            </div>
        </div>`;
}

function selectAndClose(id) {
    setSelectedId(id);
    // Close the modal
    document.getElementById('mapModal').classList.add('hidden');
}

function closeModal() {
    document.getElementById('mapModal').classList.add('hidden');
    document.getElementById('mapModal').style.zIndex = 0;
}

function setSelectedId(id) {
    selectedId = id;
    videoOverlay.style.display = 'block';
}

socket.on('room_players_update', (data) => {;
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

    //캐릭터
    Object.entries(players).forEach(([key, value]) => {
        let username = value["username"];
        let score = value['score'];
        let charImg = findKeysByValue(CharacterEnum, value['character']);
        let characterImageUrl = getCharacter(charImg);
        console.log(characterImageUrl);
        let userDiv = document.createElement("div");
        userDiv.classList.add(
            "bg-white", "border-2", "border-gray-300", "p-4",
            "rounded", "shadow-lg", "opacity-100",
            "flex", "flex-col", "items-center", "justify-center"
        );
        userDiv.innerHTML = `
            <div class="space-y-3 text-center">
                <p class="font-semibold text-lg text-gray-800">${username}</p>
                <img src="${characterImageUrl}" alt="Character Image" class="w-24 h-24 rounded-full shadow-md" />
                <p class="font-medium text-gray-700">점수: <span class='ScoreSpan text-red-500'>${score}</span></p>
            </div>
        `;

        if (index % 2 === 0) {
            leftContainer.appendChild(userDiv);
        } else {
            rightContainer.appendChild(userDiv);
        }

        index++;
    });

}