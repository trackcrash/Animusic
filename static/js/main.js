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

    const title = document.getElementById('title-input').value;
    const song = document.getElementById('song-name-input').value;
    const songURL = document.getElementById('song-link-input').value;
    const thumbnailLink = "https://img.youtube.com/vi/" + videoId + "/maxresdefault.jpg";
    const answer = document.getElementById('answer-input').value;
    const hint = document.getElementById('hint-input').value;
    const box = createInfoItem(title, song, thumbnailLink, songURL, answer, hint);
    document.getElementById('grid-container').appendChild(box);
});

function createInfoItem(title, song, thumbnail, songURL, answer, hint) {
    const box = document.createElement('div');
    box.classList.add('box', 'grid-item');

    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'X';
    closeBtn.classList.add('close-btn', 'bg-red-500', 'text-white', 'rounded-full', 'p-1', 'absolute', 'top-2', 'right-2');
    closeBtn.onclick = function() {
        box.remove();
    };
    box.appendChild(closeBtn);

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

    return box;
}

document.getElementById('song-link-input').addEventListener('input', function() {
    loadVideo();
});


document.getElementById('save-btn').addEventListener('click', function() {
    const items = document.querySelectorAll('.grid-item');
    let data = [];

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
        MapName:document.querySelector("#MapName-input").value,
        MapProducer : document.querySelector("#User_Name").innerHTML
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
    // AJAX를 사용하여 데이터를 서버에 POST
    // fetch('/submit-to-db', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify(data)
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         console.log(data);
    //     })
    //     .catch(error => {
    //         console.error('Error:', error);
    //     });
});