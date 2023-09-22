const messages = document.getElementById('messages');
const inputMessage = document.getElementById('inputMessage');
const sendButton = document.getElementById('sendButton');
const videoOverlay = document.getElementById('videoOverlay');
const nextButton = document.getElementById('nextButton');
let musicData = [];
let player;
let currentIndex = 0;
let GameTimer = 0;
let doMessage = true;
let skipWait = false;
let gameTimerInterval; //setInteval 이벤트
function playvideo(currentIndex, startTime = 0, endTime = 0, callback = null) {
    let videolink = musicData[currentIndex]['youtube_embed_url'];
    let category = JSON.parse(musicData[currentIndex]['category']);
    // musicData[currentIndex].answer_list = JSON.parse("["+musicData[currentIndex].answer_list+"]");
    let videoFrame = document.getElementById("videoFrame");
    const videoId = getYoutubeVideoId(videolink);
    if (!videoId) {
        console.error("Invalid YouTube URL provided");
        return;
    }
    if (player) {
        player.destroy();
        if (document.querySelector("div #videoFrame")) {
            document.querySelector("div #videoFrame").remove();
        }
        let videoFrame = document.createElement("div");
        videoFrame.id = "videoFrame";
        videoFrame.classList.add("absolute", "top-0", "left-0", "w-full", "h-full")
        document.getElementById("videoContainer").insertBefore(videoFrame, document.getElementById("videoOverlay"));
    }
    videoFrame = document.getElementById("videoFrame");
    player = new YT.Player(videoFrame, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        events: {
            'onReady': (event) => {
                // 비디오 정보를 가져와서 endTime을 설정합니다.
                onPlayerReady(event, startTime, endTime, callback , category); // endTime와 callback 전달
            },
        }
    });
    //videooverlay style block 추가
    videoOverlay.style.display = 'block';
}

function onPlayerReady(event, startTime, endTime, callback, category) {
    setVolume(document.querySelector("#VolumeBar").value);
    if (startTime > 0) {
        seekTo(startTime);
    }
    if (callback != null) {
        callback(startTime, endTime,category); // endTime을 콜백으로 전달
    }
}

function EndTimeTest(startTime, fendTime, category) {
    clearInterval(gameTimerInterval); // 올바른 인터벌 ID 사용하여 중지
    player.playVideo();
    skipWait = false;

    let endTime = fendTime;
    if (startTime > 0) {
        seekTo(startTime);
    }
    if (endTime == "stop") {
        return;
    }
    const all_play = document.getElementById("all_play");
    for (let key in category) {
        if (category.hasOwnProperty(key)) {
            let value = category[key];
            const box = document.createElement("p");
            box.textContent = key+" ";
            const span = document.createElement("span");
            span.textContent = value;
            box.appendChild(span);
            all_play.appendChild(box);
        }
    }

    if (endTime == 0 || endTime > player.getDuration()) {
        endTime = player.getDuration();
    }
    
    GameTimer = parseInt(endTime - startTime);
    gameTimerInterval = setInterval(() => {
        document.querySelector("#GameTimer span").innerText = GameTimer;
        if (GameTimer <= 0) {
            // socket.emit("TimeOut", { "room": room_name });
            clearInterval(gameTimerInterval); // 올바른 인터벌 ID 사용하여 중지
            nextVideo(true);
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
        if (!skipWait) {
            nextVideo(true);
        }
    }
});

nextButton.addEventListener('click', () => {
    if (!skipWait) {
        nextVideo(true);
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
                let [isAnswerd, categories]=checkAnswer(content);
                let leftAnswer = 0
                for(const data of categories)
                {
                    leftAnswer += data;
                }
                if (isAnswerd) {
                    if (leftAnswer === 0) {
                        if(document.querySelector("#NextVideo").checked)
                        {
                            if (!skipWait) {
                                nextVideo(true);
                            }
                        }else
                        {
                            nextVideo(false);
                            showSongInfo(currentIndex,true,content,categories)
                        }
                    } else {
                        showSongInfo(currentIndex,false,content,categories)
                    }
                }
            });
            inputMessage.value = '';
        }
        setTimeout(() => {
            doMessage = true;
        }, 200)
    }
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

function removeGroupByKeyword(data, keyword) {
    const hasKeyword = data.some(group => group.some(subGroup => subGroup.trim() === keyword));

    if (hasKeyword) {
        return data.filter(group => !group.some(subGroup => subGroup.trim() === keyword));
    } else {
        return data;
    }
}

// 사용자의 답안 확인
function checkAnswer(answer) {
    if (currentIndex < musicData.length) {
        const music_data = musicData[currentIndex];
        const all_play = document.getElementById('all_play').querySelectorAll("p");
        let categories =[];
        let isAnswerd = false;
        for(let i =0; i < all_play.length; i++)
        {
           categories[i] =parseInt(all_play[i].querySelector('span').textContent);
        }
        let i = 0;
        for (element of music_data["answer_list"]) {
            if (Array.isArray(element) && categories[i] != 0) {
                for (let j = 0; j < element.length; j++) {
                    if (element[j].indexOf(answer) !== -1) {
                        element.splice(j, 1);
                        categories[i]--;
                        isAnswerd = true;

                        break;
                    }
                }
            }
            i++;
        }
        return [isAnswerd, categories];   

    }
}

function showSongInfo(index, all, myanswer = null,category) {
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
        const answer_list = all_play.querySelectorAll("p");
        for(let i = 0; i < category.length; i++)
        {
            answer_list[i].querySelector("span").textContent = category[i];
        }
    }
}
// 다음 영상 재생
function nextVideo(skip) {
    skipWait = true;
    if(skip)
    {
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
    }else
    {
        playvideo(currentIndex, musicData[currentIndex]['startTime'], "stop", EndTimeTest);
        videoOverlay.style.display = "none";
    }
   
}

$(document).ready(() => {
    const missionId = new URLSearchParams(window.location.search).get('id');
    $.getJSON("/get-music-data?id=" + missionId, (data) => {
        musicData = data;
        playvideo(currentIndex, musicData[currentIndex]['startTime'], musicData[currentIndex]['endTime'], EndTimeTest);
        document.querySelector("#AllNumber").innerText = musicData.length;
    });
});
document.querySelector("#VolumeBar").addEventListener("input", () => {
    player.setVolume(document.querySelector("#VolumeBar").value);
})