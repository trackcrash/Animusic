 let videoId = "";
 let startTime = "";
 let endTime = "";
 // 동영상 링크를 VideoId, startTime, endTime 을 분리하는 함수
function split_ytLink(ytLink) {
    const chanegedLink = ytLink.replace('?', '&');
    const split_text = chanegedLink.split(/(&v=|&start=|&end=|&t=|\.be\/)/);
    const find_1 = split_text.indexOf("&v=")
    const find_2 = split_text.indexOf("&t=")
    const find_3 = split_text.indexOf("&start=")
    const find_4 = split_text.indexOf("&end=")
    const find_5 = split_text.indexOf(".be/")
    if (find_1 > -1) {
        videoId = split_text[find_1 + 1];
    } else if (find_5 > -1) {
        videoId = split_text[find_5 + 1];
    } else {videoId = ""};
    if (find_2 > -1) {
        startTime = split_text[find_2 + 1];
    } else if (find_3 > -1) {
        startTime = split_text[find_3 + 1];
    } else {startTime = ""};
    if (find_4 > -1) {
        endTime = split_text[find_4 + 1];
    } else {endTime = ""};
    return {videoId: videoId, startTime: startTime.split('s')[0], endTime: endTime.split('s')[0]};
};

function loadVideo() {
    const ytLink = "https://www.youtube.com/watch?v=" + split_ytLink(document.getElementById("song-link-input").value).videoId;
    videoId = ytLink.split("v=")[1];
    const embedLink = "https://www.youtube.com/embed/" + videoId + "?autoplay=1";

    const iframe = document.createElement("iframe");
    iframe.src = embedLink;
    iframe.width = "1024";
    iframe.height = "720";
    iframe.allow = "autoplay";

    const videoContainer = document.querySelector(".video-container");
    videoContainer.innerHTML = "";
    videoContainer.appendChild(iframe);
}

document.getElementById('submission-form').addEventListener('submit', function(e) {
    e.preventDefault();
});

function createInfoItem(title, song, songURL, thumbnail, answer, hint, id) {
    const box = document.createElement('div');
    box.classList.add('box', 'grid-item');
    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'X';
    closeBtn.classList.add('close-btn', 'bg-red-500', 'text-white', 'rounded-full', 'p-1', 'absolute', 'top-2', 'right-2');
    closeBtn.onclick = function(event) {
        event.stopPropagation();
        box.remove();
    };
    box.appendChild(closeBtn);
    if (id) {
        box.setAttribute('data-id', id);
    }
    const titleElem = document.createElement('h3');
    titleElem.innerText = "제목: " + title;
    titleElem.classList.add('font-bold', 'mb-2');
    box.appendChild(titleElem);

    const songElem = document.createElement('p');
    songElem.innerText = "곡 이름: " + song;
    songElem.classList.add('mb-2');
    box.appendChild(songElem);

    const thumbnailElem = document.createElement('img');
    thumbnailElem.src = thumbnail;
    thumbnailElem.classList.add('w-24', 'h-24', 'mx-auto');
    box.appendChild(thumbnailElem);

    const songURLElem = document.createElement('input');
    songURLElem.type = 'hidden'; // 사용자에게는 보이지 않도록 hidden 유형으로 설정
    songURLElem.value = songURL;
    box.appendChild(songURLElem);

    const AnswerElem = document.createElement('h1');
    // 사용자에게는 보이지 않도록 hidden 유형으로 설정
    AnswerElem.innerText = answer;
    box.appendChild(AnswerElem);
    AnswerElem.style.display = "None";

    const HintElem = document.createElement('h2'); // 사용자에게는 보이지 않도록 hidden 유형으로 설정
    HintElem.innerText = hint;
    box.appendChild(HintElem);
    HintElem.style.display = "None";

    const MusicIdElem = document.createElement('h4'); // 사용자에게는 보이지 않도록 hidden 유형으로 설정
    MusicIdElem.innerText = hint;
    box.appendChild(MusicIdElem);
    MusicIdElem.style.display = "None";
    return box;
}
document.getElementById("register-btn").addEventListener("click", function(e)
{

    const title = document.getElementById('title-input').value;
    const song = document.getElementById('song-name-input').value;
    const songURL = document.getElementById('song-link-input').value;
    const thumbnailLink = "https://img.youtube.com/vi/" + videoId + "/sddefault.jpg";
    const answer = document.getElementById('answer-input').value;
    const hint = document.getElementById('hint-input').value;
    const id = document.getElementById('id-input').value;

    const inputList =  document.querySelectorAll('#submission-form input:not([id="MapName-input"])');
    const h4List = document.querySelectorAll('#grid-container .box h4');
    const boxList = document.querySelectorAll('#grid-container .box');

    if(id != null && id != "")
    {
        for(let i = 0; i < h4List.length; i++)
        {
            if(h4List[i].innerText == id)
            {
                boxList[i].querySelector('h3').innerText = "제목: " + title;
                boxList[i].querySelector('p').innerText = "곡 이름: " + song;
                boxList[i].querySelector('img').src = thumbnailLink;
                boxList[i].querySelector('input').value = songURL;
                boxList[i].querySelector('h1').innerText = answer;
                boxList[i].querySelector('h2').innerText = hint;
            }
        }
    }
    else
    {
        const box = createInfoItem(title, song, songURL, thumbnailLink, answer, hint, id);
        document.querySelector('.add_box').before(box);
        for(let i = 0; i <inputList.length; i++)
        {
            inputList[i].value = "";
        }
    }

})
document.getElementById('grid-container').addEventListener('click', function(e) {
    if (e.target.classList.contains('box') || e.target.closest('.box')) {
        const box = e.target.closest('.box');
        const title = box.querySelector('h3').innerText.split(": ")[1];
        const song = box.querySelector('p').innerText.split(": ")[1];
        const songURL = box.querySelector('input').value;
        const answer = box.querySelector('h1').innerText;
        const hint = box.querySelector('h2').innerText;
        const id = box.querySelector('h4').innerText;
        // 폼에 정보를 설정
        document.getElementById('title-input').value = title;
        document.getElementById('song-name-input').value = song;
        document.getElementById('song-link-input').value = songURL;
        document.getElementById('answer-input').value = answer;
        document.getElementById('hint-input').value = hint;
        document.getElementById('id-input').value = id;
        loadVideo();
        document.getElementById('register-btn').innerText = "수정하기";
    }
    else if(e.target.classList.contains('add_box'))
    {
        document.getElementById('title-input').value = "";
        document.getElementById('song-name-input').value = "";
        document.getElementById('song-link-input').value = "";
        document.getElementById('answer-input').value = "";
        document.getElementById('hint-input').value = "";
        document.getElementById('id-input').value = "";
        document.getElementById('register-btn').innerText = "등록하기";
    }
});
document.body.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('close-btn')) {
        event.target.parentElement.remove();
    }
});

document.getElementById('song-link-input').addEventListener('input', function() {
    loadVideo();
});

//save이벤트
function saveBtn()
{
    const items = document.querySelectorAll('.grid-item.box');
    let data = [];
    items.forEach(item => {
        const title = item.querySelector('h3').innerText.split(": ")[1];
        const song = item.querySelector('p').innerText.split(": ")[1];
        const thumbnail = item.querySelector('img').src;
        const songURL = "https://www.youtube.com/watch?v=" + split_ytLink(item.querySelector('input').value).videoId;
        const answer = item.querySelector('h1').innerText;
        const hint = item.querySelector('h2').innerText;

        data.push({
            title: title,
            song: song,
            thumbnail: thumbnail,
            songURL: songURL,
            answer: answer,
            hint: hint
        });
    });
    data.push({
        MapName: document.querySelector("#MapName-input").value,
        MapProducer: document.querySelector("#User_Name").innerHTML
    })
    data = JSON.stringify(data);
    $.ajax({
        type: "POST",
        url: "/submit-to-db",
        dataType: "json",
        contentType: "application/json",
        data: data,
        error: function(request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
        success: function(data) {
            console.log("통신데이터 값 : " + data);
            alert("등록 완료되었습니다.");
            location.reload();
        }
    });
}
//update이벤트
function UpdateBtn()
{
    const items = document.querySelectorAll('.grid-item.box');
    let data = [];

    items.forEach(item => {
        const title = item.querySelector('h3').innerText.split(": ")[1];
        const song = item.querySelector('p').innerText.split(": ")[1];
        const thumbnail = item.querySelector('img').src;
        const songURL = "https://www.youtube.com/watch?v=" + split_ytLink(item.querySelector('input').value).videoId;
        const answer = item.querySelector('h1').innerText;
        const hint = item.querySelector('h2').innerText;
        const id = item.querySelector('h4').innerHTML;
        if(id == "" || id == null)
        {
            data.push({
                title: title,
                song: song,
                thumbnail: thumbnail,
                songURL: songURL,
                answer: answer,
                hint: hint
            });
        }
        else
        {
            data.push({
                Music_id : id,
                title: title,
                song: song,
                thumbnail: thumbnail,
                songURL: songURL,
                answer: answer,
                hint: hint
            });
        }

    });
    data.push({
        MapName: document.querySelector("#MapName-input").value,
        MapProducer: document.querySelector("#User_Name").innerHTML,
        mission_Id : document.querySelector("#Mission_id").innerHTML
    })
    data = JSON.stringify(data);
    $.ajax({
        type: "POST",
        url: "/update-to-db",
        dataType: "json",
        contentType: "application/json",
        data: data,
        error: function(request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
        success: function(data) {
            console.log("통신데이터 값 : " + data);
            alert("등록 완료되었습니다.");
            location.reload();
        }
    });
}

function deleteBtn()
{

}
$("#update-btn").on("click", UpdateBtn);
$("#save-btn").on("click", saveBtn);

/* grid-container 안에 아이템이 3줄 이상일 경우 아이템의 높이를 줄이는 기능 */

// grid-container 가로 세로 길이를 px단위로 정의함
let container_width = document.getElementById('grid-container').clientWidth;
let container_height = document.getElementById('grid-container').clientHeight;

// container_width, container_height 를 재 정의함
function resize_variable_declaration() {
    container_width = document.getElementById('grid-container').clientWidth;
    container_height = document.getElementById('grid-container').clientHeight;
    // 여기에 .box가 3~4줄 이상인 경우( grid-container 스타일에 three-or-more-row 라는 클래스 추가
    if (Math.floor(container_item / Math.floor(container_width / box_width)) >= 3) {
        document.getElementById('grid-container').classList.add('three-or-more-row');
    } else {
        document.getElementById('grid-container').classList.remove('three-or-more-row');
    }
};

// 윈도우창 크기가 변경될 때 마다 실행됨
window.addEventListener('resize', resize_variable_declaration);

// grid-container 안의 아이템의 갯수를 정의함 ( + 1 은 추가버튼 아이템)
let container_item = document.getElementById('grid-container').querySelectorAll('.box').length + 1;

// grid-container 안의 아이템 갯수가 바뀔 때 마다 container_item을 재 정의 함
const observer = new MutationObserver(() => {
    container_item = document.getElementById('grid-container').querySelectorAll('.box').length + 1;
    // 여기에 .box가 3~4줄 이상인 경우( grid-container 스타일에 three-or-more-row 라는 클래스 추가
    if (Math.floor(container_item / Math.floor(container_width / box_width)) >= 3) {
        document.getElementById('grid-container').classList.add('three-or-more-row');
    } else {
        document.getElementById('grid-container').classList.remove('three-or-more-row');
    }
});

// 어떤 대상의 상태 변화를 감지하는 observer 의 설정값 (대상 : grid-container, childList - true : 대상 내용물의 갯수만 감지)
observer.observe(document.getElementById('grid-container'), {childList: true });

//grid-container 안의 아이템의 가로 세로 길이를 px단위로 정의함
let box_width = parseFloat(window.getComputedStyle(document.querySelector('.box')).getPropertyValue('width'));
let box_height = parseFloat(window.getComputedStyle(document.querySelector('.box')).getPropertyValue('height'));

// 공백없는 정답 추가제공하는 기능

const zero_space = document.getElementById('zero_space');
const answerInput = document.getElementById('answer-input');

function zero_space_text() {
    const inputText = answerInput.value;
    const answerList = inputText.split(',');
    const zeroSpaceList = answerList.map(text => text.replace(/\s+/g, ''));
    const uniqueList = [...new Set([...answerList, ...zeroSpaceList])];

    answerInput.value = uniqueList.join(',');
};

zero_space.addEventListener('click', zero_space_text);