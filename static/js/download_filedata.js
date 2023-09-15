const downloadBtn = document.getElementById('download_excelfile')
if (downloadBtn) {downloadBtn.addEventListener('click', data_convert_download)};

async function data_convert_download() {

    const items = document.querySelectorAll('.box');
    let exceldata = [];
    for (let item of items) {
        // 웹페이지에 있는 곡 정보를 각각 변수선언 하는 곳
        const title = item.querySelector('h3').innerText;
        const song = item.querySelector('p').innerText;
        const thumbnail = item.querySelector('img').src;
        const songURL = item.querySelector('input').value;
        let answer = item.querySelector('h1').innerText;
        let another_answer;

        let hint = "", startTime = 0, endTime = 0;

        if (item.querySelector('h2').innerText !== '') {hint = item.querySelector('h2').innerText};
        if (parseFloat(item.querySelector('h5').innerText)) {startTime = item.querySelector('h5').innerText};
        if (parseFloat(item.querySelector('h6').innerText)) {endTime = item.querySelector('h6').innerText};

        // 해당 곡 정보를 액셀파일 데이터에 담는 곳

        let song_info = [];
        song_info.push(title || "");
        song_info.push(song || "");

        if (answer.split('],').length > 1) {
            another_answer = answer.split('],').slice(1);
            answer = answer.split('],')[0].slice(1);
        } else if (answer.split('],').length = 1) {
            answer = answer.slice(1, -1);
        }
        song_info.push(answer || "");
        song_info.push(hint || "");
        song_info.push(songURL || "");

        let before_time = (
            String(Math.floor(startTime / 3600)) + ":" +
            String(Math.floor((startTime % 3600) / 60)) + ":" +
            String(startTime % 60) + "." +
            String((startTime - Math.floor(startTime)) * 1000)
        );

        let after_time = (
            String(Math.floor(endTime / 3600)) + ":" +
            String(Math.floor((endTime % 3600) / 60)) + ":" +
            String(endTime % 60) + "." +
            String((endTime - Math.floor(endTime)) * 1000)
        );

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

        if (before_time_list.length < 1) {before_time = ""}
        else {before_time = before_time_list.join("")};

        if (after_time_list.length < 1) {after_time = ""}
        else {after_time = after_time_list.join("")};

        if (before_time && after_time) {play_time = before_time + "~" + after_time}
        else if (before_time) {play_time = before_time + "~"}
        else if (after_time) {play_time = "~" + after_time};

        song_info.push(play_time);

        // 복수정답이 있다면 추가
        if (another_answer) {
            const last_answer = another_answer.pop();
            if (another_answer) {
                song_info = song_info.concat(another_answer.map(answer_text => answer_text.slice(1)));
            };
            song_info.push(last_answer.slice(1, -1));
        };

        exceldata.push(song_info);
        song_info = [];
    };

    const response = await fetch('/download_excelfile'); // 서버로부터 양식 파일 다운로드 요청
    const data = await response.arrayBuffer();
    let workbook = XLSX.readFile(data);

    let worksheet = workbook.Sheets['곡 정보'];
    let secondworksheet = workbook.Sheets['맵 설명'];

    // 웹페이지에서 가져온 데이터를 새로운 열에 추가

    const start_row = 10;   // 양식 내용이 바뀌면 수정해야 됨

    // 내용의 끝 부분을 보장하기 위해서 최대 행과 열 번호를 구함
    let max_row = start_row + exceldata.length;
    let max_col = 0;

    // 웹페이지의 데이터를 worksheet에 추가
    for (let i = 0; i < exceldata.length; i++) {
        for (let j = 0; j < exceldata[i].length; j++) {
            const cell_name = XLSX.utils.encode_col(j) + String(start_row + i);
            worksheet[cell_name] = {
                t: 's',
                v: exceldata[i][j]
            };
            if (max_col < j) {max_col = j};
        };
    };

    max_col = XLSX.utils.encode_col(max_col) // 열 번호로 교체
    worksheet['!ref'] = 'A1:' + max_col + max_row; // 범위를 실제범위로 조정

    // 웹페이지의 설명문을 secondworksheet에 추가
    let descript_text = document.getElementById('descript-textfield').value.split('\n');
    while (descript_text.length > 0 && !descript_text[descript_text.length - 1]) {descript_text.pop()};

    let secondworksheet_max_row = 2; // 맵 설명 양식 바뀌면 수정필요
    descript_text.forEach((text, index) => {
        secondworksheet['A' + (index + 3)] = {t: 's', v: text};
        secondworksheet_max_row++;

        if (index > 3) { // 사용자가 작성한 설명문의 길이에 따른 셀 병합과정
            secondworksheet['!merges'].push ({
                s: {c: 0, r: secondworksheet_max_row},
                e: {c: 4, r: secondworksheet_max_row}
            })
        }
    });

    secondworksheet['!ref'] = 'A1:' + 'A' + secondworksheet_max_row;

    xlsx_style(workbook, max_col);
};

function xlsx_style(sheetjs_data, max_col) { // max_col은 '곡 정보' 시트의 작성된 최대 열 번호
    const workbook = new ExcelJS.Workbook();

    // 가져온 엑셀 데이터를 바탕으로 시트 생성
    sheetjs_data.SheetNames.forEach(sheet_name => {workbook.addWorksheet(sheet_name)});

    // 곡 정보 시트 조정 (셀 병합)

        // 첫 번째 시트
    sheetjs_data.Sheets['곡 정보']['!merges'].forEach(merge_data => {
        const start_cell = XLSX.utils.encode_col(merge_data.s.c) + (merge_data.s.r + 1);
        const end_cell = XLSX.utils.encode_col(merge_data.e.c) + (merge_data.e.r + 1);

        workbook._worksheets[1].mergeCells(start_cell + ":" + end_cell);
    })
    delete sheetjs_data.Sheets['곡 정보']['!merges']
    delete sheetjs_data.Sheets['곡 정보']['!ref']

        // 두 번째 시트
    sheetjs_data.Sheets['맵 설명']['!merges'].forEach(merge_data => {
        const start_cell = XLSX.utils.encode_col(merge_data.s.c) + (merge_data.s.r + 1);
        const end_cell = XLSX.utils.encode_col(merge_data.e.c) + (merge_data.e.r + 1);

        workbook._worksheets[2].mergeCells(start_cell + ":" + end_cell);
    })
    delete sheetjs_data.Sheets['맵 설명']['!merges']
    delete sheetjs_data.Sheets['맵 설명']['!ref']

    // 셀 텍스트 입력 및 스타일 적용
    Object.keys(sheetjs_data.Sheets['곡 정보']).forEach(cell_data => {
        const worksheet = workbook.getWorksheet('곡 정보')
        const cell = worksheet.getCell(cell_data);
        const sheetjs_worksheet = sheetjs_data.Sheets['곡 정보']
        const sheetjs_cell = sheetjs_worksheet[cell_data];

        cell.value = sheetjs_cell.v;
        cell.alignment = {horizontal: 'center'};

        // 설명부분 스타일 적용 (양식 변경 시 수정 필요)
        const style_cell = [
            'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9',
            'B9', 'C9', 'D9', 'E9', 'F9'
        ]
        if (style_cell.includes(cell_data)) {
            cell.border = {
                top: {style: 'thin'},
                left: {style: 'thin'},
                bottom: {style: 'thin'},
                right: {style: 'thin'}
            };

            // A1 ~ F9 까지의 각각의 글자크기 적용
            if (cell_data === 'A1') {cell.font = {size: 20, bold: true}}
            else {cell.font = {size: 12}};

            // A1 ~ F9 까지의 행 크기 적용
            const row_num = cell_data.match(/\d+/)[0];
            if (parseInt(row_num) < 2) {worksheet.getRow(row_num).height = 30}
            else {worksheet.getRow(row_num).height = 20};
        };
    });

    // 두 번째 시트 적용

    Object.keys(sheetjs_data.Sheets['맵 설명']).forEach(cell_data => {
        const worksheet = workbook.getWorksheet('맵 설명');
        const cell = worksheet.getCell(cell_data);
        const sheetjs_worksheet = sheetjs_data.Sheets['맵 설명'];
        const sheetjs_cell = sheetjs_worksheet[cell_data];

        cell.value = sheetjs_cell.v;
        cell.alignment = {horizontal: 'center'};

        // A1 ~ A2 의 셀 스타일 적용
        if (Array.from(sheetjs_worksheet).indexOf('A2') >= Array.from(sheetjs_worksheet).indexOf(cell_data)) {
            cell.border = {
                top: {style: 'thin'},
                left: {style: 'thin'},
                bottom: {style: 'thin'},
                right: {style: 'thin'}
            };
            // A1의 스타일 적용
            if (cell_data === 'A1') {
                const row_num = cell_data.match(/\d+/)[0];
                cell.font = {size: 15};
                worksheet.getRow(row_num).height = 30;
            };
        }
    });

    // 행 고정 기능
    workbook.getWorksheet('곡 정보').views = [
        {state: 'frozen', xSplit: 0, ySplit: 9, topLeftCell: 'A1', activeCell: 'A10'}
    ]

    workbook.getWorksheet('맵 설명').views = [
        {state: 'frozen', xSplit: 0, ySplit: 2, topLeftCell: 'A1', activeCell: 'A3'}
    ]

    // 각 시트의 열 너비 조정 (getColumn 함수는 알파벳과 숫자 모두 지원함)
    for (let i = 1; i <= max_col.charCodeAt(0); i++) {
        workbook.getWorksheet('곡 정보').getColumn(i).width = 25;
    }

    for (let i = 1; i <= 'E'.charCodeAt(0); i++) {
        workbook.getWorksheet('맵 설명').getColumn(i).width = 15;
    }

    // 다운로드 부분
    workbook.xlsx.writeBuffer().then(data => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = document.getElementById('MapName-input').value || '제목 없음' + '.xlsx';
        a.click();
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
    });
}