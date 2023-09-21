if (typeof tutorial_manual === 'undefined') {
    class tutorial_manual {
        constructor() {
            this.mapname = $('#tutorial-mapname');
            this.mapname_label = $('#tutorial-mapname-label');
            this.mapname_input = $('#tutorial-mapname-input');
            this.mapname_insert = $('#tutorial-mapname-insert');
            this.mapname_savebtn = $('#tutorial-mapname-savebtn');
            this.mapname_insertbtn = $('#tutorial-mapname-insertbtn');
        };
    };

    const tutorial = new tutorial_manual();

    tutorial.mapname_insert.click(() => {
        if (tutorial.mapname_input.hasClass('hidden')) {
            tutorial.mapname_input.removeClass('hidden');
            tutorial.mapname_insert.removeClass('w-full').addClass('w-1/2').text('제목 저장하기');
        } else {
            tutorial.mapname_input.addClass('hidden');
            tutorial.mapname_insert.removeClass('w-1/2').addClass('w-full').text('제목 변경하기');
            tutorial.mapname_label.text("맵 이름: " + tutorial.mapname_input.val());
        };
    });

    tutorial.mapname_savebtn.click(() => {
        tutorial.mapname.text(tutorial.mapname_input.val());
    });

    tutorial.mapname_insertbtn.click(() => {
        tutorial.mapname.text(tutorial.mapname_input.val());
    });
};