document.getElementById('download_excelfile').addEventListener('click', data_convert_download);

async function data_convert_download() {

    const items = document.querySelectorAll('.grid-item.box');
    let exceldata = [];
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
    };
    const response = await fetch('/download_excelfile'); // 서버로부터 양식 파일 다운로드 요청
    const blob = await response.blob();
    const excelFile = new Uint8Array(await blob.arrayBuffer()); // 받아온 파일을 Uint8Array로 변환

    let workbook = XLSX.read(excelFile, { type: 'array'}); // 기존 서식을 살릴 수가 없음 !
    let worksheet = workbook.Sheets['시트1']; // 기존 워크시트 선택

    // 웹페이지에서 가져온 데이터를 새로운 열에 추가

    const col_list = ['A', 'B', 'C', 'D', 'E', 'F'];    // 양식 내용이 바뀌면 수정해야 됨
    const start_row = 9;                                // 양식 내용이 바뀌면 수정해야 됨
    for (let i = 0; i < exceldata.length; i++) {
        for (let j = 0; j < col_list.length; j++) {
            const cell_name = col_list[j] + String(start_row + i);
            worksheet[cell_name] = {
                t: 's',
                v: exceldata[i][j]
            };
        };
    };

    // Blob 생성 및 다운로드 처리
    const blobToDownload = new Blob([XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blobToDownload);

    const a = document.createElement('a');
    a.href = url;
    a.download = document.querySelector("#MapName-input").value + '.xlsx';
    a.click();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 100);
};