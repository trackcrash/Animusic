window.onload = function() {
    const gridContainer = document.getElementById('grid-container');

    for (let i = 0; i < 9; i++) {
        const gridItem = document.createElement('div');
        gridItem.classList.add('grid-item');
        gridContainer.appendChild(gridItem);
    }
};
let videoId = "";
//영상확인 나중에 초단위 수정 추가
function playVideo() {
    const ytLink = document.getElementById("youtube-link-input").value;
    videoId = ytLink.split("v=")[1]; // This assumes the link format is like "https://www.youtube.com/watch?v=VIDEO_ID"
    const embedLink = "https://www.youtube.com/embed/" + videoId + "?autoplay=1";

    const iframe = document.createElement("iframe");
    iframe.src = embedLink;
    iframe.width = "1024";
    iframe.height = "720";
    iframe.allow = "autoplay";

    const videoContainer = document.querySelector(".video-container");
    videoContainer.innerHTML = ""; // Clear previous iframe, if any
    videoContainer.appendChild(iframe);
}
//유저인포 오른쪽위에 x버튼 누르면 삭제
document.getElementById('submission-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const title = document.getElementById('title-input').value;
    const song = document.getElementById('song-name-input').value;
    const youtube_url = document.getElementById('youtube-link-input').value;
    const thumbnailLink = "https://img.youtube.com/vi/" + videoId + "/maxresdefault.jpg";

    const infoItem = createInfoItem(title, song, thumbnailLink, youtube_url); // YouTube 썸네일 URL과 곡 URL을 전달
    document.querySelector('.info-container').appendChild(infoItem);
});
//정보 생성
function createInfoItem(title, song, thumbnail, songURL) {
    const item = document.createElement('div');
    item.classList.add('user-input-info');

    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'X';
    closeBtn.classList.add('close-btn');
    closeBtn.onclick = function() {
        item.remove();
    };
    item.appendChild(closeBtn);

    const titleElem = document.createElement('h3');
    titleElem.innerText = "제목: " + title;
    item.appendChild(titleElem);

    const songElem = document.createElement('p');
    songElem.innerText = "곡 이름: " + song;
    item.appendChild(songElem);

    const thumbnailElem = document.createElement('img');
    thumbnailElem.src = thumbnail;
    item.appendChild(thumbnailElem);

    const songURLElem = document.createElement('input');
    songURLElem.type = 'hidden'; // 사용자에게는 보이지 않도록 hidden 유형으로 설정
    songURLElem.value = songURL;
    item.appendChild(songURLElem);

    return item;
}
//정보 삭제
function removeInfo() {
    const infoContainer = document.querySelector('.user-input-info');
    infoContainer.style.display = 'none';
}
// 유저에게 보여지는 정보 한번에 하기위해서 ajax로 데이터 post
document.getElementById('submit-all').addEventListener('click', function() {
    const items = document.querySelectorAll('.user-input-info');
    let data = [];

    items.forEach(item => {
        const title = item.querySelector('h3').innerText.split(": ")[1];
        const song = item.querySelector('p').innerText.split(": ")[1];
        const thumbnail = item.querySelector('img').src;
        const songURL = item.querySelector('input[type="hidden"]').value;

        data.push({
            title: title,
            song: song,
            thumbnail: thumbnail,
            songURL: songURL
        });
    });

    // AJAX를 사용하여 데이터를 서버에 POST
    fetch('/submit-to-db', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
});