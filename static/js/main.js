let videoId = "";

function loadVideo() {
    const ytLink = document.getElementById("song-link-input").value;
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
    const thumbnailLink = "https://img.youtube.com/vi/" + videoId + "/maxresdefault.jpg";
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
    console.log("test");
    items.forEach(item => {
        const title = item.querySelector('h3').innerText.split(": ")[1];
        const song = item.querySelector('p').innerText.split(": ")[1];
        const thumbnail = item.querySelector('img').src;
        const songURL = item.querySelector('input').value;
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
    console.log(data);
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
        const songURL = item.querySelector('input').value;
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
    console.log(data);
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