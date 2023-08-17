//play test js --author: NewKyaru 15/08/2023
let totalPlayers = 0;
let musicData = [];
let currentIndex = 0;
let skipvote = 0;
let selectedId = 0;
const messages = document.getElementById('messages');
const inputMessage = document.getElementById('inputMessage');
const sendButton = document.getElementById('sendButton');
const videoOverlay = document.getElementById('videoOverlay');
const nextButton = document.getElementById('nextButton');
const MapSelect = document.getElementById('MapSelect');
const StartButton = document.getElementById('StartButton');
const urlSearchParams = new URLSearchParams(window.location.search);
const room_name = urlSearchParams.get('room_name');

sendButton.addEventListener('click', function() {
    sendMessage();
});

inputMessage.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

nextButton.addEventListener('click', function() {
    nextButton.disabled=true;
    voteSkip();
});





const socket = io.connect('http://' + document.domain + ':' + location.port);

StartButton.addEventListener("click", function()
{
    nextButton.disabled = false;
    currentIndex = 0;
    updateVoteCountUI(0);
    socket.emit('MissionSelect', selectedId);
})

socket.on("PlayGame", function(totalPlayer) {
    playvideo(currentIndex);
    totalPlayers = totalPlayer
    MapSelect.style.display = "none";
});
MapSelect.addEventListener("click",function()
{
    MapSelectPopUp();
})

function createMapSelectModal() {
    var modalHtml = '<div class="modal fade" id="missionTableModal" tabindex="-1" aria-labelledby="missionTableModalLabel" aria-hidden="true">';
    modalHtml += '<div class="modal-dialog">';
    modalHtml += '<div class="modal-content">';
    modalHtml += '<div class="modal-header">';
    modalHtml += '<h5 class="modal-title" id="missionTableModalLabel"></h5>';
    modalHtml += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>';
    modalHtml += '</div>';
    modalHtml += '<div class="modal-body">';
    modalHtml += '<div id="popup-content"></div>';
    modalHtml += '</div>';
    modalHtml += '</div>';
    modalHtml += '</div>';
    modalHtml += '</div>';

    // 이전 모달 요소 삭제
    $('#missionTableModal').remove();

    // 모달 요소 추가
    $('body').append(modalHtml);
}
function MapSelectPopUp() {
    createMapSelectModal();
    $('#missionTableModal').modal('show');
    
    // API 호출 및 데이터 표시
    $.ajax({
        url: '/api/get_mission_table',
        type: 'GET',
        success: function(data) {
            let tableHtml = '<table><thead><tr><th>ID</th><th>MapName</th><th>MapProducer</th><th>songNum</th></tr></thead><tbody>';
            for (let i = 0; i < data.length; i++) {
                tableHtml += '<tr data-id="' + data[i].id + '"><td>' + data[i].id + '</td><td>' + data[i].MapName + '</td><td>' + data[i].MapProducer + '</td><td>'+data[i].MusicNum+'</td></td></tr>';
            }
            tableHtml += '</tbody></table>';
            tableHtml += '<button id="saveButton">저장하기</button>';
            $('#popup-content').html(tableHtml);
            
            // 저장하기 버튼 클릭 시
            $('#saveButton').click(function() {
                selectedId = $('#popup-content table tr.selected').data('id');
                if (selectedId) {
                    // 여기에 선택한 ID에 대한 저장 동작을 추가하세요.
                    // 예: API 호출 등을 통해 선택한 ID를 서버에 전달하고 저장 작업 수행
                    console.log('Selected ID:', selectedId);
                    // 모달 닫기
                    $('#missionTableModal').modal('hide');
                }
            });
            
            // 테이블 행 클릭 시 선택 표시
            $('#popup-content table tbody tr').click(function() {
                $(this).toggleClass('selected').siblings().removeClass('selected');
            });
        },
        error: function(error) {
            console.error('Error fetching mission table data:', error);
        }
    });
}



//메시지전송 and 정답확인
function sendMessage() {
    const content = inputMessage.value.trim();
    if (content) {
        socket.emit('message', {
            content: content
        });
        inputMessage.value = '';
        checkAnswer(content);
    }
}
function playvideo(index) {
    console.log('musicData:', musicData[index]);
    console.log('currentIndex:', index);
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


//정답 출력용
function showSongInfo(index) {
    const songTitle = document.getElementById('songTitle');
    const songArtist = document.getElementById('songArtist');
    songTitle.innerText = musicData[index].title;
    songArtist.innerText = musicData[index].song;
}

// 사용자의 답안 확인
function checkAnswer(answer) {
    // 이미 해당 문제의 정답을 맞췄다면 체크하지 않음
    if (musicData[currentIndex].is_answered === "true") {
        return;
    }
    //안맞춰졌다면
    if (musicData[currentIndex].answer_list.includes(answer)) {
        musicData[currentIndex].is_answered = "true";
        socket.emit('correctAnswer', { index: currentIndex });
        playvideo(currentIndex);
        videoOverlay.style.display = 'none';
        showSongInfo(currentIndex);
    }
}

socket.on('MissionSelect_get', function(data) {
    // 서버로부터 받은 데이터 처리
    let receivedMusicData = data.get_music;
    musicData = [];
    for (let i = 0; i < receivedMusicData.length; i++) {
        musicData.push(receivedMusicData[i]);
    }
    console.log('Received saved data:', musicData, currentIndex);
    socket.emit("playTheGame", room_name);
    // 여기에서 받은 데이터를 원하는 방식으로 처리
});
//수신부
socket.on('correctAnswer', function(data) {
    if (data.index === currentIndex) {
        musicData[currentIndex].is_answered = "true";
        playvideo(currentIndex);
        document.getElementById('songTitle').style.disable = false;
        document.getElementById('songArtist').style.disable = false;
        videoOverlay.style.display = 'none';
        showSongInfo(currentIndex);
    }
});

//스킵 투표
function voteSkip() {
    console.log("스킵에 투표하셨습니다.")
    socket.emit('voteSkip', { index: currentIndex });
}

//투표수 계산
function requiredSkipVotes(totalPlayers) {
    if (totalPlayers <= 2) {
        return totalPlayers;
    } else if (totalPlayers <= 6) {
        return Math.ceil(totalPlayers / 2);
    } else {
        return Math.ceil(totalPlayers * 0.7);
    }
}


//수신부
socket.on('voteSkip', function(data) {
    if (data.index === currentIndex) {
        skipvote++;
        console.log(skipvote);
        const requiredVotes = requiredSkipVotes(totalPlayers);
        if (skipvote >= requiredVotes) {
            skipvote = 0;
            nextVideo();
        }
    }
});


//투표수 업데이트
function updateVoteCountUI(count) {
    const requiredVotes = requiredSkipVotes(totalPlayers);
    const skipVoteCountElement = document.getElementById('skipVoteCount');
    skipVoteCountElement.innerText = `현재 스킵 투표 수: ${count}/${requiredVotes}`;
}

// 다음 영상 재생
function nextVideo() {
    currentIndex += 1;
    skipvote = 0;
    updateVoteCountUI(0);
    const songTitle = document.getElementById('songTitle')
    const songArtist = document.getElementById('songArtist')
    
    if (currentIndex < musicData.length) {
        playvideo(currentIndex);
        songTitle.style.display = 'none';
        songArtist.style.display = 'none';
        songTitle.innerText = "";
        songArtist.innerText = "";
        nextButton.disabled = false;
    } else {
        songTitle.innerText = "";
        songArtist.innerText = "";
        currentIndex = 0;
        videoOverlay.style.display = 'block';
        console.log("게임이 끝났습니다.");
        MapSelect.style.display = "block";
        // playvideo(currentIndex);
        nextButton.disabled = true;
    }
}


window.onload = function() {

    if (room_name) {
        console.log(room_name);
        socket.emit('create_room', { room_name: room_name });
    }
};


window.addEventListener('beforeunload', () => {
    sessionStorage.removeItem('room_name');
});
//수신부
socket.on('nextVideo', function() {
    nextVideo();
});

socket.on('updateVoteCount', function(data) {
    if (data.index === currentIndex) {
        skipvote = data.count;
        updateVoteCountUI(skipvote);
    }
});

socket.on('connect', () => {
    console.log('Connected to server');
});


socket.on('user_disconnect', (data) => {
    console.log(data,'가Disconnected from the server');
    // 서버로 유저가 연결을 끊었다는 정보 전달
    socket.emit('request_room_players_update', { room_name: room_name});
});

socket.on('message', function(data) {
    const item = document.createElement('div');
    item.innerHTML = `<span class="font-semibold">${data.name}:</span> ${data.msg}`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});


