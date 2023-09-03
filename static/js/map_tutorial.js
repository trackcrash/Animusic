const tutorial_Container = document.getElementById('tutorial-container');
const tutorial_Content = document.getElementById('tutorial-content');

function close_tutorial() {tutorial_Container.style.display = 'none'};

function open_tutorial() {
    // 튜토리얼 창을 보여 줌
    tutorial_Container.style.display = 'block';

    // 튜토리얼 내용을 작성하는 곳
    tutorial_Content.innerHTML = `
        <div class="flex items-center">
            <span style="font-size: 20px;">맵을 처음 만드시는 분들을 위한 설명서</span>
            <button id="tutorial-close" type="button" class="px-2 py-1 mt-1 ml-2 bg-red-500 text-white rounded hover:bg-red-600">&times;</button>
        </div>
        <span id="manual-make" class="flex justify-start mt-10 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" style="font-size: 20px;">직접 입력하는 방법</span>
        <span id="auto-make" class="flex justify-start mt-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" style="font-size: 20px;">엑셀파일로 한번에 만드는 방법</span>
    `;

    // 튜토리얼 내용의 스크립트 기능을 작성하는 곳
    document.getElementById('tutorial-close').addEventListener('click', () => {close_tutorial()});
    document.getElementById('manual-make').addEventListener('click', () => {manual_make()});
    document.getElementById('auto-make').addEventListener('click', () => {auto_make()});
};

function manual_make() {
    tutorial_Content.innerHTML = `
        <div class="flex items-center justify-end">
            <button id="return-tutorial" type="button" class="px-2 py-1 mt-1 bg-blue-500 text-white rounded hover:bg-blue-600">처음으로 돌아가기</button>
            <button id="tutorial-close" type="button" class="px-2 py-1 mt-1 ml-2 bg-red-500 text-white rounded hover:bg-red-600">&times;</button>
        </div>
        <div class="mt-10 y-full">
            <span style="font-size: 20px">1. 맵 이름</span>
        </div>
        <div class="mt-2 y-full tutorial-font">
            <p><span>맵 이름을 적는 입력 칸은 입력 후</span>
                <span class="px-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">제목 저장하기</span>
                <span>를 누르면</span></p>
            <p><span>맵을 다 만들고 하단의</span>
                <span class="px-1 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition">저장하기</span>
                <span>버튼을 누르기 전 까지</span></p>
            <p><span>건드릴 일이 없습니다.</span></p>
            <p><span>혹시 맵 이름을 중간에 바꾸고 싶으시다면</span>
                <span class="px-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">제목 변경하기</span>
            <p><span>또는</span>
                <span class="px-1 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">정보 수정하기</span>
                <span>를 누르고</span></p>
            <p><span>바꾸시고 싶은 이름으로 변경 후 다시</span>
                <span class="px-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">제목 저장하기</span>
                <span>를 누르시면 됩니다.</span></p>
        </div>
        <div class="mt-10 y-full px-2 py-2 border border-solid border-black rounded bg-gray-100">
            <label id="tutorial-mapname-label">맵 이름: </label>
            <div class="w-full flex">
                <input id="tutorial-mapname-input" class="w-1/2 py-2 mx-1 border border-gray-300 rounded" type="text">
                <button id="tutorial-mapname-insert" type="button" class="w-1/2 py-2 mx-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">제목 저장하기</button>
            </div>
        </div>
        <div class="flex flex-col">
            <div class="m-1 flex justify-end">
                <button id="tutorial-mapname-savebtn" type="button" class="w-1/2 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">저장하기</button>
            </div>
            <div class="m-1 flex justify-end">
                <button id="tutorial-mapname-insertbtn" type="button" class="w-1/2 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">정보 수정하기</button>
            </div>
        </div>
        <div class="mt-10 y-full px-2 py-2 border border-solid border-black rounded bg-gray-100" style="font-size: 18px;">
            <label>실제 적용되는 맵 이름</label>
            <label id="tutorial-mapname"></label>
        </div>

    `;
    document.getElementById('tutorial-close').addEventListener('click', () => {close_tutorial()});
    document.getElementById('return-tutorial').addEventListener('click', () => {open_tutorial()});

}

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
