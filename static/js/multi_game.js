//play test js --author: NewKyaru 15/08/2023
$(document).ready(function() {
    //id는 다른 방식으로 받을 예정
    const missionId = new URLSearchParams(window.location.search).get('id');
    $.getJSON("/get-music-data?id=" + missionId, function(data) {
        musicData = data;
        updateVoteCountUI(0);
        playvideo(currentIndex);
    });
});
const messages = document.getElementById('messages');
const inputMessage = document.getElementById('inputMessage');
const sendButton = document.getElementById('sendButton');
const videoOverlay = document.getElementById('videoOverlay');
const nextButton = document.getElementById('nextButton');
const room_name = sessionStorage.getItem('room_name');
let totalPlayers = 2;
let musicData = [];
let currentIndex = 0;
sendButton.addEventListener('click', function() {
    sendMessage();
    console.log('dd');
});

inputMessage.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

nextButton.addEventListener('click', function() {
    nextVideo();
});
const socket = io.connect('http://' + document.domain + ':' + location.port);

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

//수신부
socket.on('correctAnswer', function(data) {
    if (data.index === currentIndex) {
        musicData[currentIndex].is_answered = "true";
        playvideo(currentIndex);
        videoOverlay.style.display = 'none';
        showSongInfo(currentIndex);
    }
});

//스킵 투표
function voteSkip() {
    socket.emit('voteSkip', { index: currentIndex });
    nextButton.disabled = true;
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
    updateVoteCountUI(skipvote);

    if (currentIndex < musicData.length) {
        playvideo(currentIndex);
        document.getElementById('songTitle').style.display = 'none';
        document.getElementById('songArtist').style.display = 'none';
        nextButton.disabled = false;
    } else {
        currentIndex = 0;
        videoOverlay.style.display = 'block';
        playvideo(currentIndex);
        nextButton.disabled = false;
    }
}


window.onload = function() {
    const room_name = sessionStorage.getItem('room_name');
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

socket.on('connect', () => {
    console.log('Connected to server');
});
socket.on('message', function(data) {
    const item = document.createElement('div');
    item.innerHTML = `<span class="font-semibold">${data.name}:</span> ${data.msg}`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});


