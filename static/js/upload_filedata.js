document.getElementById('changed-filedata').addEventListener('click', async () => data_convert_upload());

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

            excelFile_data = XLSX.utils.sheet_to_json(firstSheet, { range: 12 });
            explanation_data = XLSX.utils.sheet_to_json(secondSheet, { range: 2, header: ['row'] });
            resolve();
        };
        reader.readAsArrayBuffer(excelFile);
    });
    return [excelFile, excelFile_data, explanation_data, workbook];
};

// 받은 excel data를 각종 배열에 담는 함수 ( 누가 이 함수좀 잘 보이게 줄여줘...)
function push_exceldata(excelFile_data) {
    let check_array = [];
    excelFile_data.forEach(cell_data => {
        let i = 0;
        let song_info;
        let category_list =[];
        let answer_list = [];
        let answer ="";
        const name = cell_data['매체 이름'];
        const song_name = cell_data['곡 이름'];
        const hint = cell_data['힌트'];
        const songLink = cell_data['곡 링크'];
        let cate;
        let answer_plus = [];
        let songURL = '';
        let thumbnail = '';
        let play_time = cell_data['재생 시간'] || '';
        let start_time = 0;
        let end_time = 0;

        delete cell_data['매체 이름'];
        delete cell_data['곡 이름'];
        delete cell_data['힌트'];
        delete cell_data['곡 링크'];
        delete cell_data['재생 시간'];

        //곡 링크를 videoid로 가공 (main.js의 함수 사용)
        try{
            const videoid = split_ytLink(songLink);
            songURL = "https://www.youtube.com/watch?v=" + videoid;
            thumbnail = "https://img.youtube.com/vi/" + videoid + "/sddefault.jpg";
        } catch (error) {};

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
        for(const key in cell_data )
        {
            if(cell_data[key])
            {
                const categoryPattern = /^[\p{L}\d]+:[\d\s]*$/u;
                if(categoryPattern.test(cell_data[key]))
                {
                    if(answer)
                    {
                        answer_list[i] = answer;
                        i++;
                    }
                    category_list[i]='['+cell_data[key]+']';
                    answer = "";
                }
                else
                {
                    if(category_list.length > 0)
                    {
                        answer_plus = cell_data[key];
                        if (answer_plus && answer) {answer += ","+"["+answer_plus+"]"}
                        else if (answer_plus) {
                            answer = "["+answer_plus+"]";
                        };    
                    }
                }
            }
        }
        answer_list[i] = answer;
        answer = answer_list.map(item=>item).join('/');
        cate = category_list.map(item=>item).join(',');  
        song_info = {
            title: name,
            song: song_name,
            songURL: songURL,
            thumbnail: thumbnail,
            answer: answer,
            hint: hint,
            startTime: start_time,
            endTime: end_time,
            cate:cate
        };
        check_array.push(song_info);
        song_info = {};
    });
    return check_array;

};

async function data_convert_upload() {

    let [excelFile, excelFile_data, explanation_data, workbook] = await file_load();
    if (!excelFile) { return };

    // 양식 파일이 맞는지 확인하는 부분

    if (!workbook['Workbook'] || !workbook['Styles'] || !workbook['Directory'] || !excelFile_data) {

        alert("올바른 양식 파일이 아닙니다.");
        return;
    };

    // 파일 내용을 가공함

    let check_array = push_exceldata(excelFile_data);

    console.log(check_array);
    // 가공된 내용을 .box에 저장 (없으면 생성) + 변경되지않은 .box는 삭제

    const boxList = document.querySelectorAll('.box');
    check_array.forEach((song, index) => {
        if (boxList.length >= index + 1) {

            boxList[index].querySelector('h3').innerText = song.title || '';
            boxList[index].querySelector('p').innerText = song.song || '';
            boxList[index].querySelector('img').src = song.thumbnail;
            boxList[index].querySelector('input').value = song.songURL;
            boxList[index].querySelector('h1').innerText = song.answer || '';
            boxList[index].querySelector('h2').innerText = song.hint || '';
            boxList[index].querySelector('h5').innerText = song.startTime;
            boxList[index].querySelector('h6').innerText = song.endTime;
            boxList[index].querySelector('cate').innerText = song.cate;
        } else {

            //main.js의 함수 사용
            const newBox = createInfoItem(
                song.title || '',
                song.song || '',
                song.songURL,
                song.thumbnail,
                song.answer,
                song.hint || '',
                song.startTime,
                song.endTime,
                '',
                song.cate
                );
            document.querySelector('.add_box').before(newBox);
            modifyFunction();
        };
    });

    // 파일의 곡 갯수보다 넘치는 .box는 제거
    if (check_array.length < boxList.length) {
        boxList.forEach((box, index) => {
            if (index > check_array.length - 1) {box.remove()}
        });
    };

    // 파일의 이름을 맵의 제목으로 변경
    let filename = document.getElementById('excelUpload').files[0].name.split('.');
    filename.pop();
    document.querySelector("#MapName-input").value = filename.join('.');
    document.getElementById("MapName-label").textContent = filename.join('.');

    // 설명문을 파일의 내용으로 변경
    const explanation_textfield = document.getElementById('descript-textfield');
    explanation_textfield.value = explanation_data.map(cell_data => cell_data['row']).join('\n');
};