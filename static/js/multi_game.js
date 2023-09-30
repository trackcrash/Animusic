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
let Num = 0;
let isAnswer = false;
let session_id = "";
let current_answer_user = "";
let flag = false;
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
    room_setting: document.getElementById("room_setting"),
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
            socket.emit('message', { content, room: room_key, gameTimer: GameTimer < 1 ? false : true, isAnswer: isAnswer });
            elements.inputMessage.value = '';
        }
        setTimeout(() => {
            doMessage = true;
        }, 200);
    }

}
//정답 출력용
function showSongInfo(title, song, correctusername, all, left_answer, category) {
    const songTitle = document.getElementById('songTitle');
    const songArtist = document.getElementById('songArtist');
    const all_play = document.getElementById("all_play");
    if (all == true) {
        all_play.innerText = "모든 정답을 맞추셨습니다.";
        songTitle.innerHTML = '매체이름 : ' + `${title}`;
        songArtist.innerHTML = '곡 이름 : ' + `${song}`;
    } else if (all == 2) {
        all_play.innerText = "스킵되었습니다 다음곡으로 넘어갑니다.";
        songTitle.innerHTML = '매체이름 : ' + `${title}`;
        songArtist.innerHTML = '곡 이름 : ' + `${song}`;
    } else {
        const answer_list = all_play.querySelectorAll("div");
        for (let i = 0; i < left_answer.length; i++) {
            let correctAnswerText = answer_list[i].querySelector(".correct-answer") ? answer_list[i].querySelector(".correct-answer").textContent : "";
            // 카테고리 이름만 가져오기 위해 span과 correct-answer 내용을 제외시킵니다.
            let categoryName = answer_list[i].textContent.replace(answer_list[i].querySelector("span").textContent, "").replace(correctAnswerText, "").trim();

            if (categoryName === category) {
                const correctSpan = answer_list[i].querySelector(".correct-answer");
                correctSpan.textContent += " " + title;
            }
            answer_list[i].querySelector("span").textContent = " 남은항목: " + left_answer[i];
        }
    }
    current_answer_user = correctusername;
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
    let embedLink = "https://www.youtube.com/embed/LN1ASBClb0Q?autoplay=1";
    const iframe = document.createElement("iframe");
    iframe.src = embedLink;
    iframe.allow = "autoplay";
    iframe.width = "100%";
    iframe.height = "100%";
    const dummy = document.getElementById('dummy');
    dummy.classList.add("absolute", "top-0", "left-0", "w-0", "h-0");
    dummy.innerHTML = "";
    dummy.appendChild(iframe);
}

function playvideo(videolink, endTime = null) {
    const videoId = getYoutubeVideoId(videolink);
    let videoFrame;
    if (!videoId) {
        return;
    }

    if (player) {
        player.destroy();
        if (document.querySelector("div #videoFrame")) {
            document.querySelector("div #videoFrame").remove();
        }
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
            'onReady': function(event) {
                onPlayerReady(event, endTime)
            }
        }
    });
    videoOverlay.querySelector('span').innerText = "";
    videoOverlay.style.display = 'flex';
}


function onPlayerReady(event, endTime) {
    // YouTube 플레이어가 준비되었을 때 호출됩니다.
    socket.emit("ReadyPlay", { "room_key": room_key, "endTime": endTime })
}

let onetime = false;

function getidtourl() {
    if (!onetime) {
        let url = window.location.href;
        let id = url.split("&id=")[1];
        selectedId = id;
        socket.emit('MissionSelect', { "room_key": room_key, "selected_id": selectedId });
        onetime = true;
    }
}

function EndTimeTest(startTime, fendTime, totalSong, nowSong, category) {
    clearInterval(gameTimerInterval);
    player.playVideo();

    let endTime = fendTime;
    setVolume(document.querySelector("#VolumeBar").value);
    if (startTime > 0) {
        seekTo(startTime);
    }
    if (endTime == "stop") {
        elements.videoOverlay.style.display = 'none';
        isAnswer = false;
        return;
    }
    const all_play = document.getElementById("all_play");
    all_play.innerText = "";
    for (let key in category) {
        if (category.hasOwnProperty(key)) {
            let value = category[key];
            const box = document.createElement("div");
            box.classList.add('player-box');

            const categoryInfo = document.createElement("p");
            categoryInfo.textContent = key + " ";

            const spanValue = document.createElement("span");
            spanValue.textContent = "남은항목: " + value;
            categoryInfo.appendChild(spanValue);

            box.appendChild(categoryInfo);

            const spanCorrect = document.createElement("span");
            spanCorrect.classList.add("correct-answer");
            spanCorrect.textContent = "";
            box.appendChild(spanCorrect);

            all_play.appendChild(box);
        }
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
    setTimeout(() => {
        dummyplay();
    }, 700);
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
    elements.hintButton.addEventListener('click', () => {
        socket.emit('showHint', { "room": room_key });
    });
    // 키보드의 end 버튼을 눌러도 nextButton이 눌리게끔 하는 동작
    document.addEventListener('keydown', (event) => {
        if (event.key === 'End') {
            event.preventDefault();
            if (elements.nextButton.disabled === false) {
                voteSkip();
            }
        }
        if (event.key === 'Home') {
            event.preventDefault();
            elements.hintButton.click();
        }
    });
    elements.StartButton.addEventListener('click', () => {
        elements.nextButton.disabled = false;
        socket.emit('playTheGame', { "room_key": room_key, "selected_id": selectedId });
        videoOverlay.querySelector('span').innerText = "데이터를 불러오는 중입니다.";

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
        dummyplay();
    });
    socket.on("CheckPlayer", function(data) {
        const endTime = data['endTime'];
        if (player && player.playVideo) {
            socket.emit("ReadyPlayer", { "room_key": room_key, "endTime": endTime });
        } else {
            socket.emit("WaitPlay", { "room_key": room_key, "endTime": endTime });
        }
    })
    socket.on("reCheck", function(data) {
        const endTime = data['endTime'];
        if (player && player.playVideo) {
            socket.emit("ReadyPlayer", { "room_key": room_key, "endTime": endTime });
        } else {
            socket.emit("WaitPlay", { "room_key": room_key, "endTime": endTime });
        }
    });
    //다음 곡 진행
    socket.on('NextData', (data) => {
        const current_data = data['current_data'];
        const songTitle = document.getElementById('songTitle');
        const songArtist = document.getElementById('songArtist');
        if (!flag) {
            showSongInfo(current_data.title, current_data.song, current_answer_user, 2, null);
            setTimeout(() => {
                isAnswer = false;
                currentvideolink = data.youtubeLink;
                totalPlayers = data['totalPlayers'];
                clearInterval(gameTimerInterval);
                playvideo(currentvideolink);
                const all_play = document.getElementById("all_play");
                songTitle.innerHTML = "";
                songArtist.innerHTML = "";
                all_play.innerHTML = "";
                songHint.style.display = "none";
                songHint.innerText = "";
                elements.nextButton.style.display = "block";
                nextButton.disabled = false;
                updateVoteCountUI(0);
                showHostContent(true);
                flag = false;
            }, 4000);
        } else {
            isAnswer = false;
            currentvideolink = data.youtubeLink;
            totalPlayers = data['totalPlayers'];
            clearInterval(gameTimerInterval);
            playvideo(currentvideolink);
            const all_play = document.getElementById("all_play");
            songTitle.innerHTML = "";
            songArtist.innerHTML = "";
            all_play.innerHTML = "";
            songHint.style.display = "none";
            songHint.innerText = "";
            elements.nextButton.style.display = "block";
            nextButton.disabled = false;
            updateVoteCountUI(0);
            showHostContent(true);
            flag = false;
        }
    });


    //게임 끝났을 때 init
    socket.on('EndOfData', function(data) {
        // 기존의 게임 상태 및 UI 초기화 코드        
        clearInterval(gameTimerInterval);
        document.querySelector("div #videoFrame").remove();
        const all_play = document.getElementById("all_play");

        songTitle.innerHTML = "";
        all_play.innerHTML = "";
        songHint.innerText = "";
        songHint.style.display = "none";
        videoOverlay.style.display = 'flex';
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
        playerListGet(players);
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
        const map_name = data['map_data'][0]['MapName'];
        const Producer = data['map_data'][0]['MapProducer'];
        songTitle.innerText = `${map_name} \n 제작자 : ${Producer}`;
    });

    socket.on('correctAnswer', data => {
        console.log(isHost);
        isAnswer = false;
        nextButton.disabled = true;
        const left_answer = data["category_length"];
        const videolink = data["data"]["youtube_embed_url"];
        clearInterval(gameTimerInterval);
        setTimeout(() => {
            playvideo(videolink, data.data.endTime);
            if (document.querySelector("#NextVideo").checked) {
                voteSkip();
            }
            nextButton.disabled = false;
        }, 4000);
        showSongInfo(data.data.title, data.data.song, data.name, true, left_answer);

        flag = true;
    });

    socket.on('showAnswer', data => {
        const left_answer = data["category_length"];
        const category = data["answer_category"];
        showSongInfo(data.msg, null, data.name, false, left_answer, category);
    })
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
    socket.emit('create_room', { "room_key": room_key }, () => {
        socket.emit('join', { room_key: room_key }, () => {
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
                if (!game_status) {
                    if (mission) {
                        songTitle.innerText = `${mission[0]["MapName"]} \n 제작자 : ${mission[0]["MapProducer"]}`;
                    }
                } else {
                    songTitle.innerText = `로딩중입니다. 잠시만 기다려주세요.`;
                    console.log(songTitle.innerText);
                }
            });
        })
    });
    getidtourl();
};

document.querySelector("#disconect").addEventListener("click", () => {
    window.location = "/room_list";
})
socket.on("failed_user_change", () => {
    alert("현재 유저수가 변경할 인원수 보다 많습니다.");
});
// EndTimeTest(startTime, fendTime, totalSong, nowSong)
socket.on("PlayVideoReadyOk", (data) => {
    EndTimeTest(data['startTime'], data['endTime'], data['current_data']['totalSong'], data['current_data']['nowSong'], data['category']);
})
socket.on("user_change", (data) => {
    let count = data["count"];
    totalPlayers = data["totalPlayers"];
    updateVoteCountUI(count);
    if (count >= totalPlayers) {
        socket.emit("Skip", { "room_key": room_key });
    }
})

socket.on('host_updated', (data) => {
    // 방장 정보가 업데이트되었을 때 클라이언트에서 수행할 동작
    const game_status = data['game_status'];
    if (data.user === socket.id) {
        isHost = true; // 방장이면 isHost를 true로 설정
    }
    const player = document.querySelectorAll(".player-card");
    for(const elements of player)
    {
        if(elements.querySelector('.user_name').textContent == data["host"]["username"])
        {
            elements.querySelector('.host').style.display = "block";
        }
        else
        {
            elements.querySelector('.host').style.display = "none";
        }
        
    }
    showHostContent(game_status);
});

function showHostContent(game_status) {
    let kickButton = document.querySelectorAll(".kick_button");
    let HostButton = document.querySelectorAll(".give_host");
    if (isHost) {
        elements.room_setting.style.display = "block";
        elements.room_setting.disabled = false;
        for (const element of kickButton) {
            element.style.display = "block";
        }
        for (const element of HostButton) {
            element.style.display = "block";
        }
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
        for (const element of kickButton) {
            element.style.display = "none";
        }
        for (const element of HostButton) {
            element.style.display = "none";
        }
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
    $('#searchInput').on('keyup', function() {
        let value = $(this).val().toLowerCase();

        $('.igeo-card-modal').filter(function() {
            $(this).toggle($(this).find('.text-xl').text().toLowerCase().indexOf(value) > -1);
        });
    });
}

function populateModalWithMissionData(data) {
    const inputSubtitle = `<input type="text" id="searchInput" class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 border-gray-300 rounded-md leading-5 bg-gray-700 text-white placeholder-gray-400" placeholder="맵 이름으로 검색...">`;
    const mapItems = data.map(item => `
        <a href="#" class="block igeo-card-modal p-6 shadow-lg hover:shadow-xl rounded transition duration-300" data-id="${item.id}" onclick="selectAndClose(${item.id})">
            <p class="text-xl mb-4 truncate text-white">${item.MapName}</p>
            <div class="mb-4">
                <img src="${item.Thumbnail}" alt="${item.MapName}" class="mx-auto w-full h-56 object-cover rounded-lg" />
            </div>
            <p class="text-gray-400 mb-2">제작자: ${item.MapProducer}</p>
            <p class="text-indigo-600">곡수: ${item.MusicNum}곡</p>
        </a>`).join('');

    return `
        <div class="mx-auto max-w-7xl py-10 sm:px-6 lg:px-8">
            <h1 class="text-center text-3xl font-bold mb-8 text-gray-700">Select Map</h1>
            ${inputSubtitle}
            <button onclick="closeModal()" class="absolute top-2 right-2 text-white bg-red-500 rounded px-2 py-1 hover:bg-red-600 transition duration-300">닫기</button>
            <div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
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
    videoOverlay.style.display = 'flex';
}
socket.on('MapNotSelect', () => {
    alert("맵을 선택 후 시작해주세요");
});
socket.on('room_players_update', (data) => {
    if (data.room_key == room_key) {
        const item = document.createElement('div');
        if (data.color === 0)
            item.innerHTML = `<span class="font-semibold">${data.player}</span> ${data.msg}`;
        else
            item.innerHTML = `<span class="font-semibold text-green-500">${data.player}</span> ${data.msg}`;
        elements.messages.appendChild(item);
        elements.messages.scrollTop = elements.messages.scrollHeight;
        playerListGet(data.players, data.effect);
    }
});

function highlightCorrectPlayer(playerName) {
    // 소리 재생
    let correctVolume = $("#correctVolumeBar").val() / 200;

    $("#correctSound").prop("volume", correctVolume);
    $("#correctSound").get(0).play();

    // 모든 플레이어 카드를 순회
    $(".player-card").each(function() {
        // 해당 카드 내의 플레이어 이름이 정답과 일치하는지 확인
        const currentPlayerName = $(this).find("p.text-lg").text();

        if (currentPlayerName === playerName) {
            $(this).addClass("shine-animation");

            setTimeout(() => {
                $(this).removeClass("shine-animation");
            }, 1500);
        }
    });
}

function playerListGet(players, effect) {
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
        let userCard = document.createElement("div");
        let actionButtonsHTML = "";
        if (isHost) {
            actionButtonsHTML = session_id == key ? "" : `
            <div class="flex justify-between mt-4">
                <button id='${username}_kick_button' style="display:block" class='kick_button'>강퇴</button>
                <button id='${username}_give_host' style="display:block" class='give_host'>방장</button>
            </div>
        `;
        } else {
            actionButtonsHTML = session_id == key ? "" : `
            <div class="flex justify-between mt-4">
                <button id='${username}_kick_button' style="display:none" class='kick_button'>강퇴</button>
                <button id='${username}_give_host' style="display:none" class='give_host'>방장</button>
            </div>`;
        }
        userCard.classList.add(
            "player-card",
            "flex", "flex-col", "items-center", "justify-between", "bg-gray-700", "rounded-lg", "shadow-md", "my-2"
        );
        if (value.permissions >= 1) {
            if (value.profile_background != "") {
                userCard.style.backgroundSize = "cover";
                userCard.style.backgroundRepeat = "no-repeat";
                userCard.style.backgroundImage = `url("/${value['profile_background']}")`;
            }
        }
        let userInfoHTML = `
        <div class="space-y-3 text-center p-4 rounded-lg">
        <p class = "host" style="display:none">👑</p>
        <p class="font-semibold text-2xl text-white">${level}</p>
        <p class="user_name font-extrabold text-3xl text-white">${username}</p>
        <img src="${characterImageUrl}" alt="Character Image" class="mx-auto w-28 h-28 rounded-full shadow-xl"/>
        <p class="font-bold text-xl text-white">점수: <span class='font-bold ScoreSpan text-green-500'>${score}</span></p>
        ${actionButtonsHTML}
        </div>
        `;
        userCard.innerHTML = userInfoHTML;

        if (userCard.querySelector(".kick_button")) {
            userCard.querySelector(".kick_button").addEventListener("click", function() {
                if (confirm("강퇴하시겠습니까?")) {
                    socket.emit("kick", { "room_key": room_key, "user_name": username });
                }
            });
        }

        if (userCard.querySelector(".give_host")) {
            userCard.querySelector(".give_host").addEventListener("click", function() {
                if (confirm("호스트를 변경 하시겠습니까?")) {
                    socket.emit("host_change", { "room_key": room_key, "user_name": username });
                    isHost = false;
                }
            });
        }

        if (index % 2 === 0) {
            leftContainer.appendChild(userCard);
        } else {
            rightContainer.appendChild(userCard);
        }
        index++;
        // if (value.profile_background != "") {
        //     getCentralImageBrightness(`/${value['profile_background']}`, (brightness) => {
        //         if (brightness > 100) {
        //             userCard.querySelector(".font-semibold").classList.remove("text-white");
        //             userCard.querySelector(".font-bold").classList.remove("text-white");
        //             userCard.querySelector(".font-extrabold").classList.remove("text-white");

        //             userCard.querySelector(".font-semibold").classList.add("text-black");
        //             userCard.querySelector(".font-bold").classList.add("text-black");
        //             userCard.querySelector(".font-extrabold").classList.add("text-black");
        //         }
        //     });
        // }
    });
    if (effect)
        highlightCorrectPlayer(current_answer_user);
}

// function getCentralImageBrightness(imageSrc, callback) {
//     let img = new Image();
//     img.src = imageSrc;

//     img.onload = function() {
//         let canvas = document.createElement('canvas');
//         canvas.width = this.width;
//         canvas.height = this.height;

//         let ctx = canvas.getContext('2d');
//         ctx.drawImage(this, 0, 0);

//         let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//         let data = imageData.data;
//         let r, g, b, avg;

//         let colorSum = 0;
//         let totalPixels = 0;

//         // Check only the center 50% of the image
//         let quarterWidth = this.width / 4;
//         let quarterHeight = this.height / 4;
//         for (let x = quarterWidth; x < this.width - quarterWidth; x++) {
//             for (let y = quarterHeight; y < this.height - quarterHeight; y++) {
//                 let idx = (y * this.width + x) * 4;
//                 r = data[idx];
//                 g = data[idx + 1];
//                 b = data[idx + 2];

//                 avg = (r + g + b) / 3;
//                 colorSum += avg;
//                 totalPixels++;
//             }
//         }

//         let brightness = Math.floor(colorSum / totalPixels);
//         callback(brightness);
//     }
// }

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
    let room_max_human = $("#room_max_human").val();

    if (room_max_human > 8) {
        room_max_human = 8;
    } else if (room_max_human < 1) {
        room_max_human = 1;
    }
    if (room_name && room_name.trim() !== '') {
        socket.emit('room_setting_change', { room_key: room_key, room_name: room_name, room_password: room_password, room_max_human: room_max_human });
    } else if (room_name !== null) { // 취소 버튼을 클릭하지 않은 경우
        alert("올바른 방 이름을 입력해주세요.");
    }
});
socket.on("room_data_update_inroom", (data) => {
    const thisroom_key = data["room_key"];
    if (thisroom_key == room_key) {
        const room_name = data["room_name"];
        let room_max_human = data["room_max_human"];
        document.getElementById('room_name').innerText = room_name;
        document.getElementById("room_title").value = room_name;
        document.getElementById("room_password").value = data["room_password"];
        document.getElementById("room_max_human").value = room_max_human;
    }
});
socket.on("kick_player", (data) => {
    const user = data["user_name"];
    const item = document.createElement('div');
    item.innerHTML = `<span class="font-semibold">${user}</span> 님이 강퇴 당하였습니다.`;
    elements.messages.appendChild(item);
    elements.messages.scrollTop = elements.messages.scrollHeight;
    if (data["session_id"] == session_id) {
        window.location = "/kick_page";
    }
})
socket.on("set_session_id", (data) => {
    session_id = data["session_id"];
})

socket.on("duplicate", (data) => {
    alert(data.message);
    window.location = "/";
})