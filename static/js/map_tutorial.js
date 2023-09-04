const tutorial_Container = document.getElementById('tutorial-container');
const tutorial_Content = document.getElementById('tutorial-content');

function close_tutorial() {tutorial_Container.style.display = 'none'};

function open_tutorial() {
    // 튜토리얼 창을 보여 줌
    tutorial_Container.style.display = 'block';
    // 튜토리얼 내용을 작성하는 곳
    tutorial_Content.removeAttribute("style");
    tutorial_Content.innerHTML = `
        <div class="flex items-center">
            <span style="font-size: 20px;">맵을 처음 만드시는 분들을 위한 설명서</span>
            <button onclick="close_tutorial()" type="button" class="px-2 py-1 mt-1 ml-2 bg-red-500 text-white rounded hover:bg-red-600">&times;</button>
        </div>
        <span onclick="manual_make()" class="flex justify-start mt-10 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" style="font-size: 20px;">직접 입력하는 방법</span>
        <span onclick="auto_make()" class="flex justify-start mt-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" style="font-size: 20px;">엑셀파일을 이용하는 방법</span>
    `;
};

function manual_make() {
    tutorial_Content.setAttribute("style", "width: 500px; height: 700px;");
    tutorial_Content.innerHTML = `
        <div class="flex items-center justify-end">
            <button onclick="open_tutorial()" type="button" class="px-2 py-1 mt-1 bg-blue-500 text-white rounded hover:bg-blue-600">처음으로 돌아가기</button>
            <button onclick="close_tutorial()" type="button" class="px-2 py-1 mt-1 ml-2 bg-red-500 text-white rounded hover:bg-red-600">&times;</button>
        </div>
        <div class="mt-10 y-full">
            <span style="font-size: 24px">1. 맵 이름</span>
        </div>
        <div class="mt-2 y-full tutorial-font border border-solid border-green-500 rounded">
            <p><span>맵 이름을 적는 입력 칸은 입력 후</span>
                <span class="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">제목 저장하기</span>
                <span>를 누르면</span></p>
            <p><span>맵을 다 만들고 하단의</span>
                <span class="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition">저장하기</span>
                <span>또는</span>
                <span class="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">정보 수정하기</span></p>
            <p><span>버튼을 누르기 전 까지</span>
                <span>건드릴 일이 없습니다.</span></p>
            <p><span>혹시 맵 이름을 중간에 바꾸고 싶으시다면</span>
                <span class="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">제목 변경하기</span>
                <span>를 누르고</span></p>
            <p><span>바꾸시고 싶은 이름으로 변경 후</span></p>
            <p></span>다시</span>
                <span class="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">제목 저장하기</span>
                <span>를 누르시면 됩니다.</span></p>
        </div>
        <div class="mt-5 y-full p-2 border border-solid border-black rounded bg-gray-100">
            <label id="tutorial-mapname-label">맵 이름: </label>
            <div class="w-full flex">
                <input id="tutorial-mapname-input" class="w-1/2 p-2 mx-1 border border-gray-300 rounded" type="text">
                <button id="tutorial-mapname-insert" type="button" class="w-1/2 py-2 mx-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">제목 저장하기</button>
            </div>
        </div>
        <div class="flex flex-col mt-5">
            <div class="m-1 flex justify-end">
                <button id="tutorial-mapname-savebtn" type="button" class="w-1/2 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">저장하기</button>
            </div>
            <div class="m-1 flex justify-end">
                <button id="tutorial-mapname-insertbtn" type="button" class="w-1/2 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">정보 수정하기</button>
            </div>
        </div>
        <div class="flex flex-col mt-5 y-full p-2 border border-solid border-black rounded bg-gray-100" style="font-size: 18px;">
            <label>실제 적용되는 맵 이름</label>
            <label id="tutorial-mapname"></label>
        </div>
        <div class="flex" style="position: fixed; bottom: 30px; width: 90%;">
            <div class="w-1/2"></div>
            <div class="w-1/2 flex mt-10">
                <div class="w-1/2"></div>
                <button type="button" onclick="manual2_make()" class="py-1 mx-1 w-1/2 bg-red-300 text-white rounded hover:bg-red-400 transition">다음페이지 &#x25B6;</button>
            </div>
        </div>
    `;

    const tutorial_mapname_label = document.getElementById('tutorial-mapname-label');
    const tutorial_mapname_input = document.getElementById('tutorial-mapname-input');
    const tutorial_mapname_insert = document.getElementById('tutorial-mapname-insert');
    tutorial_mapname_insert.addEventListener('click', () => {
        if (tutorial_mapname_input.classList.contains('hidden')) {
            tutorial_mapname_insert.classList.remove('w-full');
            tutorial_mapname_insert.classList.add('w-1/2');
            tutorial_mapname_input.classList.remove('hidden');
            tutorial_mapname_insert.innerText = '제목 저장하기';
        } else {
            tutorial_mapname_label.textContent = "맵 이름: " + tutorial_mapname_input.value;
            tutorial_mapname_input.classList.add('hidden');
            tutorial_mapname_insert.classList.remove('w-1/2');
            tutorial_mapname_insert.classList.add('w-full');
            tutorial_mapname_insert.innerText = '제목 변경하기';
        };
    });
    const tutorial_mapname = document.getElementById('tutorial-mapname');
    document.getElementById('tutorial-mapname-savebtn').addEventListener('click', () => {
        tutorial_mapname.textContent = tutorial_mapname_input.value;
    });
    document.getElementById('tutorial-mapname-insertbtn').addEventListener('click', () => {
        tutorial_mapname.textContent = tutorial_mapname_input.value;
    });
};

function manual2_make() {
    tutorial_Content.innerHTML =`
        <div class="flex items-center justify-end">
            <button onclick="open_tutorial()" type="button" class="px-2 py-1 mt-1 bg-blue-500 text-white rounded hover:bg-blue-600">처음으로 돌아가기</button>
            <button onclick="close_tutorial()" type="button" class="px-2 py-1 mt-1 ml-2 bg-red-500 text-white rounded hover:bg-red-600">&times;</button>
        </div>
        <div class="mt-10 y-full">
            <span style="font-size: 24px">2. 제목, 곡 이름</span>
        </div>
        <div class="mt-2 y-full tutorial-font border border-solid border-green-500 rounded">
            <p><span>제목은 해당 곡이 쓰여진 매체 이름을 적는 곳입니다.</span></p>
            <p><span>예를 들어서 애니메이션 제목, 드라마 제목, 영화 제목</span></p>
            <p><span>일반 앨범 곡의 경우엔 가수이름이나 곡의 장르를 적으셔도 됩니다.</span></p>
        </div>
        <div class="mt-5 y-full tutorial-font border border-solid border-blue-500 rounded">
            <p><span>곡 이름은 실제 게임플레이 시 유저가 정답을 맞췄을 경우</span></p>
            <p><span>맞춘 곡의 이름을 표시하는 역할을 합니다.</span></p>
            <p><span>따라서 곡 이름을 정답으로 하시는 경우</span></p>
            <p><span>곡 이름에 작성하신 단어는 정답처리가 되지않기에</span></p>
            <p><span>정답 입력 칸에도 곡 이름을 작성하셔야 합니다.</span></p>
        </div>
        <div class="flex" style="position: fixed; bottom: 30px; width: 90%;">
            <div class="w-1/2"></div>
            <div class=" w-1/2 flex mt-10">
                <button type="button" onclick="manual_make()" class="py-1 mx-1 w-1/2 bg-red-300 text-white rounded hover:bg-red-400 transition">&#x25C0; 이전페이지</button>
                <button type="button" onclick="manual3_make()" class="py-1 mx-1 w-1/2 bg-red-300 text-white rounded hover:bg-red-400 transition">다음페이지 &#x25B6;</button>
            </div>
        </div>
    `;
};

function manual3_make() {
    tutorial_Content.innerHTML =`
        <div class="flex items-center justify-end">
            <button onclick="open_tutorial()" type="button" class="px-2 py-1 mt-1 bg-blue-500 text-white rounded hover:bg-blue-600">처음으로 돌아가기</button>
            <button onclick="close_tutorial()" type="button" class="px-2 py-1 mt-1 ml-2 bg-red-500 text-white rounded hover:bg-red-600">&times;</button>
        </div>
        <div class="mt-10 y-full">
            <span style="font-size: 24px">3. 정답</span>
        </div>
        <div class="mt-2 y-full tutorial-font border border-solid border-green-500 rounded">
            <p><span>정답 칸은 ,(콤마)를 기준으로</span></p>
            <p><span>한 곡에 여러개의 정답을 지정하실 수 있습니다.</span></p>
            <p><span>이때 띄어쓰기가 없는 정답은 자동 제공됩니다.</span></p>
            <p><span>또한 플레이 시 영문자 대소문자는 구분하지 않습니다.</span></p>
        </div>
        <div class="mt-5 y-full p-2 border border-solid border-black rounded bg-gray-100">
            <label>정답:</label>
            <input id="tutorial-answer-input" class="w-full p-2 border border-gray-300 rounded" style="margin-top: 5px" type="text">
        </div>
        <div class="flex flex-col mt-5 y-full p-2 border border-solid border-black rounded bg-gray-100" style="font-size: 18px;">
            <label>실제 적용되는 정답 목록</label>
            <label id="tutorial-answer"></label>
        </div>
        <div class="flex" style="position: fixed; bottom: 30px; width: 90%;">
            <div class="w-1/2"></div>
            <div class=" w-1/2 flex mt-10">
                <button type="button" onclick="manual2_make()" class="py-1 mx-1 w-1/2 bg-red-300 text-white rounded hover:bg-red-400 transition">&#x25C0; 이전페이지</button>
                <button type="button" onclick="manual4_make()" class="py-1 mx-1 w-1/2 bg-red-300 text-white rounded hover:bg-red-400 transition">다음페이지 &#x25B6;</button>
            </div>
        </div>
    `;
    const tutorial_answer_input = document.getElementById("tutorial-answer-input");
    const tutorial_answer = document.getElementById("tutorial-answer");

    tutorial_answer_input.addEventListener('input', (e) => {
        const answer = e.target.value;
        const answerList = answer.split(',').map(str => str.trim()).filter(Boolean);
        const zeroSpaceList = answerList.map(str => str.replace(/\s+/g, ''));

        const combinedList = answerList.concat(zeroSpaceList);
        const combinedSet = new Set(combinedList);

        tutorial_answer.textContent = Array.from(combinedSet).join(',');
    })
};

function manual4_make() {
    tutorial_Content.innerHTML =`
        <div class="flex items-center justify-end">
            <button onclick="open_tutorial()" type="button" class="px-2 py-1 mt-1 bg-blue-500 text-white rounded hover:bg-blue-600">처음으로 돌아가기</button>
            <button onclick="close_tutorial()" type="button" class="px-2 py-1 mt-1 ml-2 bg-red-500 text-white rounded hover:bg-red-600">&times;</button>
        </div>
        <div class="mt-10 y-full">
            <span style="font-size: 24px">4. 곡 링크</span>
        </div>
        <div class="mt-2 y-full tutorial-font border border-solid border-green-500 rounded">
            <p><span>곡 링크 칸은 Youtube 동영상 링크만 지원됩니다.</span></p>
            <p><span>이때 거의 모든 유형의 Youtube 동영상 링크가 지원됩니다.</span></p>
            <p><span>만약 잘못된 링크 일 경우 해당 곡은 등록되지 않습니다.</span></p>
        </div>
        <div class="mt-5 y-full p-2 border border-solid border-black rounded bg-gray-100">
            <label>곡 링크:</label>
            <input id="tutorial-songURL-input" class="w-full p-2 border border-gray-300 rounded" style="margin-top: 5px" type="text">
        </div>
        <div class="flex flex-col mt-5 y-full p-2 border border-solid border-black rounded bg-gray-100" style="font-size: 18px;">
            <label>실제 적용되는 곡 링크 형태</label>
            <label id="tutorial-songURL"></label>
        </div>
        <div class="flex" style="position: fixed; bottom: 30px; width: 90%;">
            <div class="w-1/2"></div>
            <div class=" w-1/2 flex mt-10">
                <button type="button" onclick="manual3_make()" class="py-1 mx-1 w-1/2 bg-red-300 text-white rounded hover:bg-red-400 transition">&#x25C0; 이전페이지</button>
                <button type="button" onclick="manual5_make()" class="py-1 mx-1 w-1/2 bg-red-300 text-white rounded hover:bg-red-400 transition">다음페이지 &#x25B6;</button>
            </div>
        </div>
    `;
    const tutorial_songURL_input = document.getElementById('tutorial-songURL-input');
    const tutorial_songURL = document.getElementById("tutorial-songURL");
    tutorial_songURL_input.addEventListener('input', (e)=> {
        const tutorial_ytLink = e.target.value;
        let tutorial_videoid = '';

        if (tutorial_ytLink.split('v=')[1]) {
            tutorial_videoid = tutorial_ytLink.split('v=')[1].substring(0, 11);
        } else if (tutorial_ytLink.split('/')[3]) {
            tutorial_videoid = tutorial_ytLink.split('/')[3].substring(0, 11);
        };

        if (tutorial_videoid) {
            tutorial_songURL.removeAttribute('style');
            tutorial_songURL.textContent = 'https://www.youtube.com/watch?v=' + tutorial_videoid;
        } else if (tutorial_ytLink) {
            tutorial_songURL.setAttribute('style', 'color: red;');
            tutorial_songURL.textContent = '잘못된 Youtube 동영상 링크 입니다.';
        } else {
            tutorial_songURL.textContent = '';
        };
    });
};

function manual5_make() {
    tutorial_Content.innerHTML =`
        <div class="flex items-center justify-end">
            <button onclick="open_tutorial()" type="button" class="px-2 py-1 mt-1 bg-blue-500 text-white rounded hover:bg-blue-600">처음으로 돌아가기</button>
            <button onclick="close_tutorial()" type="button" class="px-2 py-1 mt-1 ml-2 bg-red-500 text-white rounded hover:bg-red-600">&times;</button>
        </div>
        <div class="mt-10 y-full">
            <span style="font-size: 24px">5. 시작 시간 및 종료 시간</span>
        </div>
        <div class="mt-2 y-full tutorial-font border border-solid border-green-500 rounded">
            <p><span>시작 시간 및 종료 시간은</span></p>
            <p><span>플레이 시 재생시킬 영상의 구간을 정합니다.</span></p>
            <p><span>빈칸으로 두는 경우 시작 시간은 0초 부터</span></p>
            <p><span>종료 시간은 영상의 끝 까지 재생됩니다.</span></p>
            <p><span>시작 시간과 종료 시간 둘 중 한 곳만 적으셔도 되고</span></p>
            <p><span>각 시간 칸의 일부분만 비워두실 경우 비워진 칸은 0으로 처리됩니다.</span></p>
            <p><span>또한 시작 시간보다 종료 시간이 더 작은 경우</span></p>
            <p><span>종료 시간은 0으로 처리됩니다.</span></p>
        </div>
        <div class="mt-5 y-full p-2 border border-solid border-black rounded bg-gray-100">
            <label>시작 시간 및 종료 시간</label>
                <div id="tutorial-Timeclass" class="flex space-x-0.5 time-style">
                    <input id="tutorial-startTime-input-h" class="w-full border border-gray-300 rounded" type="number" max="99" oninput="number_max(this)" placeholder="시간">
                    <span>:</span>
                    <input id="tutorial-startTime-input-m" class="w-full border border-gray-300 rounded" type="number" max="59" oninput="number_max(this)" placeholder="분">
                    <span>:</span>
                    <input id="tutorial-startTime-input-s" class="w-full border border-gray-300 rounded" type="number" max="59" oninput="number_max(this)" placeholder="초">
                    <span>.</span>
                    <input id="tutorial-startTime-input-ms" class="w-full border border-gray-300 rounded" type="number" max="999" oninput="number_max(this)" placeholder="소숫점">
                    <span>~</span>
                    <input id="tutorial-endTime-input-h" class="w-full border border-gray-300 rounded" type="number" max="99" oninput="number_max(this)" placeholder="시간">
                    <span>:</span>
                    <input id="tutorial-endTime-input-m" class="w-full border border-gray-300 rounded" type="number" max="59" oninput="number_max(this)" placeholder="분">
                    <span>:</span>
                    <input id="tutorial-endTime-input-s" class="w-full border border-gray-300 rounded" type="number" max="59" oninput="number_max(this)" placeholder="초">
                    <span>.</span>
                    <input id="tutorial-endTime-input-ms" class="w-full border border-gray-300 rounded" type="number" max="999" oninput="number_max(this)"  placeholder="소숫점">
                </div>
        </div>
        <div class="flex flex-col mt-5 y-full p-2 border border-solid border-black rounded bg-gray-100" style="font-size: 18px;">
            <label>실제 적용되는 곡의 구간</label>
            <label id="tutorial-Time"></label>
        </div>
        <div class="flex" style="position: fixed; bottom: 30px; width: 90%;">
            <div class="w-1/2"></div>
            <div class=" w-1/2 flex mt-10">
                <button type="button" onclick="manual4_make()" class="py-1 mx-1 w-1/2 bg-red-300 text-white rounded hover:bg-red-400 transition">&#x25C0; 이전페이지</button>
                <button type="button" onclick="manual6_make()" class="py-1 mx-1 w-1/2 bg-red-300 text-white rounded hover:bg-red-400 transition">다음페이지 &#x25B6;</button>
            </div>
        </div>
    `;
    const tutorial_Timeclass = document.getElementById('tutorial-Timeclass');
    const tutorial_Timeinputlist = Array.from(tutorial_Timeclass.querySelectorAll('input'));
    const tutorial_Time = document.getElementById('tutorial-Time');

    tutorial_Timeinputlist.forEach(input => {
        input.addEventListener('input', (e) => {
            tutorial_Time.textContent = '';

            let tutorial_startTime = 0, tutorial_endTime = 0;
            let tutorial_startText = '', tutorial_endText = '';

            if (tutorial_Timeinputlist[0].value) {tutorial_startTime += parseInt(tutorial_Timeinputlist[0].value) * 3600}
            if (tutorial_Timeinputlist[1].value) {tutorial_startTime += parseInt(tutorial_Timeinputlist[1].value) * 60}
            if (tutorial_Timeinputlist[2].value) {tutorial_startTime += parseInt(tutorial_Timeinputlist[2].value)}
            if (tutorial_Timeinputlist[3].value) {tutorial_startTime += parseFloat('0.' + String(tutorial_Timeinputlist[3].value))}

            if (tutorial_Timeinputlist[4].value) {tutorial_endTime += parseInt(tutorial_Timeinputlist[4].value) * 3600}
            if (tutorial_Timeinputlist[5].value) {tutorial_endTime += parseInt(tutorial_Timeinputlist[5].value) * 60}
            if (tutorial_Timeinputlist[6].value) {tutorial_endTime += parseInt(tutorial_Timeinputlist[6].value)}
            if (tutorial_Timeinputlist[7].value) {tutorial_endTime += parseFloat('0.' + String(tutorial_Timeinputlist[7].value))}

            // 거지같은 부동소숫점 계산

            let ms1_num = String(tutorial_Timeinputlist[3].value).length
            let ms2_num = String(tutorial_Timeinputlist[7].value).length

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

                if (tutorial_startText) {tutorial_Time.textContent = tutorial_startText + " ~ " + tutorial_endText}
                else {tutorial_Time.textContent = '0초 ~ ' + tutorial_endText};

            } else {

                if (tutorial_startText) {tutorial_Time.textContent = tutorial_startText + " ~ 영상의 끝 까지"}
                else {tutorial_Time.textContent = '0초 ~ 영상의 끝 까지'};
            };
        });
    });
};

function manual6_make() {
    tutorial_Content.innerHTML =`
        <div class="flex items-center justify-end">
            <button onclick="open_tutorial()" type="button" class="px-2 py-1 mt-1 bg-blue-500 text-white rounded hover:bg-blue-600">처음으로 돌아가기</button>
            <button onclick="close_tutorial()" type="button" class="px-2 py-1 mt-1 ml-2 bg-red-500 text-white rounded hover:bg-red-600">&times;</button>
        </div>
        <div class="mt-10 y-full">
            <span style="font-size: 24px">6. 등록하기</span>
        </div>
        <div class="mt-2 y-full tutorial-font border border-solid border-green-500 rounded">
            <p><span class="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">등록하기</span>
                <span>버튼은 작성한 곡의 내용을 임시로 저장하는 버튼입니다.</span></p>
            <p><span>저장되면 작성한 내용이 화면 우측상단의 박스 형태로 저장되고</span></p>
            <p><span>새로운 곡의 내용을 입력할 준비가 됩니다.</span></p>
            <p><span>이미 등록한 곡의 내용을 수정하고 싶다면</span></p>
            <p><span>우측상단의 등록했던 곡을 클릭하셔서 내용을 수정하고</span></p>
            <p><span class="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">수정하기</span>
                <span>버튼을 누르면 반영됩니다.</span></p>
        </div>
        <div class="mt-5 y-full tutorial-font border border-solid border-blue-500 rounded">
            <p><span>최종적으로 서버에 맵이 저장 또는 내용이 수정되는 과정은</span></p>
            <p><span class="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition">맵 저장하기</span>
                <span>또는</span>
                <span class="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">정보 수정하기</span>
                <span>버튼을 누르면</span>
            <p><span>우측상단에 임시로 저장되었던 곡들의 내용을 바탕으로</span></p>
            <p><span>서버에 반영됩니다.</span></p>
        </div>
        <div class="flex" style="position: fixed; bottom: 30px; width: 90%;">
            <div class="w-1/2"></div>
            <div class=" w-1/2 flex mt-10">
                <button type="button" onclick="manual5_make()" class="py-1 mx-1 w-1/2 bg-red-300 text-white rounded hover:bg-red-400 transition">&#x25C0; 이전페이지</button>
                <button type="button" onclick="manual7_make()" class="py-1 mx-1 w-1/2 bg-red-300 text-white rounded hover:bg-red-400 transition">다음페이지 &#x25B6;</button>
            </div>
        </div>
    `;
}

function manual7_make() {
    tutorial_Content.innerHTML = `
        <div class="flex items-center justify-end">
            <button onclick="open_tutorial()" type="button" class="px-2 py-1 mt-1 bg-blue-500 text-white rounded hover:bg-blue-600">처음으로 돌아가기</button>
            <button onclick="close_tutorial()" type="button" class="px-2 py-1 mt-1 ml-2 bg-red-500 text-white rounded hover:bg-red-600">&times;</button>
        </div>
        <div class="mt-10 y-full">
            <span style="font-size: 24px">7. 주의사항</span>
        </div>
        <div class="mt-2 y-full tutorial-font border border-solid border-green-500 rounded">
            <p><span>1. 맵 이름은 필수 입력사항입니다.</span></p>
            <div class="py-1"></div>
            <p><span>비어있을 경우 </span>
                <span class="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition">맵 저장하기</span>
                <span>또는</span>
                <span class="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">정보 수정하기</span>
                <span>를 눌러도</span></p>
            <p><span>해당 맵은 등록되거나 수정되지가 않습니다.</span></p>
        </div>
        <div class="mt-2 y-full tutorial-font border border-solid border-blue-500 rounded">
            <p><span>2. 제목, 곡 이름, 정답, 곡 링크도 필수 입력사항입니다.</span></p>
            <div class="py-1"></div>
            <p><span class="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">등록하기</span>
                <span>또는</span>
                <span class="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">수정하기</span>
                <span>버튼을 누르면</span></p>
            <p><span>우측상단의 아이템 박스에 등록 또는 내용이 반영되지만</span></p>
            <p><span>최종적으로 서버에 반영될 때에는 해당 곡은 제외됩니다.</span></p>
        </div>
        <div class="mt-2 y-full tutorial-font border border-solid border-yellow-500 rounded">
            <p><span>3. 마지막 작업을 하신 후</span></p>
            <p><span class="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">등록하기</span>
                <span>또는</span>
                <span class="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">수정하기</span>
                <span>버튼을 누른 후</span></p>
            <p><span class="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition">맵 저장하기</span>
                <span>또는</span>
                <span class="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">정보 수정하기</span>
                <span>를 누르셔야 합니다.</span></p>
            <div class="py-1"></div>
            <p><span>실제 서버에 반영되는 동작은</span></p>
            <p><span>우측상단의 아이템 박스의 내용을 기준으로 반영됩니다.</span></p>
        </div>
        <div class="flex" style="position: fixed; bottom: 30px; width: 90%;">
            <div class="w-1/2"></div>
            <div class=" w-1/2 flex mt-10">
                <button type="button" onclick="manual6_make()" class="py-1 mx-1 w-1/2 bg-red-300 text-white rounded hover:bg-red-400 transition">&#x25C0; 이전페이지</button>
            </div>
        </div>
    `;
}

//-------------------------------액셀파일로 만드는 방법 튜토리얼 부분---------------------------//
function auto_make() {
    tutorial_Content.innerHTML = `
        <div class="flex items-center justify-end">
            <button id="return-tutorial" type="button" class="px-2 py-1 mt-1 bg-blue-500 text-white rounded hover:bg-blue-600">처음으로 돌아가기</button>
            <button id="tutorial-close" type="button" class="px-2 py-1 mt-1 ml-2 bg-red-500 text-white rounded hover:bg-red-600">&times;</button>
        </div>
    `;
    document.getElementById('tutorial-close').addEventListener('click', () => {close_tutorial()});
    document.getElementById('return-tutorial').addEventListener('click', () => {open_tutorial()});
}