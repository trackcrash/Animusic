document.getElementById('file_save_btn').addEventListener('click', () => data_convert_upload('save'));
document.getElementById('file_insert_btn').addEventListener('click', () => data_convert_upload('insert'));

document.getElementById('excelUpload').addEventListener('change', (e) => {
    const fileList = e.target.files;
    const excelUpload_label = document.querySelector('label[for="excelUpload"]');

    if (fileList.length > 0) { excelUpload_label.textContent = "맵 양식 제출: " + fileList[0].name } else { excelUpload_label.textContent = "맵 양식 제출" };
});


let progressBar = document.querySelector('.progress-bar');
let progressFill = progressBar.querySelector('.progress-fill');
let spinnerText = progressBar.querySelector('.spinner-text');
let spinner = document.querySelector('.spinner');

// 진행률 관련 초기 스타일 값
document.addEventListener('DOMContentLoaded', function() {
    progressBar.style.display = 'none';
    spinner.style.display = 'none';
})

// 진행률 관련 이미지 switch 함수
const switch_progress_display = {
    show: function() {
        progressBar.style.display = 'block';
        spinner.style.display = 'block';
    },
    hide: function() {
        progressBar.style.display = 'none';
        spinner.style.display = 'none';
    }
};

const progress_step = {
    step_fail: function() {
        switch_progress_display.hide();
        progressFill.style.width = 0 + "%";
        spinnerText.textContent = '요청 처리중...';
    },
    step_start: function() {
        switch_progress_display.show();
        progressFill.style.width = 10 + "%";
        spinnerText.textContent = '파일을 읽어오는중...';
    },
    step_1: function() {
        progressFill.style.width = 20 + "%";
        spinnerText.textContent = '데이터 로드중...';
    },
    step_2: function() {
        progressFill.style.width = 40 + "%";
        spinnerText.textContent = '양식 체크중...';
    },
    step_3: function() {
        progressFill.style.width = 60 + "%";
        spinnerText.textContent = '데이터 변환중...';
    },
    step_4: function() {
        progressFill.style.width = 70 + "%";
        spinnerText.textContent = '영상 주소의 유효성 확인중...';
    },
    step_5: function() {
        progressFill.style.width = 85 + "%";
        spinnerText.textContent = '데이터 전송중...';
    },
    step_end: function() {
        progressFill.style.width = 100 + "%";
        spinnerText.textContent = '업로드 완료';
    }
};

// 파일 로드 함수
async function file_load() {
    const excelFile = document.getElementById('excelUpload').files[0];
    const reader = new FileReader();

    let excelFile_data = "";
    let workbook = "";

    // 업로드된 파일이 없는 경우
    if (!excelFile) {
        alert("업로드할 파일이 존재하지 않습니다.");
        return;
    } else if (excelFile.name.split('.').pop() !== "xlsx") {
        alert("올바른 양식 파일이 아닙니다.");
        return;
    }
    //함수가 종료될 때까지 로딩표시
    progress_step.step_start();

    reader.readAsBinaryString(excelFile);

    progress_step.step_1();

    await new Promise((resolve) => {
        reader.onload = function(event) {
            const data = event.target.result;
            workbook = XLSX.read(data, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const firstSheet = workbook.Sheets[firstSheetName];

            /* 빈칸이 발생한 경우 해당 값이 빈 칸인 요소를 생성하여 추가함 */

            // 셀의 최대 행 번호를 구함

            let cellList = [];

            for (let i in firstSheet) { cellList.push(i) };

            cellList.sort((i, j) => {
                let cellNumber_i = parseInt(i.match(/\d+/g));
                let cellNumber_j = parseInt(j.match(/\d+/g));
                return cellNumber_i - cellNumber_j;
            });

            const maxCell = parseInt(cellList[cellList.length - 4].match(/\d+/g))

            // 최대 행 번호까지 빈 칸인 셀을 생성해서 채움

            cellCollist = ['A', 'B', 'C', 'D', 'E', 'F'];

            for (let i = 0; i <= cellCollist.length - 1; i++) {
                const cellCol = cellCollist[i];
                for (let j = 9; j <= maxCell; j++) {
                    const cellName = cellCol + String(j);
                    if (!(cellName in firstSheet)) {
                        // 아래 값은 json으로 변환 시 undefined 값이 됨
                        firstSheet[cellName] = { t: 's', v: '', r: '<t></t>', h: '', w: '' };
                    }
                }
            }
            /*---------------------------------------------------*/

            excelFile_data = XLSX.utils.sheet_to_json(firstSheet);
            resolve();
        };
    });
    return [excelFile, excelFile_data, workbook];
};

// 받은 excel data를 각종 배열에 담는 함수 ( 누가 이 함수좀 잘 보이게 줄여줘...)
function push_exceldata(excelFile_data) {
    let j = 0;
    let check_videoid_list = [];
    let check_array = [];

    for (let i in excelFile_data) {
        if (j > 6) {
            let song_info = [];

            /* 제목 부분 */

            song_info.push(excelFile_data[i]['맵 제작 프리셋 양식파일']);

            /* 곡 부분 */

            song_info.push(excelFile_data[i]['__EMPTY']);

            /* 정답 부분 */

            let answer = excelFile_data[i]['__EMPTY_1'];

            if (!answer || !answer.replace(/,/g, "").trim()) {
                song_info.push("");
            } else {
                let answerList = new Set(answer.split(',').map(item => item.trim()).filter(Boolean));
                for (let i of answerList) { answerList.add(i.replace(/\s+/g, "")) };
                song_info.push(Array.from(answerList).join(","));
            };

            /* 힌트 부분 */

            song_info.push(excelFile_data[i]['__EMPTY_2'])

            /* 곡 링크 부분 */

            if (excelFile_data[i]['__EMPTY_3'].split('v=')[1]) {
                song_info.push(excelFile_data[i]['__EMPTY_3'].split('v=')[1].substring(0, 11));
            } else if (excelFile_data[i]['__EMPTY_3'].split('/')[3]) {
                song_info.push(excelFile_data[i]['__EMPTY_3'].split('/')[3].substring(0, 11));
            } else { song_info.push("") };

            /* 재생 시간 부분 */

            let play_time = excelFile_data[i]['__EMPTY_4'];

            if (play_time) { play_time = play_time.replace(/[^0-9:.~]/g, "") };
            if (play_time.split("~").length === 2) {

                let start_time = play_time.split("~")[0];
                let end_time = play_time.split("~")[1];

                let start_point_number = 0;
                let start_number = 0;

                let end_point_number = 0;
                let end_number = 0;

                if (start_time.split(".").length === 2 && start_time.split(":").length < 4) {
                    start_point_number = parseFloat("0." + start_time.split(".")[1]);
                    start_time = start_time.split(".")[0];

                    let multiples = 1;
                    for (let i of start_time.split(":").reverse()) {
                        start_number += parseFloat(i) * multiples;
                        multiples *= 60;
                    }
                    start_time = start_number + start_point_number;

                } else if (start_time.indexOf(".") === -1 && start_time.split(":").length < 4) {

                    let multiples = 1;
                    for (let i of start_time.split(":").reverse()) {
                        start_number += parseFloat(i) * multiples;
                        multiples *= 60;
                    }
                    start_time = start_number;
                } else { start_time = 0 };

                if (end_time.split(".").length === 2 && end_time.split(":").length < 4) {
                    end_point_number = parseFloat("0." + end_time.split(".")[1]);
                    end_time = end_time.split(".")[0];

                    let multiples = 1;
                    for (let i of end_time.split(":").reverse()) {
                        end_number += parseFloat(i) * multiples;
                        multiples *= 60;
                    }
                    end_time = end_number + end_point_number;

                } else if (end_time.indexOf(".") === -1 && end_time.split(":").length < 4) {

                    let multiples = 1;
                    for (let i of end_time.split(":").reverse()) {
                        end_number += parseFloat(i) * multiples;
                        multiples *= 60;
                    }
                    end_time = end_number;
                } else { start_time = 0 };

                if (start_time >= end_time) { end_time = 0 };

                song_info.push(start_time);
                song_info.push(end_time);

            } else {
                song_info.push("");
                song_info.push("");
            };

            if (document.querySelectorAll('h4')[j - 7]) {
                song_info.push(document.querySelectorAll('h4')[j - 7].innerHTML);
            } else { song_info.push("") };

            /* 올바른 곡 양식인지 체크 */

            if (song_info[0] && song_info[1] && song_info[2] && song_info[4]) {
                check_array.push(song_info);
                check_videoid_list.push(song_info[4]);
            }
            song_info = [];
        };
        j++;
    };
    return [check_videoid_list, check_array];
};

// videoid의 유효성을 검사하는 함수
async function checking_videoid(check_videoid_list, check_array) {
    const videoid_checking = await fetch('/check_videoid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(check_videoid_list)
    });

    //유효성 검사결과를 수신

    const videoid_check_result = await videoid_checking.json();

    // 유효하지 못한 링크 발견 시 해당 곡 정보를 담은 텍스트파일을 다운로드 시킴
    if (videoid_check_result.length > 0) {
        let textdata = "";

        progress_step.step_fail();

        alert('재생되지 않는 영상링크가 발견되었습니다.');
        alert('해당링크의 곡정보가 담긴 파일을 다운로드합니다.');

        for (let videoid of videoid_check_result) {
            textdata += String(check_videoid_list.indexOf(videoid) + 9) + ". ";
            textdata += check_array[check_videoid_list.indexOf(videoid)].slice(0, 2).join(', ');
            textdata += "\n";
        }

        const blob = new Blob([textdata], { type: 'text/plain' });
        const link = document.createElement('a');

        link.href = URL.createObjectURL(blob);
        link.download = '잘못된 링크를 가진 곡 목록.txt';
        link.click();

        URL.revokeObjectURL(link.href);
    };
    return videoid_check_result;
};

function trans_data(check_array) {
    let data = [];

    for (let i of check_array) {
        const title = i[0];
        const song = i[1];
        const thumbnail = "https://img.youtube.com/vi/" + i[4] + "/sddefault.jpg"
        const songURL = "https://www.youtube.com/watch?v=" + i[4];
        const answer = i[2];
        const hint = i[3];
        const startTime = i[5];
        const endTime = i[6];
        const id = i[7];

        if (id) {
            data.push({
                Music_id: id,
                title: title,
                song: song,
                thumbnail: thumbnail,
                songURL: songURL,
                answer: answer,
                hint: hint,
                startTime: startTime,
                endTime: endTime
            });
        } else {
            data.push({
                title: title,
                song: song,
                thumbnail: thumbnail,
                songURL: songURL,
                answer: answer,
                hint: hint,
                startTime: startTime,
                endTime: endTime
            });
        };
    };
    return data;
}

function response_data(data, response_url) {
    data = JSON.stringify(data);
    $.ajax({
        type: "POST",
        url: response_url,
        dataType: "json",
        contentType: "application/json",
        data: data,
        error: function(request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            progress_step.step_fail();

            alert("서버 전송 중 오류가 발생하였습니다.")
            location.reload();

        },
        success: function(data) {

            progress_step.step_end();

            alert("등록 완료되었습니다.");
            window.location.href = '/Map';
        }
    });
}

async function data_convert_upload(button) {

    let [excelFile, excelFile_data, workbook] = await file_load();
    if (!excelFile) { return };

    // 양식 파일이 맞는지 확인하는 부분

    progress_step.step_2();

    if (!workbook['Workbook'] || !workbook['Styles'] || !workbook['Directory'] || !excelFile_data) {

        progress_step.step_fail();

        alert("올바른 양식 파일이 아닙니다.");
        return;
    };

    progress_step.step_3();

    let [check_videoid_list, check_array] = push_exceldata(excelFile_data);

    progress_step.step_4();

    let check_videoid_list_count = await checking_videoid(check_videoid_list, check_array);
    if (check_videoid_list_count.length > 0) {
        location.reload();
        return;
    };

    progress_step.step_5();

    let data = trans_data(check_array);

    if (button === 'save') {
        let split_file_name = excelFile.name.split('.')
        split_file_name.pop()

        data.push({
            MapName: split_file_name.join('.'),
            MapProducer: document.querySelector("#User_Name").innerHTML,
            Thumbnail: data[0].thumbnail || 'basic'
        });

        response_data(data, '/submit-to-db');
    } else if (button === 'insert') {
        data.push({
            MapName: document.querySelector("#MapName-input").value,
            MapProducer: document.querySelector("#User_Name").innerHTML,
            mission_Id: document.querySelector("#Mission_id").innerHTML,
            mission_description: document.querySelector("#Mission_description").innerHTML,
            Thumbnail: data[0].thumbnail || 'basic'
        });

        response_data(data, '/update-to-db');
    };
};