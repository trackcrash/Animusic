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
    if (musicData[currentIndex].answer_list.includes(answer)) {
        playvideo(currentIndex);
        videoOverlay.style.display = 'none';
    }
}

// 다음 영상 재생
function nextVideo() {
    currentIndex += 1;
    if (currentIndex < musicData.length) {
        playvideo(currentIndex);
    } else {
        // 끝났을 때 처리 임시로 그냥냅둠
        currentIndex = 0;
        videoOverlay.style.display = 'block';
        playvideo(currentIndex);
    }
}

$(document).ready(function() {
    const missionId = new URLSearchParams(window.location.search).get('id');
    $.getJSON("/get-music-data?id=" + missionId, function(data) {
        musicData = data;

        playvideo(currentIndex);
    });
});