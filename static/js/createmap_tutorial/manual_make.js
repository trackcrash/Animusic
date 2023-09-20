if (typeof tutorial_manual === 'undefined') {
    class tutorial_manual {
        constructor() {
            this.mapname = document.getElementById('tutorial-mapname');
            this.mapname_label = document.getElementById('tutorial-mapname-label');
            this.mapname_input = document.getElementById('tutorial-mapname-input');
            this.mapname_insert = document.getElementById('tutorial-mapname-insert');
            this.mapname_savebtn = document.getElementById('tutorial-mapname-savebtn');
            this.mapname_insertbtn = document.getElementById('tutorial-mapname-insertbtn')
        };
    };

    const tutorial = new tutorial_manual();

    tutorial.mapname_insert.addEventListener('click', () => {
        if (tutorial.mapname_input.classList.contains('hidden')) {
            tutorial.mapname_insert.classList.remove('w-full');
            tutorial.mapname_insert.classList.add('w-1/2');
            tutorial.mapname_input.classList.remove('hidden');
            tutorial.mapname_insert.innerText = '제목 저장하기';
        } else {
            tutorial.mapname_label.textContent = "맵 이름: " + tutorial.mapname_input.value;
            tutorial.mapname_input.classList.add('hidden');
            tutorial.mapname_insert.classList.remove('w-1/2');
            tutorial.mapname_insert.classList.add('w-full');
            tutorial.mapname_insert.innerText = '제목 변경하기';
        };
    });

    tutorial.mapname_savebtn.addEventListener('click', () => {
        tutorial.mapname.textContent = tutorial.mapname_input.value;
    });

    tutorial.mapname_insertbtn.addEventListener('click', () => {
        tutorial.mapname.textContent = tutorial.mapname_input.value;
    });
};