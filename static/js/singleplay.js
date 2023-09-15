const messages = document.getElementById('messages');
const inputMessage = document.getElementById('inputMessage');
const sendButton = document.getElementById('sendButton');
const videoOverlay = document.getElementById('videoOverlay');
const nextButton = document.getElementById('nextButton');
let musicData = [];
let player;
let isPlayingVideo = true;
let currentIndex = 0;
let GameTimer = 0;
let doMessage = true;
let skipWait = false;
let gameTimerInterval; //setInteval 이벤트
function playvideo(currentIndex, startTime = 0, endTime = 0, callback = null) {
    if (isPlayingVideo) {
        // 이미 비디오를 재생 중인 경우 아무 작업도 하지 않음
        return;
    }
    let videolink = musicData[currentIndex]['youtube_embed_url'];
    // musicData[currentIndex].answer_list = JSON.parse("["+musicData[currentIndex].answer_list+"]");
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
            events: {
                'onReady': (event) => {
                    // 비디오 정보를 가져와서 endTime을 설정합니다.
                    onPlayerReady(event, startTime, endTime, callback); // endTime와 callback 전달
                },
            }
        });
    } else {
        // 기존 플레이어를 사용하여 비디오를 변경합니다.

        player.cueVideoById({ videoId: videoId, startSeconds: startTime });
        setTimeout(() => {
            onNextReady(startTime, endTime, callback)
        }, 1000)
    }
    //videooverlay style block 추가
    videoOverlay.style.display = '';
}

function onPlayerReady(event, startTime, endTime, callback) {
    setVolume(document.querySelector("#VolumeBar").value);
    event.target.playVideo();
    if (startTime > 0) {
        seekTo(startTime);
    }
    if (callback != null) {
        callback(startTime, endTime); // endTime을 콜백으로 전달
    }
}

function onNextReady(startTime, endTime, callback) {
    clearInterval(gameTimerInterval); // 올바른 인터벌 ID 사용하여 중지
    player.playVideo();
    skipWait = false;
    if (startTime > 0) {
        seekTo(startTime);
    }
    if (endTime == "stop") {
        isPlayingVideo = false;
        return;
    }
    if (callback != null) {
        callback(startTime, endTime); // endTime을 콜백으로 전달
    }
}

function EndTimeTest(startTime, fendTime) {
    let endTime = fendTime;
    if (endTime == 0 || endTime > player.getDuration()) {
        endTime = player.getDuration();
    }
    GameTimer = endTime - startTime;
    gameTimerInterval = setInterval(() => {
        document.querySelector("#GameTimer span").innerText = GameTimer;
        if (GameTimer <= 0) {
            // socket.emit("TimeOut", { "room": room_name });
            isPlayingVideo = false;
            clearInterval(gameTimerInterval); // 올바른 인터벌 ID 사용하여 중지
            nextVideo();
            return;
        }
        GameTimer--;
    }, 1000);
    document.querySelector("#nowNumber").innerText = currentIndex + 1;
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


sendButton.addEventListener('click', () => {
    sendMessage();
});

inputMessage.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// 키보드 버튼 'End' 키를 눌러도 스킵이 되게끔 하는 동작
document.addEventListener('keydown', (event) => {
    if (event.key === 'End') {
        isPlayingVideo = false;
        if (!skipWait) {
            nextVideo();
        }
    }
});

nextButton.addEventListener('click', () => {
    isPlayingVideo = false;
    if (!skipWait) {
        nextVideo();
    }
});
//메시지전송 and 정답확인
function sendMessage() {
    if (doMessage) {
        doMessage = false;
        const content = inputMessage.value.trim();
        if (content) {
            socket.emit('single_message', {
                content: content
            }, () => {
                checkAnswer(content);
            });
            inputMessage.value = '';
        }
        setTimeout(() => {
            doMessage = true;
        }, 200)
    }
    // const content = inputMessage.value.trim();
    // if (content) {
    //     socket.emit('single_message', {
    //         content: content
    //     });
    //     inputMessage.value = '';
    //     checkAnswer(content);
    // }
}

socket.on('single_message', (data) => {
    const item = document.createElement('div');
    if (data.name == '') {
        data.name = 'guest'
    }
    item.innerHTML = `<span class="font-semibold">${data.name}:</span> ${data.msg}`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

// function playvideo(index) {
//     let embedLink = musicData[index].youtube_embed_url;
//     const iframe = document.createElement("iframe");
//     iframe.src = embedLink;
//     iframe.allow = "autoplay";
//     iframe.width = "100%";
//     iframe.height = "100%";

//     const videoFrame = document.getElementById("videoFrame");
//     videoFrame.innerHTML = "";
//     videoFrame.appendChild(iframe);
//     videoOverlay.style.display = 'block';
// }

// 사용자의 답안 확인
function checkAnswer(answer) {
   const answerToFind = answer.trim();
    const answerList = musicData[currentIndex].answer_list;

    // 정답 확인
    const isCorrectAnswer = answerList.some(group => group.map(item => item.trim()).includes(answerToFind));

    if (isCorrectAnswer) {
        // 정답인 경우 추가 동작 수행
        musicData[currentIndex].answer_list = answerList.filter(group => !group.map(item => item.trim()).includes(answerToFind));
        if (musicData[currentIndex].answer_list == 0) {
            isPlayingVideo = false;
            playvideo(currentIndex, musicData[currentIndex].startTime, "stop", null);
            videoOverlay.style.display = 'none';
            showSongInfo(currentIndex,true);
            if (document.querySelector("#NextVideo").checked) {
                setTimeout(() => {
                    if (!skipWait) {
                        nextVideo();
                    }
                }, 1000);
            }
        }else
        {
            showSongInfo(currentIndex, false, answer);
        }
    }
}

function showSongInfo(index, all, myanswer = null) {
    const songTitle = document.getElementById('songTitle');
    const songArtist = document.getElementById('songArtist');
    const all_play = document.getElementById('all_play');
    if(all == true)
    {
        songTitle.innerText = "정답: " + musicData[index].title;
        songArtist.innerText = "곡 제목: " + musicData[index].song;    
        all_play.innerText = "모든 문제를 다 맞췄습니다.";
    }
    else
    {
        songTitle.innerText = "정답: " + myanswer;
        all_play.innerText = `${musicData[index].answer_list.length}문제 남았습니다.`;
    }
}
// 다음 영상 재생
function nextVideo() {
    skipWait = true;
    currentIndex += 1;
    if (currentIndex < musicData.length) {
        playvideo(currentIndex, musicData[currentIndex]['startTime'], musicData[currentIndex]['endTime'], EndTimeTest);
        const all_play = document.getElementById("all_play");
        all_play.innerText = "";
        songTitle.innerText = "";
        songArtist.innerText = "";
    } else {
        window.location.href = '/single_list';
    }
}

$(document).ready(() => {
    const missionId = new URLSearchParams(window.location.search).get('id');
    $.getJSON("/get-music-data?id=" + missionId, (data) => {
        musicData = data;
        isPlayingVideo = false;
        playvideo(currentIndex, musicData[currentIndex]['startTime'], musicData[currentIndex]['endTime'], EndTimeTest);
        document.querySelector("#AllNumber").innerText = musicData.length;
    });
});
document.querySelector("#VolumeBar").addEventListener("input", () => {
    player.setVolume(document.querySelector("#VolumeBar").value);
})