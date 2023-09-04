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
        <span onclick="auto_make()" class="flex justify-start mt-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" style="font-size: 20px;">엑셀파일로 한번에 만드는 방법</span>
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
            <div class=" w-1/2 flex mt-10">
                <button type="button" onclick="open_tutorial()" class="py-1 mx-1 w-1/2 bg-red-300 text-white rounded hover:bg-red-400 transition">&#x25C0; 이전페이지</button>
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