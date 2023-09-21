if (typeof tutorial4_manual === 'undefined') {
    class tutorial4_manual {
        constructor () {
            this.songURL_input = $('#tutorial-songURL-input');
            this.songURL = $("#tutorial-songURL");
        };
    };

    const tutorial4 = new tutorial4_manual();

    tutorial4.songURL_input.on('input', (e)=> {
        let tutorial_ytLink = $(e.target).val();
        let tutorial_videoid = '';

        if (tutorial_ytLink.split('v=')[1]) {
            tutorial_videoid = tutorial_ytLink.split('v=')[1].substring(0, 11);
        } else if (tutorial_ytLink.split('/')[3]) {
            tutorial_videoid = tutorial_ytLink.split('/')[3].substring(0, 11);
        };

        if (tutorial_videoid) {
            tutorial4.songURL.removeAttr('style');
            tutorial4.songURL.text('https://www.youtube.com/watch?v=' + tutorial_videoid);
        } else if (tutorial_ytLink) {
            tutorial4.songURL.css('color','red');
            tutorial4.songURL.text('잘못된 Youtube 동영상 링크 입니다.');
        } else {
            tutorial4.songURL.text('');
        };
    });
}