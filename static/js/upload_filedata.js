document.getElementById('changed-filedata').addEventListener('click', async () => await file_load());

document.getElementById('excelUpload').addEventListener('change', (e) => {
    const fileList = e.target.files;
    const excelUpload_label = document.querySelector('label[for="excelUpload"]');

    if (fileList.length > 0) {
        excelUpload_label.textContent = "맵 양식 제출: " + fileList[0].name;
        excelUpload_label.style.justifyContent = 'left';
    }
    else {
        excelUpload_label.textContent = "맵 양식 제출";
        excelUpload_label.style.justifyContent = '';
    };
});

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

    await new Promise((resolve) => {

        reader.onload = (e) => {
            workbook = XLSX.read(e.target.result, { type: 'binary' });
            const firstSheet = workbook.Sheets['곡 정보'];
            const secondSheet = workbook.Sheets['맵 설명'];

            // range 값은 읽어올 시작 점 지정함 (ex. 8 = 10행부터 (9행은 헤더역할을 함))

            excelFile_data = XLSX.utils.sheet_to_json(firstSheet, { range: 8 });
            resolve();
        };
        reader.readAsArrayBuffer(excelFile);
    });
    return 0//[excelFile, excelFile_data];
};

// 받은 excel data를 각종 배열에 담는 함수 ( 누가 이 함수좀 잘 보이게 줄여줘...)
function push_exceldata(excelFile_data) {
    let check_array = [];

    excelFile_data.forEach(cell_data => {
        let song_info = [];

        const name = cell_data['제목'];
        const song_name = cell_data['곡 이름'];
        const hint = cell_data['힌트'];
        const songURL = cell_data['곡 링크'];

        let answer = "[" + cell_data['정답'] + "]";
        let answer_plus = [];
        let play_time = excelFile_data['재생 시간'];
        let startTime = '';
        let endTime = '';

        delete cell_data['제목'];
        delete cell_data['곡 이름'];
        delete cell_data['힌트'];
        delete cell_data['곡 링크'];
        delete cell_data['정답'];
        delete cell_data['재생 시간'];

        // 재생 시간을 startTime, endTime 으로 분할 및 가공

        if (play_time) { play_time = play_time.replace(/[^0-9:.~]/g, "") };
        if (play_time.split("~").length === 2) {

            start_time = play_time.split("~")[0];
            end_time = play_time.split("~")[1];

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
        };

        // 복수 정답이 있다면 추가

        if (cell_data) {answer_plus = Object.values(cell_data).map(item => "[" + item + "]").join(',')};
        if (answer_plus) {answer += "," + answer_plus};

        song_info = {
            title: name,
            song: song_name,
            songURL: songURL,
            answer: answer,
            hint: hint,
            startTime: startTime,
            endTime: endTime
        };
        check_array.push(song_info);
        song_info = [];
    });
    return check_array;
};

async function data_convert_upload(button) {

    let [excelFile, excelFile_data, workbook] = await file_load();
    if (!excelFile) { return };

    // 양식 파일이 맞는지 확인하는 부분

    if (!workbook['Workbook'] || !workbook['Styles'] || !workbook['Directory'] || !excelFile_data) {

        alert("올바른 양식 파일이 아닙니다.");
        return;
    };

    let [check_videoid_list, check_array] = push_exceldata(excelFile_data);

    let check_videoid_list_count = await checking_videoid(check_videoid_list, check_array);
    if (check_videoid_list_count.length > 0) {
        location.reload();
        return;
    };

    let data = trans_data(check_array);

};