if (typeof tutorial5_manual === 'undefined') {

    class tutorial5_manual {
        constructor () {
            this.Timeclass = document.getElementById('tutorial-Timeclass');
            this.Timeinputlist = Array.from(tutorial_Timeclass.querySelectorAll('input'));
            this.Time = document.getElementById('tutorial-Time');
        }
    }

    const tutorial5 = new tutorial5_manual();

    tutorial5.Timeinputlist.forEach(input => {
        input.addEventListener('input', (e) => {
            tutorial5.Time.textContent = '';

            let tutorial_startTime = 0, tutorial_endTime = 0;
            let tutorial_startText = '', tutorial_endText = '';

            if (tutorial5.Timeinputlist[0].value) {tutorial_startTime += parseInt(tutorial5.Timeinputlist[0].value) * 3600}
            if (tutorial5.Timeinputlist[1].value) {tutorial_startTime += parseInt(tutorial5.Timeinputlist[1].value) * 60}
            if (tutorial5.Timeinputlist[2].value) {tutorial_startTime += parseInt(tutorial5.Timeinputlist[2].value)}
            if (tutorial5.Timeinputlist[3].value) {tutorial_startTime += parseFloat('0.' + String(tutorial5.Timeinputlist[3].value))}

            if (tutorial5.Timeinputlist[4].value) {tutorial_endTime += parseInt(tutorial5.Timeinputlist[4].value) * 3600}
            if (tutorial5.Timeinputlist[5].value) {tutorial_endTime += parseInt(tutorial5.Timeinputlist[5].value) * 60}
            if (tutorial5.Timeinputlist[6].value) {tutorial_endTime += parseInt(tutorial5.Timeinputlist[6].value)}
            if (tutorial5.Timeinputlist[7].value) {tutorial_endTime += parseFloat('0.' + String(tutorial5.Timeinputlist[7].value))}

            // 거지같은 부동소숫점 계산

            let ms1_num = String(tutorial5.Timeinputlist[3].value).length
            let ms2_num = String(tutorial5.Timeinputlist[7].value).length

            if (tutorial_startTime > 0) {
                const s_time_h = Math.floor(tutorial_startTime / 3600);
                const s_time_m = Math.floor((tutorial_startTime % 3600) / 60);
                const s_time_s = Math.floor((tutorial_startTime % 3600) % 60);
                const s_time_ms = parseFloat('0.' + String(tutorial_startTime).split('.')[1]) || 0;

                const s_seconds_length = String(s_time_s).length + ms1_num + 1;

                if (s_time_h) {tutorial_startText += s_time_h + '시간 '};
                if (s_time_m) {tutorial_startText += s_time_m + '분 '};
                if (s_time_s || s_time_ms) {
                    tutorial_startText += String(s_time_s + s_time_ms).slice(0, s_seconds_length) + '초';
                };
            }

            if (tutorial_endTime > 0) {
                const e_time_h = Math.floor(tutorial_endTime / 3600);
                const e_time_m = Math.floor((tutorial_endTime % 3600) / 60);
                const e_time_s = Math.floor((tutorial_endTime % 3600) % 60);
                const e_time_ms = parseFloat('0.' + String(tutorial_endTime).split('.')[1]) || 0;

                const e_seconds_length = String(e_time_s).length + ms2_num + 1;

                if (e_time_h) {tutorial_endText += e_time_h + '시간 '};
                if (e_time_m) {tutorial_endText += e_time_m + '분 '};
                if (e_time_s || e_time_ms) {
                    tutorial_endText += String(e_time_s + e_time_ms).slice(0, e_seconds_length) + '초';
                };
            }

            if (tutorial_startTime < tutorial_endTime) {

                if (tutorial_startText) {tutorial5.Time.textContent = tutorial_startText + " ~ " + tutorial_endText}
                else {tutorial5.Time.textContent = '0초 ~ ' + tutorial_endText};

            } else {

                if (tutorial_startText) {tutorial5.Time.textContent = tutorial_startText + " ~ 영상의 끝 까지"}
                else {tutorial5.Time.textContent = '0초 ~ 영상의 끝 까지'};
            };
        });
    });
};