document.getElementById('file_save_btn').addEventListener('click', data_convert_save);
document.getElementById('file_insert_btn').addEventListener('click', data_convert_insert);

async function data_convert_save() {
    // 파일 로드
    const excelFile = document.getElementById('excelUpload').files[0];
    const check_array = [];

    let excelFile_data = "";
    let workbook = "";

    let progressBar = document.querySelector('.progress-fill');

    // 업로드된 파일이 없는 경우
    if (!excelFile) {
        alert("업로드할 파일이 존재하지 않습니다.");
        return;
    } else if (excelFile.name.split('.').pop() !== "xlsx") {

        alert("올바른 양식 파일이 아닙니다.");
        return;
    }

    const reader = new FileReader();

    //함수가 종료될 때까지 로딩표시
    document.querySelector('.spinner-text').style.display = 'block';
    document.querySelector('.spinner').style.display = 'block';

    document.querySelector('.spinner-text').textContent = '파일을 읽어오는중...'
    document.querySelector('.progress-bar').style.display = 'block';

    reader.readAsBinaryString(excelFile);
    //비동기 작업 부분

    progressBar.style.width = 20 + "%";

    document.querySelector('.spinner-text').textContent = '데이터 로드중...'

    await new Promise((resolve) => {
        reader.onload = function(event) {
            const data = event.target.result;
            workbook = XLSX.read(data, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const firstSheet = workbook.Sheets[firstSheetName];
            excelFile_data = XLSX.utils.sheet_to_json(firstSheet);
            resolve();
        };
    });

    // 양식 파일이 맞는지 확인하는 부분
    console.log(workbook);
    progressBar.style.width = 40 + "%";

    document.querySelector('.spinner-text').textContent = '양식 체크중...'
    if (!workbook['Workbook'] || !workbook['Styles'] || !workbook['Directory'] || !excelFile_data) {
        document.querySelector('.spinner-text').textContent = '요청 처리중...'
        document.querySelector('.spinner-text').style.display = 'none';
        document.querySelector('.spinner').style.display = 'none';
        alert("올바른 양식 파일이 아닙니다.");

        document.querySelector('.progress-bar').style.display = 'none';
        progressBar.style.width = 0 + "%";

        return;
    };

    progressBar.style.width = 60 + "%";

    document.querySelector('.spinner-text').textContent = '데이터 변환중...'
    let j = 0;
    for (let i in excelFile_data) {
        if (j > 6) {
            let song_info = [];
            song_info.push(excelFile_data[i]['맵 제작 프리셋 양식파일'])
            song_info.push(excelFile_data[i]['__EMPTY'])

            if (document.getElementById('checkbox_id').checked) {
                let answer_list = new Set(excelFile_data[i]['__EMPTY_1'].split(','));
                for (let i of answer_list) {answer_list.add(i.replace(/\s/g, ""))};
                song_info.push(Array.from(answer_list).join(","));
            } else {song_info.push(excelFile_data[i]['__EMPTY_1'])};

            song_info.push(excelFile_data[i]['__EMPTY_2'])

            if (excelFile_data[i]['__EMPTY_3'] === undefined) {break};

            if (excelFile_data[i]['__EMPTY_3'].split('v=')[1]) {
                song_info.push(excelFile_data[i]['__EMPTY_3'].split('v=')[1].substring(0, 11));
            } else if (excelFile_data[i]['__EMPTY_3'].split('/')[3]) {
                song_info.push(excelFile_data[i]['__EMPTY_3'].split('/')[3].substring(0, 11));
            } else {song_info.push(null)};

            if (song_info[0] === undefined || song_info[1] === undefined || song_info[2] === undefined) {break};
            if (song_info[3] === undefined) {song_info[3] = null};

            let play_time = excelFile_data[i]['__EMPTY_4'];
            if (play_time === undefined) {play_time = ""};
            if (play_time !== "") {play_time = play_time.replace(/[^0-9:.~]/g, "")};
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
                } else {start_time = null};

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
                } else {end_time = null};

                song_info.push(start_time);
                song_info.push(end_time);

            } else {
                song_info.push(null);
                song_info.push(null);
            };

            check_array.push(song_info);
            song_info = [];
        };
        j++;
    };

    progressBar.style.width = 80 + "%";

    document.querySelector('.spinner-text').textContent = '데이터 전송중...'

    let split_file_name = excelFile.name.split('.')
    split_file_name.pop()

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
    }

    data.push({
        MapName: split_file_name.join('.'),
        MapProducer: document.querySelector("#User_Name").innerHTML,
        Thumbnail: data[0].thumbnail || 'basic'
    });
    data = JSON.stringify(data);
    $.ajax({
        type: "POST",
        url: "/submit-to-db",
        dataType: "json",
        contentType: "application/json",
        data: data,
        error: function(request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
            document.querySelector('.spinner-text').style.display = 'none';
            document.querySelector('.spinner').style.display = 'none';

            document.querySelector('.progress-bar').style.display = 'none';
            progressBar.style.width = 0 + "%";

            alert("서버 전송 중 오류가 발생하였습니다.")
            location.reload();

        },
        success: function(data) {

            progressBar.style.width = 100 + "%";

            console.log("통신데이터 값 : ", data);
            alert("등록 완료되었습니다.");
            // window.location.href = '/Map';
        }
    });
};


/*-------------------------------------------------*/



async function data_convert_insert() {
    // 파일 로드
    const excelFile = document.getElementById('excelUpload').files[0];
    const check_array = [];

    let excelFile_data = "";
    let workbook = "";

    let progressBar = document.querySelector('.progress-fill');

    // 업로드된 파일이 없는 경우
    if (!excelFile) {
        alert("업로드할 파일이 존재하지 않습니다.");
        return;
    } else if (excelFile.name.split('.').pop() !== "xlsx") {

        alert("올바른 양식 파일이 아닙니다.");
        return;
    }

    const reader = new FileReader();

    //함수가 종료될 때까지 로딩표시
    document.querySelector('.spinner-text').style.display = 'block';
    document.querySelector('.spinner').style.display = 'block';

    document.querySelector('.spinner-text').textContent = '파일을 읽어오는중...'
    document.querySelector('.progress-bar').style.display = 'block';

    reader.readAsBinaryString(excelFile);
    //비동기 작업 부분

    progressBar.style.width = 20 + "%";

    document.querySelector('.spinner-text').textContent = '데이터 로드중...'

    await new Promise((resolve) => {
        reader.onload = function(event) {
            const data = event.target.result;
            workbook = XLSX.read(data, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const firstSheet = workbook.Sheets[firstSheetName];
            excelFile_data = XLSX.utils.sheet_to_json(firstSheet);
            resolve();
        };
    });

    // 양식 파일이 맞는지 확인하는 부분

    progressBar.style.width = 40 + "%";

    document.querySelector('.spinner-text').textContent = '양식 체크중...'
    if (!workbook['Workbook'] || !workbook['Styles'] || !workbook['Directory'] || !excelFile_data) {
        document.querySelector('.spinner-text').textContent = '요청 처리중...'
        document.querySelector('.spinner-text').style.display = 'none';
        document.querySelector('.spinner').style.display = 'none';
        alert("올바른 양식 파일이 아닙니다.");

        document.querySelector('.progress-bar').style.display = 'none';
        progressBar.style.width = 0 + "%";

        return;
    };

    progressBar.style.width = 60 + "%";

    document.querySelector('.spinner-text').textContent = '데이터 변환중...'
    let j = 0;
    for (let i in excelFile_data) {
        if (j > 6) {
            let song_info = [];
            song_info.push(excelFile_data[i]['맵 제작 프리셋 양식파일'])
            song_info.push(excelFile_data[i]['__EMPTY'])

            if (document.getElementById('checkbox_id').checked) {
                let answer_list = new Set(excelFile_data[i]['__EMPTY_1'].split(','));
                for (let i of answer_list) {answer_list.add(i.replace(/\s/g, ""))};
                song_info.push(Array.from(answer_list).join(","));
            } else {song_info.push(excelFile_data[i]['__EMPTY_1'])};

            song_info.push(excelFile_data[i]['__EMPTY_2'])

            if (excelFile_data[i]['__EMPTY_3'] === undefined) {break};

            if (excelFile_data[i]['__EMPTY_3'].split('v=')[1]) {
                song_info.push(excelFile_data[i]['__EMPTY_3'].split('v=')[1].substring(0, 11));
            } else if (excelFile_data[i]['__EMPTY_3'].split('/')[3]) {
                song_info.push(excelFile_data[i]['__EMPTY_3'].split('/')[3].substring(0, 11));
            } else {song_info.push(null)};

            if (song_info[0] === undefined || song_info[1] === undefined || song_info[2] === undefined) {break};
            if (song_info[3] === undefined) {song_info[3] = null};

            let play_time = excelFile_data[i]['__EMPTY_4'];
            if (play_time === undefined) {play_time = ""};
            if (play_time !== "") {play_time = play_time.replace(/[^0-9:.~]/g, "")};
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
                } else {start_time = 0};

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
                } else {start_time = 0};

                song_info.push(start_time);
                song_info.push(end_time);

            } else {
                song_info.push(null);
                song_info.push(null);
            };

            if (document.querySelectorAll('h4')[j - 7]) {
                song_info.push(document.querySelectorAll('h4')[j - 7].innerHTML);
            } else {song_info.push(null)};

            check_array.push(song_info);
            song_info = [];
        };
        j++;
    };

    progressBar.style.width = 80 + "%";

    document.querySelector('.spinner-text').textContent = '데이터 전송중...'

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
                Music_id : id,
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

    data.push({
        MapName: document.querySelector("#MapName-input").value,
        MapProducer: document.querySelector("#User_Name").innerHTML,
        mission_Id : document.querySelector("#Mission_id").innerHTML,
        Thumbnail: data[0].thumbnail || 'basic'
    });
    data = JSON.stringify(data);
    $.ajax({
        type: "POST",
        url: "/update-to-db",
        dataType: "json",
        contentType: "application/json",
        data: data,
        error: function(request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
            document.querySelector('.spinner-text').style.display = 'none';
            document.querySelector('.spinner').style.display = 'none';

            document.querySelector('.progress-bar').style.display = 'none';
            progressBar.style.width = 0 + "%";

            alert("서버 전송 중 오류가 발생하였습니다.")
            location.reload();

        },
        success: function(data) {

            progressBar.style.width = 100 + "%";

            console.log("통신데이터 값 : ", data);
            alert("등록 완료되었습니다.");
            window.location.href = '/Map';
        }
    });
};