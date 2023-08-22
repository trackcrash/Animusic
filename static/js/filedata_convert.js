document.getElementById('file_upload_btn').addEventListener('click', data_convert);

async function data_convert() {
    // 파일 로드
    const excelFile = document.getElementById('excelUpload').files[0];
    const check_array = [];
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

    const reader = new FileReader();

    //함수가 종료될 때까지 로딩표시
    document.querySelector('.spinner-text').style.display = 'block';
    document.querySelector('.spinner').style.display = 'block';

    reader.readAsBinaryString(excelFile);

    //비동기 작업 부분
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
    if (!workbook['Workbook'] || !workbook['Styles'] || !workbook['Directory'] || !excelFile_data) {
        document.querySelector('.spinner-text').style.display = 'none';
        document.querySelector('.spinner').style.display = 'none';
        alert("올바른 양식 파일이 아닙니다.");
        return;
    };

    let j = 0;
    for (let i in excelFile_data) {
        if (j > 4) {
            let song_info = [];
            song_info.push(excelFile_data[i]['맵 제작 프리셋 양식파일'])
            song_info.push(excelFile_data[i]['__EMPTY'])
            song_info.push(excelFile_data[i]['__EMPTY_1'])
            song_info.push(excelFile_data[i]['__EMPTY_2'])
            song_info.push(excelFile_data[i]['__EMPTY_3'])
            song_info.push(excelFile_data[i]['__EMPTY_4'])
            song_info.push(excelFile_data[i]['__EMPTY_5'])
            if (song_info[0] === undefined || song_info[1] === undefined || song_info[2] === undefined || song_info[4] === undefined) {break};
            if (song_info[3] === undefined) {song_info[3] = ""};
            if (song_info[5] === undefined) {song_info[5] = ""};
            if (song_info[6] === undefined) {song_info[6] = ""};
            check_array.push(song_info);
            song_info = [];
        };
        j++;
    };
    console.log(check_array)

};

/*
// 모든 작업이 끝나면 로딩 숨기기
document.querySelector('.spinner-text').style.display = 'none';
document.querySelector('.spinner').style.display = 'none';
*/