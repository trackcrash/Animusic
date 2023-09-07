const tutorial_Container = document.getElementById('tutorial-container');
const tutorial_Content = document.getElementById('tutorial-content');
let tutorial_variables = [];

/* html 및 스크립트 컨텐츠를 불러오는 함수 */
async function request_htmlContent(html_name) {
    return new Promise(resolve => {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', '/request_htmlContent', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {resolve(xhr.responseText)};
        }
        xhr.send(JSON.stringify({data: html_name}));
    });
}

/* 튜토리얼 닫는 기능 */
function close_tutorial() {
    document.querySelectorAll('.tutorial_script').forEach(i => {i.parentNode.removeChild(i)});
    tutorial_Container.style.display = 'none'
};

async function open_tutorial() {
    document.querySelectorAll('.tutorial_script').forEach(i => {i.parentNode.removeChild(i)});
    tutorial_Content.innerHTML = await request_htmlContent('open_tutorial.html');
    // 튜토리얼 창을 보여 줌
    tutorial_Container.style.display = 'block';
    // 튜토리얼 내용을 작성하는 곳
    tutorial_Content.removeAttribute("style");
};

async function manual_make() {
    // 이전에 사용했던 튜토리얼 스크립트를 모두 제거
    document.querySelectorAll('.tutorial_script').forEach(i => {i.parentNode.removeChild(i)});

    // 튜토리얼 창 초기 스타일 지정 (첫 페이지만)
    tutorial_Content.setAttribute("style", "width: 500px; height: 700px;");

    // html 컨텐츠를 불러와서 적용
    tutorial_Content.innerHTML = await request_htmlContent('manual_make.html');

    // 새 스크립트 요소를 생성 후 여기에 스크립트 컨텐츠를 할당
    const script_manual = document.createElement('script');
    script_manual.text = await request_htmlContent('manual_make.js');
    script_manual.classList.add('tutorial_script');

    // 스크립트 요소를 body에 추가
    document.body.appendChild(script_manual);
};

async function manual2_make() {
    document.querySelectorAll('.tutorial_script').forEach(i => {i.parentNode.removeChild(i)});
    tutorial_Content.innerHTML = await request_htmlContent('manual2_make.html');
};

async function manual3_make() {
    document.querySelectorAll('.tutorial_script').forEach(i => {i.parentNode.removeChild(i)});
    tutorial_Content.innerHTML = await request_htmlContent('manual3_make.html');

    // 스크립트를 사용하는 경우
    const script_manual3 = document.createElement('script');
    script_manual3.text = await request_htmlContent('manual3_make.js');
    script_manual3.classList.add('tutorial_script');

    document.body.appendChild(script_manual3);
};

async function manual4_make() {
    document.querySelectorAll('.tutorial_script').forEach(i => {i.parentNode.removeChild(i)});
    tutorial_Content.innerHTML = await request_htmlContent('manual4_make.html');

    const script_manual4 = document.createElement('script');
    script_manual4.text = await request_htmlContent('manual4_make.js');
    script_manual4.classList.add('tutorial_script');

    document.body.appendChild(script_manual4);
};

async function manual5_make() {
    document.querySelectorAll('.tutorial_script').forEach(i => {i.parentNode.removeChild(i)});
    tutorial_Content.innerHTML = await request_htmlContent('manual5_make.html');

    const script_manual5 = document.createElement('script');
    script_manual5.text = await request_htmlContent('manual5_make.js');
    script_manual5.classList.add('tutorial_script');

    document.body.appendChild(script_manual5);
};

async function manual6_make() {
    document.querySelectorAll('.tutorial_script').forEach(i => {i.parentNode.removeChild(i)});
    tutorial_Content.innerHTML = await request_htmlContent('manual6_make.html');
}

async function manual7_make() {
    document.querySelectorAll('.tutorial_script').forEach(i => {i.parentNode.removeChild(i)});
    tutorial_Content.innerHTML = await request_htmlContent('manual7_make.html');
}

//-------------------------------액셀파일로 만드는 방법 튜토리얼 부분---------------------------//
async function auto_make() {
    document.querySelectorAll('.tutorial_script').forEach(i => {i.parentNode.removeChild(i)});
    tutorial_Content.innerHTML = await request_htmlContent('auto_make.html');

    tutorial_Content.setAttribute("style", "width: 500px; height: 700px;");
}
async function auto2_make() {
    document.querySelectorAll('.tutorial_script').forEach(i => {i.parentNode.removeChild(i)});
    tutorial_Content.innerHTML = await request_htmlContent('auto2_make.html');
}