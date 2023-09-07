const tutorial_songURL_input = document.getElementById('tutorial-songURL-input');
const tutorial_songURL = document.getElementById("tutorial-songURL");
tutorial_songURL_input.addEventListener('input', (e)=> {
    const tutorial_ytLink = e.target.value;
    let tutorial_videoid = '';

    if (tutorial_ytLink.split('v=')[1]) {
        tutorial_videoid = tutorial_ytLink.split('v=')[1].substring(0, 11);
    } else if (tutorial_ytLink.split('/')[3]) {
        tutorial_videoid = tutorial_ytLink.split('/')[3].substring(0, 11);
    };

    if (tutorial_videoid) {
        tutorial_songURL.removeAttribute('style');
        tutorial_songURL.textContent = 'https://www.youtube.com/watch?v=' + tutorial_videoid;
    } else if (tutorial_ytLink) {
        tutorial_songURL.setAttribute('style', 'color: red;');
        tutorial_songURL.textContent = '잘못된 Youtube 동영상 링크 입니다.';
    } else {
        tutorial_songURL.textContent = '';
    };
});