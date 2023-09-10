let videoId = "";
let modifyIndex = null;
modifyFunction();
function delete_mission()
{
    const urlParams = new URLSearchParams(window.location.search);

    // Get the 'id' parameter value
    const id = urlParams.get('id');

    if(confirm("정말 삭제하시겠습니까?"))
    {
        let delete_link = `/delete-mission?id=${id}`;
        location.href=delete_link;
    }
}

const delete_btn = document.getElementById('delete-btn');
if (delete_btn) {delete_btn.addEventListener("click", ()=> {delete_mission()})}

function zero_space_text(answer) {
    const answerList = answer.split(',').map(str => str.trim()).filter(Boolean);
    const zeroSpaceList = answerList.map(str => str.replace(/\s+/g, ''));

    const combinedList = answerList.concat(zeroSpaceList);
    const combinedSet = new Set(combinedList);

    return Array.from(combinedSet).join(',');
}
 // 유튜브 영상링크 videoId분리 함수(일반링크, 공유링크)
function split_ytLink(ytLink) {
    if (ytLink.split('v=')[1]) {return ytLink.split('v=')[1].substring(0, 11)}
    else {return ytLink.split('/')[3].substring(0, 11)}};

function loadVideo() {
    videoId = split_ytLink(document.getElementById("song-link-input").value);
    const ytLink = "https://www.youtube.com/watch?v=" + videoId;
    const embedLink = "https://www.youtube.com/embed/" + videoId + "?autoplay=1";

    const iframe = document.createElement("iframe");
    iframe.src = embedLink;
    iframe.width = "1024";
    iframe.height = "720";

    if (document.getElementById('autoplay-check').checked) {iframe.allow = "autoplay"}

    const videoContainer = document.querySelector(".video-container");
    videoContainer.innerHTML = "";
    videoContainer.appendChild(iframe);
}

document.getElementById('submission-form').addEventListener('submit', (e) => {
    e.preventDefault();
});

function modifyFunction() {
    const boxes = document.querySelectorAll('.box');
    const addBox = document.querySelector('.add_box');
    boxes.forEach((box, i) => {
        box.addEventListener('click', () => {
            const title = box.querySelector('h3')?.innerText;
            const song = box.querySelector('p')?.innerText;
            const songURL = box.querySelector('input')?.value;
            const answer = box.querySelector('h1')?.innerText;
            const hint = box.querySelector('h2')?.innerText;
            const id = box.querySelector('h4')?.innerText;
            const startTime = box.querySelector('h5')?.innerText;
            const endTime = box.querySelector('h6')?.innerText;

            // 정보를 설정하면서 선택적 체이닝 사용
            document.getElementById('title-input').value = title || ''; // 속성이 없을 때는 빈 문자열
            document.getElementById('song-name-input').value = song || '';
            document.getElementById('song-link-input').value = songURL || '';
            document.getElementById('answer-input').value = answer || '';
            document.getElementById('hint-input').value = hint || '';
            document.getElementById('startTime-input-h').value = Math.floor(parseInt(startTime) / 3600) || "";
            document.getElementById('startTime-input-m').value = Math.floor((parseInt(startTime) % 3600) / 60) || "";
            document.getElementById('startTime-input-s').value = Math.floor((parseInt(startTime) % 3600) % 60) || "";
            document.getElementById('startTime-input-ms').value = parseFloat(startTime) % 1 || "";
            document.getElementById('endTime-input-h').value = Math.floor(parseInt(endTime) / 3600) || "";
            document.getElementById('endTime-input-m').value = Math.floor((parseInt(endTime) % 3600) / 60) || "";
            document.getElementById('endTime-input-s').value = Math.floor((parseInt(endTime) % 3600) % 60) || "";
            document.getElementById('endTime-input-ms').value = parseFloat(endTime) % 1 || "";
            document.getElementById('id-input').value = id || '';
            loadVideo();
            document.getElementById('register-btn').innerText = "수정하기";

            modifyIndex = i;
        });
    });
    addBox.addEventListener('click', () => {
        const fields = [
            'title-input', 'song-name-input', 'song-link-input', 'answer-input', 'hint-input',
            'startTime-input-h', 'startTime-input-m', 'startTime-input-s', 'startTime-input-ms',
            'endTime-input-h', 'endTime-input-m', 'endTime-input-s', 'endTime-input-ms',
            'id-input'
        ];
        fields.forEach(field => {
            const inputElement = document.getElementById(field);
            if (inputElement) {
                inputElement.value = '';
            }
        });

        document.getElementById('register-btn').innerText = "등록하기";
        modifyIndex = null;
    });
}

function createInfoItem(title, song, songURL, thumbnail, answer, hint, startTime, endTime, id) {
    const box = document.createElement('div');
    box.classList.add('box');
    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'X';
    closeBtn.classList.add('close-btn');
    closeBtn.onclick = (event) => {
        event.stopPropagation();
        box.remove();
    };
    box.appendChild(closeBtn);
    if (id) {
        box.setAttribute('data-id', id);
    }
    const titleElem = document.createElement('h3');
    titleElem.innerText = title;
    titleElem.classList.add('font-bold', 'mb-1');
    box.appendChild(titleElem);

    const songElem = document.createElement('p');
    songElem.innerText = song;
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

    const startTimeElem = document.createElement('h5'); // 사용자에게는 보이지 않도록 hidden 유형으로 설정
    startTimeElem.innerText = startTime;
    box.appendChild(startTimeElem);
    startTimeElem.style.display = "None";

    const endTimeElem = document.createElement('h6'); // 사용자에게는 보이지 않도록 hidden 유형으로 설정
    endTimeElem.innerText = endTime;
    box.appendChild(endTimeElem);
    endTimeElem.style.display = "None";


    const MusicIdElem = document.createElement('h4'); // 사용자에게는 보이지 않도록 hidden 유형으로 설정
    MusicIdElem.innerText = id;
    box.appendChild(MusicIdElem);
    MusicIdElem.style.display = "None";
    return box;
};

document.getElementById("register-btn").addEventListener("click", (e) => {
    const title = document.getElementById('title-input').value;
    const song = document.getElementById('song-name-input').value;
    const songURL = document.getElementById('song-link-input').value;
    const thumbnailLink = "https://img.youtube.com/vi/" + videoId + "/sddefault.jpg";
    const answer = document.getElementById('answer-input').value;
    const hint = document.getElementById('hint-input').value;
    const id = document.getElementById('id-input').value;

    const startH = parseInt(document.getElementById('startTime-input-h').value || 0);
    const startM = parseInt(document.getElementById('startTime-input-m').value || 0);
    const startS = parseInt(document.getElementById('startTime-input-s').value || 0);
    const startMS = parseFloat("0." + document.getElementById('startTime-input-ms').value) || 0;

    const start_seconds = (startH * 3600) + (startM * 60) + startS + startMS;
    const startTime = String(start_seconds);

    const endH = parseInt(document.getElementById('endTime-input-h').value || 0);
    const endM = parseInt(document.getElementById('endTime-input-m').value || 0);
    const endS = parseInt(document.getElementById('endTime-input-s').value || 0);
    const endMS = parseFloat("0." + document.getElementById('endTime-input-ms').value) || 0;

    const end_seconds = (endH * 3600) + (endM * 60) + endS + endMS;
    let endTime = String(end_seconds);

    if (start_seconds >= end_seconds) {endTime = '0'};

    const inputList =  document.querySelectorAll('#submission-form input:not([id="MapName-input"])');
    const h4List = document.querySelectorAll('#grid-container .box h4');
    const boxList = document.querySelectorAll('#grid-container .box');

    if(id != null && id != "")
    {
        for(let i = 0; i < h4List.length; i++)
        {
            if(h4List[i].innerText == id)
            {
                changeBox(boxList[i], title, song, songURL, thumbnailLink, answer, hint, startTime, endTime)
            }
        }
    }
    else
    {
        if(modifyIndex != null)
        {
            for(let i = 0; i < boxList.length; i++)
            {
                if(i == modifyIndex)
                {
                    changeBox(boxList[i], title, song, songURL, thumbnailLink, answer, hint, startTime, endTime)

                }
            }
        }else
        {
            const box = createInfoItem(title, song, songURL, thumbnailLink, answer, hint, startTime, endTime, id);
            document.querySelector('.add_box').before(box);
            for(const element of inputList)
            {
                element.value = "";
            }
            modifyFunction();
        }
    }
});

function changeBox(box,title, song, songURL, thumbnail, answer, hint, startTime, endTime) {
    box.querySelector('h3').innerText = title;
    box.querySelector('p').innerText = song;
    box.querySelector('img').src = thumbnail;
    box.querySelector('input').value = songURL;
    box.querySelector('h1').innerText = answer;
    box.querySelector('h2').innerText = hint;
    box.querySelector('h5').innerText = startTime;
    box.querySelector('h6').innerText = endTime;
}

document.body.addEventListener('click', (event) => {
    if (event.target && event.target.classList.contains('close-btn')) {
        event.target.parentElement.remove();
    }
});

document.getElementById('song-link-input').addEventListener('input', () => {
    loadVideo();
});

// .box의 내용물을 정의하는 함수
function box_element(item) {
    const title = item.querySelector('h3').innerText;
    const song = item.querySelector('p').innerText;
    const thumbnail = item.querySelector('img').src;
    const songURL = "https://www.youtube.com/watch?v=" + split_ytLink(item.querySelector('input').value);
    let answer = item.querySelector('h1').innerText;

    answer = zero_space_text(answer);

    const id = item.querySelector('h4').innerHTML || null;

    let hint = null, startTime = null, endTime = null;

    if (item.querySelector('h2').innerText !== '') {hint = item.querySelector('h2').innerText};
    if (parseFloat(item.querySelector('h5').innerText)) {startTime = item.querySelector('h5').innerText};
    if (parseFloat(item.querySelector('h6').innerText)) {endTime = item.querySelector('h6').innerText};

    return {
        title: title,
        song: song,
        thumbnail: thumbnail,
        songURL: songURL,
        answer: answer,
        id: id,
        hint: hint,
        startTime: startTime,
        endTime: endTime
    }
}

//upload이벤트 (SaveBtn, UpdateBtn 통합)
function UploadBtn(event) {
    const items = document.querySelectorAll('.box');
    let upload_url, data = [];
    items.forEach(item => {

        let {id, title, song, thumbnail, songURL, answer, hint, startTime, endTime} = box_element(item);

        let song_entry = {
            title: title,
            song: song,
            thumbnail: thumbnail,
            songURL: songURL,
            answer: answer,
            hint: hint,
            startTime: startTime,
            endTime: endTime
        };

        if(id == "" || id == null) {
            data.push(song_entry);
        } else {
            song_entry.Music_id = id;
            data.push(song_entry);
        };
    });

    let map_entry = {
        MapName: document.querySelector("#MapName-input").value,
        MapProducer: document.querySelector("#User_Name").innerHTML,
        Thumbnail: data[0].thumbnail || 'basic'
    };

    if (event.target.id === "save-btn") {
        data.push(map_entry);

        upload_url = "/submit-to-db";

    } else if (event.target.id === "update-btn") {
        map_entry.mission_Id = document.querySelector("#Mission_id").innerHTML;
        data.push(map_entry);

        upload_url = "/update-to-db";

    };
    data = JSON.stringify(data);
    $.ajax({
        type: "POST",
        url: upload_url,
        dataType: "json",
        contentType: "application/json",
        data: data,
        error: (request, status, error) => {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
        success: (data) => {
            alert("등록 완료되었습니다.");
            window.location.href = '/Map'
        }
    });
};

$("#update-btn").on("click", UploadBtn);
$("#save-btn").on("click", UploadBtn);
/* grid-container 안에 아이템이 3줄 이상일 경우 아이템의 높이를 줄이는 기능 */

//.box 갯수에 따른 .box 높이 조정 함수
function resize_variable_declaration() {

    //grid-container 안의 아이템의 가로 세로 길이를 px단위로 정의함
    if (!document.querySelector('.box')) {return};

    let container_width = document.getElementById('grid-container').clientWidth;
    let container_item = document.getElementById('grid-container').querySelectorAll('.box').length + 1;

    let box_width = window.getComputedStyle(document.querySelector('.box')).getPropertyValue('width');

    // 여기에 .box가 3~4줄 이상인 경우 .box의 height를 60으로 아니면 175px로 변경
    if (Math.floor(container_item / Math.floor(container_width / parseFloat(box_width))) >= 3) {
        document.querySelectorAll('.box').forEach(box_element => {
            box_element.style.height = '60px';
        });
    } else {
        document.querySelectorAll('.box').forEach(box_element => {
            box_element.style.height = '';
        });
    }
};

// 윈도우창 크기가 변경되거나 .box 가 삭제 또는 추가될 때 실행
window.addEventListener('resize', resize_variable_declaration);
document.getElementById('grid-container').addEventListener('DOMNodeInserted', resize_variable_declaration);
document.getElementById('grid-container').addEventListener('DOMNodeRemoved', resize_variable_declaration);

/*----------------------------------------------------------*/

// 시작시간, 종료시간 숫자입력 고정 및 최대값 고정
function number_max(inputdata) {
    const time_max = inputdata.getAttribute('max');
    let time_data = inputdata.value;

    time_data = time_data.replace(/[^0-9]/g, '');
    inputdata.value = time_data;
    if (parseInt(time_data) > parseInt(time_max)) {time_data = time_max};

    inputdata.value = time_data;
};

// 입력 란에서 Enter 또는 Tab을 누를경우 다음 입력란으로 커서 이동
const formInputs = document.getElementById('submission-form').querySelectorAll('input');

formInputs.forEach((input, index) => {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (index === formInputs.length - 1) {formInputs[2].focus()}
            else {formInputs[index + 1].focus()};
        };
        if (e.key === 'Tab' && index === formInputs.length - 1) {formInputs[1].focus()};
    });
});

// 제목 입력 란 고정
const MapName_label = document.getElementById('MapName-label');
const MapName_insert = document.getElementById('MapName-insert');
document.getElementById('MapName-insert').addEventListener('click', () => {
    if (document.getElementById('MapName-input').classList.contains('hidden')) {
        document.getElementById('MapName-input').classList.remove('hidden');
        MapName_insert.classList.remove('w-full');
        MapName_insert.classList.add('w-1/2');
        MapName_insert.innerText = '제목 저장하기';
    } else {
        document.getElementById('MapName-input').classList.add('hidden');
        MapName_insert.classList.remove('w-1/2');
        MapName_insert.classList.add('w-full');
        MapName_insert.innerText = '제목 변경하기';
        MapName_label.textContent = "맵 이름: " + document.getElementById('MapName-input').value;
    };
});