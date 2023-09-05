//multi game js --author: NewKyaru 15/08/2023
let totalPlayers = 0;
let skipvote = 0;
let currentvideolink = "";
let selectedId = null;
let player_name = document.getElementById('User_Name').innerText;
let isHost = false;
let player;
let GameTimer = 0;
let doMessage = true;
let playerStateChangeHandler; // 이벤트 핸들러를 저장할 변수
let gameTimerInterval; //setInteval 이벤트
let currentData = null;
let isVideoPlaying = false;
let Num = 0;
let isAnswer = false;
// let is_api_load= false;

// function onYouTubeIframeAPIReady() {
//     // 플레이어 생성 및 설정
//     player = new YT.Player('player', {
//         height: '360',
//         width: '640',
//         videoId: 'VIDEO_ID_HERE', // YouTube 비디오의 ID를 여기에 입력
//         events: {
//         }
//     });
//     is_api_load = true;
// }
function fetchData(url, callback) {
    $.getJSON(url, callback);
}
// DOM Elements
const elements = {
    room_setting : document.getElementById("room_setting"),
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

const room_key = new URLSearchParams(window.location.search).get('room_key');

function sendMessage() {
    if (doMessage) {
        doMessage = false;
        const content = elements.inputMessage.value.trim();
        if (content) {
            socket.emit('message', { content, room: room_key,gameTimer: GameTimer < 1 ? false : true, isAnswer:isAnswer});
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
    elements.nextButton.disabled = true;
    socket.emit('voteSkip', { "room": room_key, "requiredSkipVotes": requiredSkipVotes(totalPlayers) });
}


function dummyplay() {
    let embedLink = "http://www.youtube.com/embed/LN1ASBClb0Q?autoplay=1&loop=1";
    const iframe = document.createElement("iframe");
    iframe.src = embedLink;
    iframe.allow = "autoplay";
    iframe.width = "100%";
    iframe.height = "100%";
    const dummy = document.getElementById('dummy');
    dummy.innerHTML = "";
    dummy.style.display = 'none';
    dummy.appendChild(iframe);
}

function playvideo(videolink,endTime = null) {
    const videoId = getYoutubeVideoId(videolink);
    let videoFrame;
    if (!videoId) {
        console.error("Invalid YouTube URL provided");
        return;
    }

    if (player) {
        player.destroy();
        document.querySelector("div #videoFrame").remove();
        isVideoPlaying = false;
        videoFrame = document.createElement("div");
        videoFrame.id = "videoFrame";
        videoFrame.classList.add("absolute", "top-0", "left-0", "w-full", "h-full")
        document.getElementById("videoContainer").insertBefore(videoFrame, document.getElementById("videoOverlay"));
    }
    videoFrame = document.getElementById("videoFrame");

    // videoFrame 초기화
    player = new YT.Player(videoFrame, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'showinfo': 0,
            'rel': 0,
        },
        events: {
            'onReady': function(event)
            {
                console.log("OnReady");
                onPlayerReady(event,endTime)   
            }
        }
    });
    videoOverlay.style.display = 'block';
}


function onPlayerReady(event, endTime) {
    // YouTube 플레이어가 준비되었을 때 호출됩니다.
    socket.emit("ReadyPlay", {"room_key":room_key ,"endTime": endTime})    
}
socket.on("CheckPlayer",function(data)
{
    const endTime = data['endTime'];
 
    console.log("체크",data["vote"], data["totalPlayer"]);
    if(player && player.playVideo)
    {
        console.log("레디");
        socket.emit("ReadyPlayer", {"room_key": room_key, "endTime":endTime});
    }
    else
    {
        console.log("제거");
        socket.emit("WaitPlay",{"room_key":room_key, "endTime": endTime});
    }
})
socket.on("reCheck", function(data)
{
    const endTime = data['endTime'];
    if(player && player.playVideo)
    {
        console.log("레디");
        socket.emit("ReadyPlayer", {"room_key": room_key, "endTime":endTime});
    }
    else
    {
        console.log("제거");
        socket.emit("WaitPlay",{"room_key":room_key, "endTime": endTime});
    }
});
function EndTimeTest(startTime, fendTime, totalSong, nowSong) {
    clearInterval(gameTimerInterval);
    player.playVideo();
    let endTime = fendTime;

    setVolume(document.querySelector("#VolumeBar").value);
    if (startTime > 0) {
        seekTo(startTime);
    }  
    if (endTime == "stop") {
        elements.videoOverlay.style.display = 'none';
        isAnswer= false;
        return;
    }
    if (endTime == 0 || endTime > player.getDuration()) {
        endTime = player.getDuration();
    }
    GameTimer = endTime - startTime;
    gameTimerInterval = setInterval(() => {
        document.querySelector("#GameTimer span").innerText = parseInt(GameTimer);
        if (GameTimer < 1) {
            clearInterval(gameTimerInterval);
            voteSkip();
            return;  
        }
        GameTimer--;
    }, 1000);
    document.querySelector("#AllNumber").innerText = totalSong;
    document.querySelector("#nowNumber").innerText = nowSong;
    // videoFrame 요소의 title 속성이 표시되지 않게 함 (주소는 지울 수가 없음...)
    document.getElementById("videoFrame").removeAttribute("title");
    elements.nextButton.disabled = false;
    isAnswer = true;
}

function getYoutubeVideoId(url) {
    const regex = /(?:https:\/\/www\.youtube\.com\/embed\/)?([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}
//볼륨용
function setVolume(volumeLevel) {
    if (player && player.setVolume) {
        player.unMute();
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
    return players <= 2 ? players : players - 1;
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
        voteSkip();
    });
    // 키보드의 end 버튼을 눌러도 nextButton이 눌리게끔 하는 동작
    document.addEventListener('keydown', (event) => {
        if (event.key === 'End' && elements.nextButton.disabled === false) {
            voteSkip();
        }
    });
    elements.hintButton.addEventListener('click', () => {
        socket.emit('showHint', { "room": room_key });
    });
    elements.StartButton.addEventListener('click', () => {
        elements.nextButton.disabled = false;
        socket.emit('playTheGame', { "room_key": room_key, "selected_id": selectedId });
    });
    elements.MapSelect.addEventListener('click', MapSelectPopUp);
    elements.textClear.addEventListener('click', () => {
        elements.messages.innerHTML = "";
    })
}

function updateExpBar(exp, nextexp) {
    let percentage = (exp / nextexp) * 100;
    $('#expBar').css('width', percentage + '%');
    $('#expText').text(exp + '/' + nextexp);
}

function initializeSocketEvents() {
    //게임 시작
    socket.on("PlayGame", data => {
        totalPlayers = data.totalPlayers;
        currentvideolink = data.youtubeLink;
        playvideo(currentvideolink);
        elements.MapSelect.style.display = "none";
        elements.nextButton.style.display = "block";
        elements.hintButton.style.display = "block";
        elements.StartButton.style.display = "none";
        songTitle.innerHTML = "";
        nextButton.disabled = false;
        updateVoteCountUI(0);
        showHostContent(true);
        socket.emit('playingStatus_true', room_key, () => {
            let scoreItem = document.querySelectorAll(".ScoreSpan")
            for (const element of scoreItem) {
                element.innerHTML = 0;
            }
        })
    });
    //다음 곡 진행
    socket.on('NextData', (data) => {
        isAnswer = false;
        currentvideolink = data.youtubeLink;
        totalPlayers = data['totalPlayers'];
        clearInterval(gameTimerInterval);
        playvideo(currentvideolink);
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
    socket.on('EndOfData', function(data) {
        // 기존의 게임 상태 및 UI 초기화 코드        
        clearInterval(gameTimerInterval);
        document.querySelector("div #videoFrame").remove();
        songTitle.innerText = "";
        songArtist.innerText = "";
        correctUser.innerText = "";
        songHint.innerText = "";
        songHint.style.display = "none";
        videoOverlay.style.display = 'block';
        nextButton.disabled = true;
        nextButton.style.display = "none";
        document.getElementById('skipVoteCount').innerText = "";
        nextButton.style.display = "none";
        hintButton.style.display = "none";
        socket.emit('playingStatus_false', room_key);
        showHostContent(false);
        currentData = data;
        const scores = data.before_data;
        const userNames = Object.keys(scores);
        const sortedScores = userNames.map(username => ({ username, ...scores[username] })).sort((a, b) => b.score - a.score);

        $('#scoreModalBody').empty();

        for (let i = 0; i < sortedScores.length; i++) {
            const rank = i + 1;
            const username = sortedScores[i].username;
            const score = sortedScores[i].score;
            const row = `
            <tr>
                <td class="py-2">${rank}</td>
                <td>${username}</td>
                <td>${score}</td>
            </tr>
        `;
            $('#scoreModalBody').append(row);
        }

        $('#scoreModal').removeClass('hidden');
        let players = data['players'];
        playerListGet(players)
    });

    $('#scoreModalCloseBtn').click(function() {
        $('#scoreModal').addClass('hidden');
        if (!currentData || !currentData.new_data || !currentData.new_data[player_name]) {
            console.warn("Data is missing!");
            return;
        }
        const newUserData = currentData.new_data[player_name];
        const newExp = newUserData.exp;
        const newLevel = newUserData.level;
        const currentExp = (newUserData.nextexp);
        const currentUser = currentData.before_data[player_name];
        const beforeExp = currentUser.exp;
        const beforeLevel = currentUser.level;
        const beforeNextExp = currentUser.nextexp;
        if (!currentUser) {
            console.warn("Current user data is missing!");
            return;
        }
        if (currentUser.level != -1) {
            const startPercentage = (beforeExp / beforeNextExp) * 100;
            const endPercentage = (newExp / currentExp) * 100;

            $('#expBar').css('width', `${startPercentage}%`);

            $('#expText').text(`${beforeExp}/${beforeNextExp}`);

            $('#expBar').animate({ width: `${endPercentage}%` }, 3000);

            setTimeout(() => {
                $('#expText').text(`${newExp}/${currentExp}`);
            }, 1000);

            if (newLevel > currentUser.level) {
                $('#levelUpModal h2').text(`축하합니다! ${newLevel} 레벨이 되었습니다!`);
                $('#levelUpModal').removeClass('hidden');
            } else {
                $('#levelUpModal h2').text(`다음 레벨까지`);
                $('#levelUpModal').removeClass('hidden');
            }
            // 사용자 정보 업데이트
            $('#userExp').text(newExp);
            $('#userLevel').text(newLevel);

            currentUser.exp = newExp;
            currentUser.level = newLevel;

            currentData = null;
        }

    });

    $('#levelUpModalCloseBtn').click(function() {
        $('#levelUpModal').addClass('hidden');
    });

    socket.on('MissionSelect_get', data => {
        const map_name =data['map_data'][0]['MapName'];
        const Producer = data['map_data'][0]['MapProducer'];
        songTitle.innerText = `${map_name} \n 제작자 : ${Producer}`;
    });

    socket.on('correctAnswer', data => {
        isAnswer =false;
        const videolink = data["data"]["youtube_embed_url"];
        clearInterval(gameTimerInterval);
        playvideo(videolink, data.data.endTime);
        showSongInfo(data.data.title, data.data.song, data.name);
        if (document.querySelector("#NextVideo").checked) {
            voteSkip();
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
    socket.emit('create_room',{"room_key":room_key}, () => {
        socket.emit('join', { room_key: room_key}, () => {
            initEventListeners();
            initializeSocketEvents();
            showHostContent(false);
            fetchData(`/get-thisroom-dict?room_key=${room_key}`, (data) => {
                const mission = data["room_info"]["room_mission"];
                const game_status = data["room_info"]["room_status"]
                const room_name = data["room_info"]["room_name"];
                document.getElementById("room_title").value = room_name;
                document.getElementById("room_password").value = data["room_info"]["room_password"];
                document.getElementById("room_max_human").value = data["room_info"]["room_full_user"];
                document.getElementById('room_name').innerHTML = `${room_name}`;
                if(!game_status)
                {
                    if(mission)
                    {
                        songTitle.innerText = `${mission[0]["MapName"]} \n 제작자 : ${mission[0]["MapProducer"]}`;
                    }
                }
                else
                {
                    songTitle.innerText = `로딩중입니다. 잠시만 기다려주세요.`;
                }
            });
        })
    });

};
window.addEventListener('scroll', function() {
    let scrollYvalue = window.scrollY;
    if (scrollYvalue > 140) {
        this.document.getElementById('Players_Box_Left').style.transform = `translateY(${scrollYvalue-140}px)`;
        this.document.getElementById('Players_Box_Right').style.transform = `translateY(${scrollYvalue-140}px)`

    }
});
socket.on("failed_user_change",()=>
{
    alert("현재 유저수가 변경할 인원수 보다 많습니다.");
});
// EndTimeTest(startTime, fendTime, totalSong, nowSong)
socket.on("PlayVideoReadyOk", (data)=>
{
    EndTimeTest(data['startTime'], data['endTime'], data['current_data']['totalSong'],data['current_data']['nowSong']);
})
socket.on("user_change", (data) => {
    let count = data["count"];
    totalPlayers = data["totalPlayers"];
    updateVoteCountUI(count);
    if (count >= totalPlayers)
    {
        socket.emit("Skip", {"room_key":room_key});
    }
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
        elements.room_setting.style.display = "block";
        elements.room_setting.disabled = false;
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
        elements.room_setting.style.display = "none";
        elements.room_setting.disabled = true;
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
    socket.emit('MissionSelect', { "room_key": room_key, "selected_id": selectedId });
    
}

function closeModal() {
    document.getElementById('mapModal').classList.add('hidden');
    document.getElementById('mapModal').style.zIndex = 0;
}

function setSelectedId(id) {
    selectedId = id;
    videoOverlay.style.display = 'block';
}
socket.on('MapNotSelect', () => {
    alert("맵을 선택 후 시작해주세요");
});
socket.on('room_players_update', (data) => {
    if (data.room_key == room_key) {
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
        let level = value['level'];
        if (level == -1) {
            level = "GM";
        }
        let charImg = findKeysByValue(CharacterEnum, value['character']);
        let characterImageUrl = getCharacter(charImg);
        let userDiv = document.createElement("div");
        userDiv.classList.add(
            "bg-white", "border-2", "border-gray-300", "p-4",
            "rounded", "shadow-lg", "opacity-100",
            "flex", "flex-col", "items-center", "justify-center"
        );
        userDiv.innerHTML = `
            <div class="space-y-3 text-center">
                <p class="font-semibold">${level}</p>
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
function Setting_room_btn() {
    // 사용자 정보를 가져옵니다.
    $('#SettingRoomModal').removeClass('hidden');
}
$('#SettingRoomModalCloseBtn').click(function() {
    $('#SettingRoomModal').addClass('hidden');
});
$('#SettingRoomBtn').click(function() {
    $('#SettingRoomModal').addClass('hidden');
        const room_name = $("#room_title").val();
        const room_password = $("#room_password").val();
        const room_max_human = $("#room_max_human").val();

        if (room_name && room_name.trim() !== '') {
            socket.emit('room_setting_change', {room_key:room_key,room_name: room_name, room_password: room_password, room_max_human:room_max_human});
        } else if (room_name !== null) { // 취소 버튼을 클릭하지 않은 경우
            alert("올바른 방 이름을 입력해주세요.");
        }
    }
);
socket.on("room_data_update_inroom",(data)=>
{
    const thisroom_key = data["room_key"];
    if(thisroom_key == room_key)
    {
        const room_name = data["room_name"];
        const room_max_human = data["room_max_human"];
        document.getElementById('room_name').innerText = room_name;
        document.getElementById("room_title").value = room_name;
        document.getElementById("room_password").value=data["room_password"];
        document.getElementById("room_max_human").value = room_max_human;
    }
}); 