document.addEventListener('DOMContentLoaded', function () {
    const images = document.querySelectorAll('.clickable-image');

    images.forEach(image => {
        image.addEventListener('click', function () {
            const imageId = this.id;  // 클릭된 이미지의 id 값
            sendImageIdToServer(imageId);  // 서버로 id 값을 전송하는 함수 호출
        });
    });

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
});