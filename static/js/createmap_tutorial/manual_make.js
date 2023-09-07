const tutorial_mapname_label = document.getElementById('tutorial-mapname-label');
const tutorial_mapname_input = document.getElementById('tutorial-mapname-input');
const tutorial_mapname_insert = document.getElementById('tutorial-mapname-insert');
tutorial_mapname_insert.addEventListener('click', () => {
    if (tutorial_mapname_input.classList.contains('hidden')) {
        tutorial_mapname_insert.classList.remove('w-full');
        tutorial_mapname_insert.classList.add('w-1/2');
        tutorial_mapname_input.classList.remove('hidden');
        tutorial_mapname_insert.innerText = '제목 저장하기';
    } else {
        tutorial_mapname_label.textContent = "맵 이름: " + tutorial_mapname_input.value;
        tutorial_mapname_input.classList.add('hidden');
        tutorial_mapname_insert.classList.remove('w-1/2');
        tutorial_mapname_insert.classList.add('w-full');
        tutorial_mapname_insert.innerText = '제목 변경하기';
    };
});
const tutorial_mapname = document.getElementById('tutorial-mapname');
document.getElementById('tutorial-mapname-savebtn').addEventListener('click', () => {
    tutorial_mapname.textContent = tutorial_mapname_input.value;
});
document.getElementById('tutorial-mapname-insertbtn').addEventListener('click', () => {
    tutorial_mapname.textContent = tutorial_mapname_input.value;
});

