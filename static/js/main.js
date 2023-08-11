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
    const thumbnailLink = "https://img.youtube.com/vi/" + videoId + "/maxresdefault.jpg";
    const box = createInfoItem(title, song, thumbnailLink);
    document.getElementById('grid-container').appendChild(box);
});

function createInfoItem(title, song, thumbnail) {
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

    return box;
}

document.getElementById('song-link-input').addEventListener('input', function() {
    loadVideo();
});