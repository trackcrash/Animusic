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
    let category = musicData[currentIndex]['category'];
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
    console.log(player);
    //videooverlay style block 추가
    videoOverlay.style.display = 'block';
}

function onPlayerReady(event, startTime, endTime, callback, category) {
    setVolume(document.querySelector("#VolumeBar").value);
    console.log("test");
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
            span.textContent = "";
            box.appendChild(span);
            all_play.appendChild(box);
        }
    }
    let answer_list = musicData[currentIndex]['answer_list'];
    for (let i = 0; i < answer_list.length; i++) {
        if (Array.isArray(answer_list[i]) && answer_list[i].length > 0 && !Array.isArray(answer_list[i][0])) {
            answer_list[i] = [answer_list[i]];
        }
    }
    const inner_p = all_play.querySelectorAll("p");
    for(let i = 0 ; i < inner_p.length; i++)
    {
        inner_p[i].querySelector("span").textContent = answer_list[i].length;
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
                const [is_correct, answer_category] = checkAnswer(content);
                if (is_correct) {
                    const [leftAnswer, category_length] = isGroupAnswered();
                    console.log(leftAnswer);
                    if (leftAnswer === 0) {
                        nextVideo(true);
                        showSongInfo(currentIndex,true,content,category_length)
                    } else {
                        showSongInfo(currentIndex,false,content,category_length)
                    }
                }
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
function isGroupAnswered() {
    let idx = currentIndex|| 0;
    const leftAnswer = [];

    if (idx < musicData[idx].length) {
        const music_data = musicData[idx];
        const categories = music_data.category || {};
        let remainingAnswers = 0;

        for (let section_idx = 0; section_idx < music_data.answer_list.length; section_idx++) {
            const category_names = Object.keys(categories);
            const category_name = category_names[section_idx];
            const category_value = parseInt(categories[category_name], 10);
            const matched_count = music_data.matched_answers[category_name] || 0;
            
            // Calculate remaining answers based on category value and matched count
            const remaining_for_this_category = category_value - matched_count;
            leftAnswer.push(remaining_for_this_category);

            // Update the total remaining answers
            remainingAnswers += remaining_for_this_category;
        }

        return [remainingAnswers, leftAnswer];
    }

    return [0, []];
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
        const categories = music_data.category || {};
        
        if (!('matched_answers' in music_data)) {
            music_data.matched_answers = {};
        }

        for (let section_idx = 0; section_idx < music_data.answer_list.length; section_idx++) {
            const group_answers = music_data.answer_list[section_idx];
            const category_names = Object.keys(categories);
            const category_name = category_names[section_idx];
            const category_value = parseInt(categories[category_name], 10);

            if (group_answers && Array.isArray(group_answers[0])) {
                for (let sub_idx = 0; sub_idx < group_answers.length; sub_idx++) {
                    const sub_group = group_answers[sub_idx];
                    if (sub_group.includes(answer)) {
                        if (music_data.matched_answers[category_name] >= category_value) {
                            return [false, null];
                        }

                        music_data.matched_answers[category_name] = (music_data.matched_answers[category_name] || 0) + 1;
                        group_answers[sub_idx] = [];
                        return [true, category_name];
                    }
                }
            } else {
                if (group_answers.includes(answer)) {
                    if (music_data.matched_answers[category_name] >= category_value) {
                        return [false, null];
                    }

                    music_data.matched_answers[category_name] = (music_data.matched_answers[category_name] || 0) + 1;
                    group_answers.splice(group_answers.indexOf(answer), 1);
                    return [true, category_name];
                }
            }
        }
    }
    return [false, null];
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