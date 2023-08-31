function sendImageIdToServer(id) {
    const url = '/insert_character';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ character_number: id })
    })
    .then(response => response.json())
    .then(data => {
        alert('변경되었습니다.')
        window.location.href='/';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('변경에 실패하였습니다.')
        location.reload();
    });
};
/* <li>
<img id="{{ character.split('.')[0] }}" src="{{ url_for('static', filename='img/character/' + character) }}" alt="캐릭터 이미지" class="clickable-image block bg-white p-6 shadow-lg hover:shadow-xl hover:bg-gray-200 rounded transition duration-300">
</li> */
window.onload = () => {
    const CharacterSelect = document.getElementById("characterSelect");
    // CharacterEnum 객체의 키 배열을 가져옵니다.
    const characterKeys = Object.keys(CharacterEnum);

    for (let i = 0; i < characterKeys.length; i++) {
        const characterKey = characterKeys[i];
        const list = document.createElement("li");
        const img = document.createElement("img");

        // 이미지 소스를 설정합니다.
        img.src = getCharacter(characterKey);

        // 클래스를 추가합니다.
        img.classList.add(
            "clickable-image", "block", "bg-white", "p-6", 
            "shadow-lg", "hover:shadow-xl", "hover:bg-gray-200", 
            "rounded", "transition", "duration-300"
        );

        // id를 설정합니다.
        img.id = characterKey;

        list.appendChild(img);
        CharacterSelect.appendChild(list);
        img.addEventListener("click", () =>
        {
            sendImageIdToServer(i);
        })
    }
}