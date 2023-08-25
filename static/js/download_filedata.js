document.getElementById('download_excelfile').addEventListener('click', data_convert_download);

function data_convert_download() {
    let exceldata = [
        ['맵 제작 프리셋 양식파일'],
        ['제목은 해당 곡의 출처를 적는곳이라 생각하면 됩니다. ex) 애니메이션 제목, 가수이름'],
        ['정답은 콤마(,)를 사용하여 한 곡에 여러개의 답을 지정할 수 있습니다. ex) 레몬, lemon'],
        ['제목, 곡 이름, 정답, 곡 링크 4가지 항목이 필수로 적혀있는 행 정보만 읽습니다. (힌트, 재생 시간은 필수사항이아닙니다.)'],
        ['곡 링크의 경우 반드시 유효한(계정없이 재생되는지 여부)지 확인하시기 바랍니다.'],
        ['시간 작성방법 ex)1:2:3.123~1:2:3.124 (1시간 2분 3.123초 부터 1시간 2분 3.124초 까지), 2:3~2:4 (2분3초 부터 2분4초까지)'],
        ['시간은 최대 100시간을 넘길 수 없으며 시간 작성방법이 지켜지지않는 셀은 \'NULL\' 처리됩니다.'],
        ['제목', '곡 이름', '정답', '힌트', '곡 링크', '재생 시간']];

    const items = document.querySelectorAll('.grid-item.box');

    for (let item of items) {
        // 웹페이지에 있는 곡 정보를 각각 변수선언 하는 곳
        const title = item.querySelector('h3').innerText;
        const song = item.querySelector('p').innerText;
        const thumbnail = item.querySelector('img').src;
        const songURL = "https://www.youtube.com/watch?v=" + split_ytLink(item.querySelector('input').value);
        const answer = item.querySelector('h1').innerText;
        let hint = "";
        if (item.querySelector('h2').innerText !== '') {hint = item.querySelector('h2').innerText};

        let startTime = 0;
        if (isNaN(parseFloat(item.querySelector('h5').innerText)) || parseFloat(item.querySelector('h5').innerText) === 0) {
            startTime = 0;
        } else {startTime = item.querySelector('h5').innerText};

        let endTime = 0;
        if (isNaN(parseFloat(item.querySelector('h6').innerText)) || parseFloat(item.querySelector('h6').innerText) === 0) {
            endTime = 0;
        } else {endTime = item.querySelector('h6').innerText};

        // 해당 곡 정보를 액셀파일 데이터에 담는 곳

        let song_info = [];
        song_info.push(title || "");
        song_info.push(song || "");
        song_info.push(answer || "");
        song_info.push(hint || "");
        song_info.push(songURL || "");

        let before_time = String(Math.floor(startTime / 3600)) + ":" + String(Math.floor((startTime % 3600) / 60)) + ":" + String(startTime % 60) + "." + String((startTime - Math.floor(startTime)) * 1000);
        let after_time = String(Math.floor(endTime / 3600)) + ":" + String(Math.floor((endTime % 3600) / 60)) + ":" + String(endTime % 60) + "." + String((endTime - Math.floor(endTime)) * 1000);

        let before_time_list = before_time.split("");
        let after_time_list = after_time.split("");

        let play_time = "";
        const regex = /^[0:.]/;

        while (before_time_list.length > 0 && regex.test(before_time_list[0])) {
            before_time_list.shift();
        }

        while (before_time_list.length > 0 && regex.test(before_time_list[before_time_list.length - 1])) {
            before_time_list.pop();
        }

        while (after_time_list.length > 0 && regex.test(after_time_list[0])) {
            after_time_list.shift();
        }

        while (after_time_list.length > 0 && regex.test(after_time_list[after_time_list.length - 1])) {
            after_time_list.pop();
        }

        if (before_time_list.length < 1) {
            before_time = "";
        } else {
            before_time = before_time_list.join("");
        };

        if (after_time_list.length < 1) {
            after_time = "";
        } else {
            after_time = after_time_list.join("");
        }

        if (before_time && after_time) {
            play_time = before_time + "~" + after_time;
        } else if (before_time) {
            play_time = before_time + "~";
        } else if (after_time) {
            play_time = "~" + after_time;
        };

        song_info.push(play_time);

        exceldata.push(song_info);
        song_info = [];
    }
    console.log(exceldata);
};
/*

    let ws = XLSX.utils.aoa_to_sheet(exceldata);

    ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // A1:F1
        { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }, // A2:F2
        { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } }, // A3:F3
        { s: { r: 3, c: 0 }, e: { r: 3, c: 5 } }, // A4:F4
        { s: { r: 4, c: 0 }, e: { r: 4, c: 5 } }, // A5:F5
        { s: { r: 5, c: 0 }, e: { r: 5, c: 5 } }, // A6:F6
        { s: { r: 6, c: 0 }, e: { r: 6, c: 5 } }, // A7:F7
    ];
}
*/