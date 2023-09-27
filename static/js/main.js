let videoId = "";
let modifyIndex = null;
modifyFunction();
window.onbeforeunload = function(event) {
  // 확인 대화상자를 표시하고 사용자의 응답을 저장합니다.
  let userResponse = confirm('페이지를 나가시겠습니까? 저장하지 않은 변경 사항이 있을 수 있습니다.');

  // 사용자가 '확인'을 클릭한 경우에만 경고 메시지를 표시하도록 합니다.
  if (!userResponse) {
    event.returnValue = '페이지를 나가지 않겠습니다.';
  }
}
document.querySelector(".delete2_answerlist").addEventListener("click",()=>
{
    answer_delete();
})
function delete_mission()
{
    const urlParams = new URLSearchParams(window.location.search);
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
    // console.log(answer);
    let answer_list = [];
    if (answer.includes('/')) {
        answer_list = answer.split('/');
    } else {
        answer_list[0] = answer;
    }
    let answertext_list = '', element_str = '', element_switch = 0;
    answer_list.forEach(answer=>
    {
        const text_list = [];
        
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
            // console.log(element_str);
            if (element_switch > 0) {element_str += element};
        });
        text_list.forEach(text => {
            const answerList = text.split(',').map(str => str.trim()).filter(Boolean);
            const zeroSpaceList = answerList.map(str => str.replace(/\s+/g, ''));
    
            const combinedList = answerList.concat(zeroSpaceList);
            const combinedSet = new Set(combinedList);
    
            answertext_list += "[" + Array.from(combinedSet).join(',') + "],"
        })   
        answertext_list = answertext_list.slice(0,-1);
        answertext_list+= "/";
        // answertext_list.slice(0, -1); 
    })
    return answertext_list.slice(0,-1);
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
            // 이전의 데이터로 인해 생겼던 중복정답 요소를 모두 제거 (input, button)
            document.querySelectorAll('.multi_answer').forEach(input_element => {
                input_element.remove();
            })
            document.querySelectorAll('.answer_list').forEach(button_element => {
                button_element.remove();
            })

            // 요소가 남아있다면 (중복 정답이였던 경우) 남은 요소 생성
            // for (let text_element of h1text) {
            //     if (text_element === '[') {
            //         text_switch = 1;
            //         continue
            //     } else if (text_element === ']') {
            //         text_switch = 0;
            //         answer.push(textlist);
            //         textlist = "";
            //         continue
            //     }
            //     if (text_switch > 0) {textlist += text_element};
            // }
            const hint = box.querySelector('h2')?.innerText;
            const id = box.querySelector('h4')?.innerText;
            const startTime = box.querySelector('h5')?.innerText;
            const endTime = box.querySelector('h6')?.innerText;
            let answer = [];
            let catedata = box.querySelector('cate')?.innerText.match(/\[([^\]]+)\]/g) || [];
            if(catedata == "")
            {
                catedata[0] = "카테고리:";
                answer[0] = h1text.replace('/');
            }else
            {
                if (h1text.includes('/')) {
                    answer = h1text.split('/');
                } else {
                    answer[0] = h1text;
                }
            }
            // document.querySelectorAll(".answer_list")[0].classList.add("selected");
            if (catedata.length > 0) {
                let index = 0;
                catedata.forEach(element => {
                    boxClick(answer[index],index,element);
                    document.querySelectorAll(".answer_list")[0].classList.add("selected");
                    index++;
                })
            }
            // 정보를 설정하면서 선택적 체이닝 사용
            document.getElementById('title-input').value = title || ''; // 속성이 없을 때는 빈 문자열
            document.getElementById('song-name-input').value = song || '';
            document.getElementById('song-link-input').value = songURL || '';
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

        document.querySelectorAll('.multi_answer[data-index]:not([data-index="0"])').forEach(input_element => {
            input_element.remove();
        });
        document.querySelectorAll('.answer_list[data-index]:not([data-index="0"])').forEach(button_element => {
            button_element.remove();
        });
        document.querySelector(".answer_list[data-index='0']").classList.add("selected");
        const multi_answer=document.querySelector('.multi_answer')
        multi_answer.style.display="block";
        const answer_input = multi_answer.querySelectorAll('.answer_input');
        const answer2_list = multi_answer.querySelectorAll(".answer2_list");
        for(let i = 0; i < answer2_list.length; i++)
        {
            if(i != 0)
            {
                answer2_list[i].remove();
            }
            else
            {
                answer2_list[i].classList.add("selected");
            }
        }
        for(let i = 0; i < answer_input.length; i++)
        {
            if(i != 0)
            {
                answer_input[i].remove();
            }
            else
            {
                answer_input[i].style.display="block";
            }
        }
        for(const element of multi_answer.querySelectorAll("input"))
        {
            if(element.classList.contains("category_input"))
            {
                element.value ="노래제목";
            }else
            {
                element.value = "";
            }
        }

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

function boxClick(answer,index,element)
{
    
    const answer_data = answer;
    const answer_list = document.querySelectorAll(".answer_list");
    const multi_answer = document.querySelectorAll(".multi_answer");
    // 새 버튼 생성 및 설정
    const button = document.createElement("button");
    button.dataset.index = answer_list.length;
    button.className = "answer_list";
    button.onclick = (e) => {focus_answer_list(e.target.dataset.index)};
    button.textContent = multi_answer.length + 1;
    button.style.marginRight = '1rem';
    button.addEventListener ('mousedown', answer_list_scroll);

    const answer_div = document.createElement('div');
    answer_div.className = "flex justify-between";
    const answer2_buttonField = document.createElement("div");
    answer2_buttonField.className = "answer2_buttonField";

    const answer2_buttonField_label = document.createElement("label");
    answer2_buttonField_label.className = "answer2-label";
    answer2_buttonField_label.textContent = "정답 ";
    answer2_buttonField_label.addEventListener("click", (e)=>
    {
        const this_multi_answer_element = e.target.parentNode.parentNode.parentNode;
        const block_answer_input = this_multi_answer_element.querySelector('.answer_input[style*="display: block"]');
        if (block_answer_input) {block_answer_input.focus()}
        else {this_multi_answer_element.querySelector('.answer_input').focus()};
    })
    
    const answer_div_inner_div = document.createElement("div");
    answer_div_inner_div.className = "flex space-x-4";
    const answer_div_inner_div_firstbutton = document.createElement("button");
    answer_div_inner_div_firstbutton.className = "add2_answerlist";
    answer_div_inner_div_firstbutton.textContent = "정답 추가";
    answer_div_inner_div_firstbutton.addEventListener("click", ()=>
    {
        create_multi_answer_inner();
    })
    const answer_div_inner_div_secondbutton = document.createElement("button");
    answer_div_inner_div_secondbutton.className = "delete2_answerlist";
    answer_div_inner_div_secondbutton.textContent= "정답 제거";
    answer_div_inner_div_secondbutton.addEventListener("click",()=>
    {
        answer_delete();
    })
    const new_multi_answer = document.createElement("div");
    new_multi_answer.dataset.index = multi_answer.length;
    new_multi_answer.className = multi_answer[0]?.className || "multi_answer";
    if(multi_answer.length <= 0)
    {
        new_multi_answer.style.display="block";
    }
    else
    {
        new_multi_answer.style.display="none";
    }
    const new_category_input = document.createElement("input");
    new_category_input.className = "w-1/2 category_input";
    new_category_input.placeholder = "정답의 카테고리를 입력해주세요.";
    new_category_input.value = element.split(":")[0].replace('[','').replace(']','');
    
    const new_answer_admit = document.createElement("input");
    new_answer_admit.className = "w-1/2 answer_admit";
    new_answer_admit.placeholder =  "해당 카테고리내에서 몇개이상의 정답을 맞췄을때 모든정답을 맞췃다고 인식";
    new_answer_admit.value = element.split(":")[1].replace('[','').replace(']','');
    // 새로운 입력 필드 생성 및 설정

    const new_div = document.createElement("div");
    new_div.className="flex justify-between w-full";
    // 버튼과 입력 필드를 문서에 추가
    answer2_buttonField.appendChild(answer2_buttonField_label);
    answer_div_inner_div.appendChild(answer_div_inner_div_firstbutton);
    answer_div_inner_div.appendChild(answer_div_inner_div_secondbutton);


    const answer_data_list = answer_data.match(/\[([^\]]+)\]/g);
    for(const data of answer_data_list)
    {
        const button = document.createElement("button");
        button.dataset.index = answer2_buttonField.querySelectorAll(".answer2_list").length;
        button.className = "answer2_list";
        button.onclick = (e) => {focus_answer2_list(e.target.dataset.index)};
        button.textContent = answer2_buttonField.querySelectorAll(".answer2_list").length + 1;
        button.style.marginRight = '1rem';
        button.addEventListener ('mousedown', answer_list_scroll);
        if(button.dataset.index == "0")
        {
            button.classList.add("selected");
        }
        answer2_buttonField.appendChild(button);
    }
    answer_div.appendChild(answer2_buttonField);
    answer_div.appendChild(answer_div_inner_div);
    new_div.appendChild(new_category_input);
    new_div.appendChild(new_answer_admit);
    new_multi_answer.appendChild(new_div);
    new_multi_answer.appendChild(answer_div);
    let first_data = 0;
    for(const data of answer_data_list)
    {
        const new_answer_input = document.createElement("input");
        new_answer_input.className = "w-full answer_input";
        new_answer_input.value = data.replace('[', '').replace(']','');
        new_multi_answer.appendChild(new_answer_input);
        new_answer_input.style.display = "none";
        if(first_data == 0)
        {
            new_answer_input.style.display= "block";
        }
        first_data++;
    }
    new_multi_answer.querySelector(".answer2_buttonField").appendChild(button);
    document.getElementById('answer_buttonField').appendChild(button);
    if(index == 0)
    {
        document.querySelector(".hint-input").before(new_multi_answer);
    }
    else
    {
        multi_answer[multi_answer.length-1].after(new_multi_answer);
    }
}
function createInfoItem(title, song, songURL, thumbnail, answer, hint, startTime, endTime, id,category) {
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

    const CategoryIdElem = document.createElement('cate'); // 사용자에게는 보이지 않도록 hidden 유형으로 설정
    CategoryIdElem.innerText = category;
    box.appendChild(CategoryIdElem);
    CategoryIdElem.style.display = "None";
    return box;
};

document.getElementById("register-btn").addEventListener("click", (e) => {
    const title = document.getElementById('title-input').value;
    const song = document.getElementById('song-name-input').value;
    const songURL = document.getElementById('song-link-input').value;
    const thumbnailLink = "https://img.youtube.com/vi/" + videoId + "/sddefault.jpg";
    let category = "";
    let answer = "";
    const multi_answer = document.querySelectorAll(".multi_answer");
    for(const element of multi_answer)
    {
        for(const inner_elements of element.querySelectorAll(".answer_input"))
        {
            if(inner_elements.value)
            {
                answer+= "["+inner_elements.value+"],";
            }
        }
        category += "["+ element.querySelector(".category_input").value+":"+element.querySelector(".answer_admit").value +"],";
        answer = answer.slice(0,-1);
        answer += "/";
    };
    category = category.slice(0,-1);
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
                changeBox(boxList[i], title, song, songURL, thumbnailLink, answer, hint, startTime, endTime,category)
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
                    changeBox(boxList[i], title, song, songURL, thumbnailLink, answer, hint, startTime, endTime,category)

                }
            }
        }else
        {
            const box = createInfoItem(title, song, songURL, thumbnailLink, answer, hint, startTime, endTime,id,category);
            document.querySelector('.add_box').before(box);
            for(const element of inputList)
            {
                element.value = "";
            }
            modifyFunction();
        }
    }
});

function changeBox(box,title, song, songURL, thumbnail, answer, hint, startTime, endTime, category) {
    box.querySelector('h3').innerText = title;
    box.querySelector('p').innerText = song;
    box.querySelector('img').src = thumbnail;
    box.querySelector('input').value = songURL;
    box.querySelector('h2').innerText = hint;
    box.querySelector('h5').innerText = startTime;
    box.querySelector('h6').innerText = endTime;
    box.querySelector('h1').innerText = answer;
    box.querySelector('cate').innerText = category;
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
    const category = item.querySelector('cate').innerHTML;
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
        videoid: videoid,
        category : category
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
        let {id, title, song, thumbnail, songURL, answer, hint, startTime, endTime, videoid,category} = box_element(item);
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
            endTime: endTime,
            category : category
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
            // box_element.style.height = '60px';
            //제거 함
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
    create_multi_answer();
});
document.querySelectorAll(".multi_answer")[0].querySelector(".add2_answerlist").addEventListener("click",()=>
{
    create_multi_answer_inner();
})
function create_multi_answer_inner()
{
    const multi_answer = document.querySelectorAll(".multi_answer");
    multi_answer.forEach(element =>
    {
        if(element.style.display == "block")
        {
            const button = document.createElement("button");
            button.dataset.index = element.querySelectorAll(".answer2_list").length;
            button.className = "answer2_list";
            button.onclick = (e) => {focus_answer2_list(e.target.dataset.index)};
            button.textContent = element.querySelectorAll(".answer2_list").length + 1;
            button.style.marginRight = '1rem';
            button.addEventListener ('mousedown', answer_list_scroll);
            element.querySelector(".answer2_buttonField").appendChild(button);
            const answer_number = document.createElement("input");
            answer_number.className = element.querySelectorAll(".answer_input")[0].className;
            answer_number.style.display = "none";
            element.appendChild(answer_number);
        }
    })
    
}
function create_multi_answer()
{
    const answer_list = document.querySelectorAll(".answer_list");
    const multi_answer = document.querySelectorAll(".multi_answer");
    // 새 버튼 생성 및 설정
    const button = document.createElement("button");
    button.dataset.index = answer_list.length;
    button.className = "answer_list";
    button.onclick = (e) => {focus_answer_list(e.target.dataset.index)};
    button.textContent = multi_answer.length + 1;
    button.style.marginRight = '1rem';
    button.addEventListener ('mousedown', answer_list_scroll);
    const new_multi_answer = document.createElement("div");
    new_multi_answer.dataset.index = multi_answer.length;
    new_multi_answer.className = multi_answer[0].className;
    new_multi_answer.style.display="none";
    const new_category_input = document.createElement("input");
    new_category_input.className = multi_answer[0].querySelector(".category_input").className;
    new_category_input.placeholder = multi_answer[0].querySelector(".category_input").placeholder;
    const new_answer_admit = document.createElement("input");
    new_answer_admit.className = multi_answer[0].querySelector(".answer_admit").className;
    new_answer_admit.placeholder =  multi_answer[0].querySelector(".answer_admit").placeholder;
    // 새로운 입력 필드 생성 및 설정

    const new_div = document.createElement("div");
    new_div.className=multi_answer[0].getElementsByTagName('div')[0].className;
    const answer_div = document.createElement('div');
    answer_div.className = multi_answer[0].getElementsByTagName('div')[1].className;
    
    const answer2_buttonField = document.createElement("div");
    answer2_buttonField.className = "answer2_buttonField";

    const answer2_buttonField_label = document.createElement("label");
    answer2_buttonField_label.className = "answer2-label";
    answer2_buttonField_label.textContent = "정답 ";
    answer2_buttonField_label.addEventListener("click", (e)=>
    {
        const this_multi_answer_element = e.target.parentNode.parentNode.parentNode;
        const block_answer_input = this_multi_answer_element.querySelector('.answer_input[style*="display: block"]');
        if (block_answer_input) {block_answer_input.focus()}
        else {this_multi_answer_element.querySelector('.answer_input').focus()};
    })
    const answer2_buttonField_button = document.createElement("button");
    answer2_buttonField_button.dataset.index = "0";
    answer2_buttonField_button.className = "answer2_list";
    answer2_buttonField_button.style.marginRight = "0.6rem";
    answer2_buttonField_button.textContent = "1";
    answer2_buttonField_button.classList.add("selected");
    answer2_buttonField_button.onclick = (e) => {focus_answer2_list(e.target.dataset.index)};
    answer2_buttonField.appendChild(answer2_buttonField_label);
    answer2_buttonField.appendChild(answer2_buttonField_button);
    const answer_div_inner_div = document.createElement("div");
    answer_div_inner_div.className = "flex space-x-4";
    const answer_div_inner_div_firstbutton = document.createElement("button");
    answer_div_inner_div_firstbutton.className = "add2_answerlist";
    answer_div_inner_div_firstbutton.textContent = "정답 추가";
    answer_div_inner_div_firstbutton.addEventListener("click", ()=>
    {
        create_multi_answer_inner();
    })
    const answer_div_inner_div_secondbutton = document.createElement("button");
    answer_div_inner_div_secondbutton.className = "delete2_answerlist";
    answer_div_inner_div_secondbutton.textContent= "정답 제거";
    answer_div_inner_div_secondbutton.addEventListener("click",()=>
    {
        answer_delete();
    })
    answer_div_inner_div.appendChild(answer_div_inner_div_firstbutton);
    answer_div_inner_div.appendChild(answer_div_inner_div_secondbutton);
    answer_div.appendChild(answer2_buttonField);
    answer_div.appendChild(answer_div_inner_div);

    const new_answer_input = document.createElement("input");
    new_answer_input.className = multi_answer[0].querySelectorAll(".answer_input")[0].className;
    // 버튼과 입력 필드를 문서에 추가
    new_div.appendChild(new_category_input);
    new_div.appendChild(new_answer_admit);
    document.getElementById('answer_buttonField').appendChild(button);
    new_multi_answer.appendChild(new_div);
    new_multi_answer.appendChild(answer_div);
    new_multi_answer.appendChild(new_answer_input);
    multi_answer[multi_answer.length-1].after(new_multi_answer);
}
// 중복 정답 제거 버튼 기능
document.getElementById("delete_answerlist").addEventListener("click", () => {
    let multi_answer = document.querySelectorAll('.multi_answer');
    let cate_list = document.querySelectorAll(".answer_list");
    if (cate_list.length > 1) {
        let del_index;
        for(let i = 0; i < multi_answer.length; i++)
        {
            if(multi_answer[i].style.display=="block")
            {
                multi_answer[i].remove();
                cate_list[i].remove();
                del_index = i;
            }else
            {
                if(del_index!= undefined)
                {
                    multi_answer[i].dataset.index--;
                    cate_list[i].textContent--;
                }
            }
        }
        cate_list = document.querySelectorAll(".answer_list");
        multi_answer = document.querySelectorAll('.multi_answer');
        if(del_index >= cate_list.length)
        {
            del_index = cate_list.length-1;
        }
        cate_list[del_index].classList.add("selected");
        multi_answer[del_index].style.display="block";
    }

    const submission_form = document.getElementById('submission-form');
    let check_blockStyle = submission_form.querySelectorAll('[style*="display: block"]');
    if (!check_blockStyle.length) {answerinputs[answerinputs.length - 2].style.display = 'block'};
})

function answer_delete()
{
    let multi_answer = document.querySelectorAll('.multi_answer');
    multi_answer.forEach(element =>
    {
        if(element.style.display =="block")
        {
            let answer_list = element.querySelectorAll(".answer2_list");
            let answer_input_list = element.querySelectorAll(".answer_input");
            let del_index;
            if(answer_list.length > 1)
            {
                for(let i = 0 ; i < answer_list.length; i++)
                {
                    if(answer_input_list[i].style.display =="block")
                    {
                        answer_input_list[i].remove();
                        answer_list[i].remove();
                        del_index = i;
                    }
                    else
                    {
                        if(del_index!= undefined)
                        {
                            answer_list[i].dataset.index--;
                            answer_list[i].textContent--;
                        }
                    }
                }
                answer_list = element.querySelectorAll(".answer2_list");
                answer_input_list = element.querySelectorAll(".answer_input");
                if(del_index >= answer_list.length)
                {
                    del_index = answer_list.length-1;
                }
                answer_list[del_index].classList.add("selected");
                answer_input_list[del_index].style.display = "block";
            }
           
        }
    })
}
//모든 중복 정답 버튼에 대한 기능 설정 (통합 관리)
function focus_answer_list(index) {
    document.querySelectorAll(`.answer_list[data-index]:not([data-index="${index}])`).forEach(input_element=>
    {
        input_element.classList.remove("selected");
    });
    document.querySelectorAll(`.multi_answer[data-index]:not([data-index="${index}"])`).forEach(input_element => {
        input_element.style.display = 'none';
    });
    document.querySelector(`.multi_answer[data-index="${index}"]`).style.display = 'block';
    document.querySelector(`.answer_list[data-index="${index}"]`).classList.add("selected");
}
function focus_answer2_list(index) {
    document.querySelectorAll(`.multi_answer`).forEach(input_element=>
        {
            if(input_element.style.display =="block")
            {
                input_element.querySelectorAll(".answer2_list").forEach(element=>
                {
                   if(element.dataset.index == index)
                   {
                        element.classList.add("selected");
                   } 
                   else
                   {
                        element.classList.remove("selected");
                   }
                });
                const answer_list = input_element.querySelectorAll(".answer_input");
                for(let i = 0; i < answer_list.length; i++)
                {
                    if(i == index)
                    {
                        answer_list[i].style.display = "block";
                    }
                    else
                    {
                        answer_list[i].style.display = "none";
                    }
                }
            
            }
        })
}

//카테고리 input이 동적으로 변경되기 때문에 label focus 기능을 여기서 만듦.
document.getElementById('answer-label').addEventListener('click', () => {
    document.querySelector('.multi_answer[style*="display: block"]').firstElementChild.firstElementChild.focus();
})

//첫번째 카테고리의 정답 label은 설정되지 않아서 따로 focus 기능을 만듦.
document.querySelector('.answer2-label').addEventListener('click', (e) => {
    e.target.parentNode.parentNode.parentNode.querySelector('.answer_input[style*="display: block"]').focus();
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

/* 다중 정답 스크롤 기능 */

document.querySelector('.answer_list').addEventListener('mousedown', answer_list_scroll);
document.querySelector('.answer2_list').addEventListener('mousedown', answer_list_scroll);

function answer_list_scroll(e) {
    let answer_buttonField = e.target.parentNode;
    let mouse_point = e.clientX, mouse_switch = 0;

    document.addEventListener('mouseup', () => {mouse_switch = 1});
    document.addEventListener('mousemove', (e) => {
        if (mouse_switch < 1) {answer_buttonField.scrollTo({left: mouse_point - e.clientX})};
    });
};