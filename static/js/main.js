let videoId = "";
let modifyIndex = null;
modifyFunction();
window.onbeforeunload = function(event) {
  // 확인 대화상자를 표시하고 사용자의 응답을 저장합니다.
  var userResponse = confirm('페이지를 나가시겠습니까? 저장하지 않은 변경 사항이 있을 수 있습니다.');

  // 사용자가 '확인'을 클릭한 경우에만 경고 메시지를 표시하도록 합니다.
  if (!userResponse) {
    event.returnValue = '페이지를 나가지 않겠습니다.';
  }
}
function delete_mission()
{
    const urlParams = new URLSearchParams(window.location.search);

    // Get the 'id' parameter value
    const id = urlParams.get('id');

    if(confirm("정말 삭제하시겠습니까?"))
    {
        let delete_link = `/delete-mission?id=${id}`;
        window.onbeforeunload = "";
        location.href=delete_link;
    }
}

const delete_btn = document.getElementById('delete-btn');
if (delete_btn) {delete_btn.addEventListener("click", ()=> {delete_mission()})}

function zero_space_text(answer) {
    const text_list = [];
    let answertext_list = '', element_str = '', element_switch = 0;
    Array.from(answer).forEach(element => {
        if (element === "[") {
            element_switch = 1;
            return
        } else if (element === "]") {
            element_switch = 0
            text_list.push(element_str);
            element_str = '';
            return
        }
        if (element_switch > 0) {element_str += element};
    });
    text_list.forEach(text => {
        const answerList = text.split(',').map(str => str.trim()).filter(Boolean);
        const zeroSpaceList = answerList.map(str => str.replace(/\s+/g, ''));

        const combinedList = answerList.concat(zeroSpaceList);
        const combinedSet = new Set(combinedList);

        answertext_list += "[" + Array.from(combinedSet).join(',') + "],"
    })
    return answertext_list.slice(0, -1);
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
            const h1text = box.querySelector('h1')?.innerText;
            let answer = [];
            let text_switch, textlist = "";
            for (let text_element of h1text) {
                if (text_element === '[') {
                    text_switch = 1;
                    continue
                } else if (text_element === ']') {
                    text_switch = 0;
                    answer.push(textlist);
                    textlist = "";
                    continue
                }
                if (text_switch > 0) {textlist += text_element};
            }

            const hint = box.querySelector('h2')?.innerText;
            const id = box.querySelector('h4')?.innerText;
            const startTime = box.querySelector('h5')?.innerText;
            const endTime = box.querySelector('h6')?.innerText;
            let answer_input = document.querySelectorAll(".answer_input");

            // 정보를 설정하면서 선택적 체이닝 사용
            document.getElementById('title-input').value = title || ''; // 속성이 없을 때는 빈 문자열
            document.getElementById('song-name-input').value = song || '';
            document.getElementById('song-link-input').value = songURL || '';

            // answer의 0번째 인덱스를 제거하고 그 값을 answer-input 에 할당
            document.querySelector('.answer_input').value = answer.shift() || '';
            document.querySelector('.answer_input').style.display = 'block';

            // 이전의 데이터로 인해 생겼던 중복정답 요소를 모두 제거 (input, button)
            document.querySelectorAll('.answer_input[data-index]:not([data-index="0"])').forEach(input_element => {
                input_element.remove();
            })
            document.querySelectorAll('.answer_list[data-index]:not([data-index="0"])').forEach(button_element => {
                button_element.remove();
            })

            // 요소가 남아있다면 (중복 정답이였던 경우) 남은 요소 생성

            if (answer.length > 0) {
                let answer_index = 0;
                answer.forEach(answer_element => {
                    answer_index++;

                    // 버튼 생성
                    const newButton = document.createElement('button');
                    newButton.dataset.index = document.querySelectorAll('.answer_list').length;
                    newButton.className = 'answer_list';
                    newButton.setAttribute('onclick', 'focus_answer_list(event.target.dataset.index)');
                    newButton.textContent = answer_index + 1;

                    // input 생성
                    const newInput = document.createElement('input');
                    newInput.dataset.index = document.querySelectorAll('.answer_input').length;
                    newInput.className = 'w-full answer_input';
                    newInput.value = answer_element;
                    newInput.style.display = 'none';

                    // 문서에 추가
                    document.getElementById('answer_listAll').insertBefore(newButton, document.getElementById("add_answerlist"));
                    document.getElementById('submission-form').insertBefore(newInput, document.querySelector('[for="hint-input"]'));
                })
            }

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
            try {
                loadVideo();
            } catch (error) {};
            document.getElementById('register-btn').innerText = "곡 수정하기";

            modifyIndex = i;
        });
    });

    addBox.addEventListener('click', () => {

        document.querySelectorAll('.answer_input[data-index]:not([data-index="0"])').forEach(input_element => {
            input_element.remove();
        });
        document.querySelectorAll('.answer_list[data-index]:not([data-index="0"])').forEach(button_element => {
            button_element.remove();
        });

        document.querySelector('.answer_input').value = '';

        const fields = [
            'title-input', 'song-name-input', 'song-link-input', 'hint-input',
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

    const AnswerElem = document.createElement('h1'); // 사용자에게는 보이지 않도록 hidden 유형으로 설정
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

    let answer = "";
    const answer_input = document.querySelectorAll(".answer_input");
    for (const element of answer_input) {
        if (element.value) {answer += "[" + element.value + "],"};
    };
    answer = answer.slice(0, -1);

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
    box.querySelector('h2').innerText = hint;
    box.querySelector('h5').innerText = startTime;
    box.querySelector('h6').innerText = endTime;
    box.querySelector('h1').innerText = answer;
}

document.body.addEventListener('click', (event) => {
    if (event.target && event.target.classList.contains('close-btn')) {
        event.target.parentElement.remove();
    }
});

document.getElementById('song-link-input').addEventListener('input', () => {
    loadVideo();
});

// .box의 내용물 서버로 전송하기위한 변환작업
function box_element(item) {
    const title = item.querySelector('h3').innerText;
    const song = item.querySelector('p').innerText;
    const thumbnail = item.querySelector('img').src;
    let videoid = null, songURL = null, hint = null, startTime = null, endTime = null;
    try {
        videoid = split_ytLink(item.querySelector('input').value);
        songURL = "https://www.youtube.com/watch?v=" + videoid;
    } catch (error) {};
    const answer = item.querySelector('h1').innerText;
    const id = item.querySelector('h4').innerHTML || null;

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
        endTime: endTime,
        videoid: videoid
    }
}

// videoid 유효성 검사
async function checking_videoid(check_videoid_list, items) {
    const videoid_checking = await fetch('/check_videoid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(check_videoid_list)
    });

    //유효성 검사결과를 수신

    const videoid_check_result = await videoid_checking.json();

    // 유효하지 못한 링크 발견 시 해당 곡 정보를 담은 텍스트파일을 다운로드 시킴
    if (videoid_check_result.length > 0) {
        let textdata = "";

        alert('재생되지 않는 영상링크가 발견되었습니다.');
        alert('해당링크의 곡정보가 담긴 파일을 다운로드합니다.');

        for (let videoid of videoid_check_result) {
            const item_index = check_videoid_list.indexOf(videoid);
            items[item_index].classList.add("info-omission");
            textdata += String(item_index + 1) + ". ";
            textdata += items[item_index].querySelector('p').innerText + "\n";
        }

        const blob = new Blob([textdata], { type: 'text/plain' });
        const link = document.createElement('a');

        link.href = URL.createObjectURL(blob);
        link.download = '잘못된 링크를 가진 곡 목록.txt';
        link.click();

        URL.revokeObjectURL(link.href);
    };
    return videoid_check_result;
};

//upload이벤트 (SaveBtn, UpdateBtn 통합)
async function UploadBtn(event) {
    const items = document.querySelectorAll('.box');

    let upload_url, data = [];

    if (items.length < 1) {
        alert("곡을 등록하여 추가 후 이용해주세요.");
        return
    };

    if (!document.querySelector("#MapName-input").value) {
        alert("맵 제목을 입력해주세요.");
        return
    }

    let items_index = 0;
    let error_items = [];
    let check_videoid_list = [];
    items.forEach(item => {
        items_index++;
        item.classList.remove('info-omission');
        let {id, title, song, thumbnail, songURL, answer, hint, startTime, endTime, videoid} = box_element(item);
        // videoid 유효성을 체크하기 위해서 push
        check_videoid_list.push(videoid);

        // 필수 입력사항 없는 곡을 error_items에 push
        if (!(title && song && songURL && answer)) {
            error_items.push(items_index);
        }

        let song_entry = {
            title: title,
            song: song,
            thumbnail: thumbnail,
            songURL: songURL,
            answer: zero_space_text(answer),
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

    // 누락된 곡이 있다면 해당 .box 표시해주고 return
    if(error_items.length > 0) {
        alert("정보가 누락된 곡이 있습니다.");
        error_items.forEach(items_number => {
            items[items_number - 1].classList.add('info-omission');
        })
        return
    }

    // videoid 유효성 체크 동작 (함수에서 발견되면 목록 다운로드 시키고 결과를 return함)
    const check_result = await checking_videoid(check_videoid_list, items);

    // 그래서 return 값이 있다면 upload 이벤트 취소
    if (check_result.length > 0) {return};

    let map_entry = {
        MapName: document.querySelector("#MapName-input").value,
        MapProducer: document.querySelector("#User_Name").innerHTML,
        Description: descript_textfield.value,
        ActiveSetting: document.querySelector('.active-check i').classList,
        Thumbnail: data[0].thumbnail || 'basic',
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
            window.onbeforeunload = "";
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
const MapName_insert = document.getElementById('MapName-insert');

MapName_insert.addEventListener('click', () => {
    const MapName_label = document.getElementById('MapName-label');
    const MapName_input = document.getElementById('MapName-input')
    if (MapName_input.classList.contains('hidden')) {
        MapName_insert.innerText = '제목 저장';
        MapName_label.style.display = 'none';
    } else {
        MapName_insert.innerText = '제목 변경';
        MapName_label.style.display = '';
        MapName_label.textContent = MapName_input.value;
    };
    MapName_insert.classList.toggle('w-full');
    MapName_insert.classList.toggle('w-1/2');
    MapName_input.classList.toggle('hidden');
});

// 맵 공개/비공개 유무 설정
const active_check = document.querySelector('.active-check');
const active_check_icon = active_check.querySelector('i');

active_check.addEventListener('click', ()=> {
    active_check_icon.classList.toggle('fa-lock-open');
    active_check_icon.classList.toggle('fa-lock');
    active_check_icon.classList.remove('1');
});

// 중복 정답 추가 기능
document.getElementById("add_answerlist").addEventListener("click", () => {
    const answer_listAll = document.getElementById("answer_listAll");
    const answer_list = document.querySelectorAll(".answer_list");
    const answer_input = document.querySelectorAll(".answer_input");
    const addanswerList =document.getElementById("add_answerlist");
    // 새 버튼 생성 및 설정
    const button = document.createElement("button");
    button.dataset.index = answer_list.length;
    button.className = "answer_list";
    button.onclick = (e) => {focus_answer_list(e.target.dataset.index)};
    button.textContent = answer_input.length + 1;

    // 새로운 입력 필드 생성 및 설정
    const new_answer_input = document.createElement("input");
    new_answer_input.dataset.index = answer_input.length;
    new_answer_input.className = "w-full answer_input";
    new_answer_input.style.display = "none";

    // 버튼과 입력 필드를 문서에 추가
    answer_listAll.insertBefore(button,addanswerList);
    answer_input[answer_input.length - 1].after(new_answer_input);
  });

// 중복 정답 제거 버튼 기능
document.getElementById("delete_answerlist").addEventListener("click", () => {
    let answerlists = document.querySelectorAll('.answer_list');
    let answerinputs = document.querySelectorAll('.answer_input');

    let last_answerlist = answerlists[answerlists.length - 1];
    let last_answerinput = answerinputs[answerinputs.length - 1];

    if (answerlists.length > 1 && answerinputs.length > 1) {
        last_answerlist.remove();
        last_answerinput.remove();
    }
})

//모든 중복 정답 버튼에 대한 기능 설정 (통합 관리)
function focus_answer_list(index) {
    document.querySelectorAll(`.answer_input[data-index]:not([data-index="${index}"])`).forEach(input_element => {
        input_element.style.display = 'none';
    })
    document.querySelector(`.answer_input[data-index="${index}"]`).style.display = 'block';
}

//정답 input이 동적으로 변경되기 때문에 label focus 기능을 여기서 만듦.
document.getElementById('answer-label').addEventListener('click', () => {
    document.querySelector('.answer_input[style*="display: block"]').focus();
})

/*------------- 맵 설명 입력 부분-------------*/
const map_descript_popup = document.getElementById('map-descript-popup');
const map_descript_popup_content = document.getElementById('map-descript-popup-content');
const descript_textfield = document.getElementById('descript-textfield');

function open_descript() {
    map_descript_popup.style.display = 'block';
}

function close_descript() {
    map_descript_popup.style.display = '';
}
