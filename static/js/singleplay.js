const messages = document.getElementById('messages');
const inputMessage = document.getElementById('inputMessage');
const sendButton = document.getElementById('sendButton');
const videoOverlay = document.getElementById('videoOverlay');
const nextButton = document.getElementById('nextButton');
let musicData = [];
let currentIndex = 0;

sendButton.addEventListener('click', function() {
    sendMessage();
});

inputMessage.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// 키보드 버튼 'End' 키를 눌러도 스킵이 되게끔 하는 동작
document.addEventListener('keydown', (event) => {
    if (event.key === 'End') {
        nextVideo();
    }
});

nextButton.addEventListener('click', function() {
    nextVideo();
});
//메시지전송 and 정답확인
function sendMessage() {
    const content = inputMessage.value.trim();
    if (content) {
        socket.emit('single_message', {
            content: content
        });
        inputMessage.value = '';
        checkAnswer(content);
    }
}

socket.on('single_message', function(data) {
    const item = document.createElement('div');
    item.innerHTML = `<span class="font-semibold">${data.name}:</span> ${data.msg}`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

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

// 사용자의 답안 확인
function checkAnswer(answer) {
    const trimmedAnswerList = musicData[currentIndex].answer_list.map(answer => answer.trim());
    if (trimmedAnswerList.includes(answer)) {
        playvideo(currentIndex);
        videoOverlay.style.display = 'none';
        showSongInfo(currentIndex);
    }
}

function showSongInfo(index) {
    const songTitle = document.getElementById('songTitle');
    const songArtist = document.getElementById('songArtist');
    songTitle.innerText = "정답: " + musicData[index].title;
    songArtist.innerText = "곡 제목: " + musicData[index].song;
}
// 다음 영상 재생
function nextVideo() {
    currentIndex += 1;
    if (currentIndex < musicData.length) {
        playvideo(currentIndex);
        songTitle.innerText = "";
        songArtist.innerText = "";
    } else {
        window.location.href = '/single_list';
    }
}

$(document).ready(function() {
    const missionId = new URLSearchParams(window.location.search).get('id');
    $.getJSON("/get-music-data?id=" + missionId, function(data) {
        musicData = data;

        playvideo(currentIndex);
    });
});