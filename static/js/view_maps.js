let flag = false;
let id = null;
//모달 기능
document.addEventListener("DOMContentLoaded", function() {
    // Display the modal when an igeo-card is clicked.
    document.querySelectorAll('.igeo-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (flag) return;
            e.preventDefault();
            id = card.getAttribute('data-id');
            const description = card.getAttribute('data-description');
            const thumbnailSrc = card.querySelector('img').getAttribute('src');
            const title = card.querySelector('p.text-xl').innerText;

            // Populate the modal with the clicked map's information.
            document.querySelector('#modalTitle').innerText = title;
            document.querySelector('#modalDescription').innerText = description;
            document.querySelector('#modalThumbnail').setAttribute('src', thumbnailSrc);
            document.querySelector('#singlePlayLink').setAttribute('href', `/single-play?id=${id}`);
            flag = true;
            // Show the modal.
            document.querySelector('#myModal').classList.remove('hidden');
        });
    });
    const createRoomBtn = document.getElementById("CreateRoomBtn");
    const multiPlayLink = document.getElementById("multiPlayLink");
    const createRoomModal = document.getElementById("CreateRoomModal");
    const createRoomModalCloseBtn = document.getElementById("CreateRoomModalCloseBtn");

    multiPlayLink.addEventListener('click', function(e) {
        e.preventDefault();
        createRoomModal.classList.remove('hidden');
    });

    createRoomBtn.addEventListener('click', function() {
        const roomName = document.getElementById("room_title").value;
        const roomPassword = document.getElementById("room_password").value;
        const roomMaxUsers = document.getElementById("room_max_human").value;

        // Verify that the necessary data is present
        if (roomName && roomName.trim()) {
            // Send data to the server (this is just a sample, adjust accordingly)
            fetch('/create_room', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        room_name: roomName,
                        room_password: roomPassword,
                        room_max_human: roomMaxUsers
                    })
                })
                .then(response => response.json())
                .then(data => {
                    // Handle the response from the server, if necessary
                    console.log(data);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } else {
            alert("Please enter a valid room name.");
        }
    });

    createRoomModalCloseBtn.addEventListener('click', function() {
        createRoomModal.classList.add('hidden');
    });
});

function fetchData(url, callback) {
    $.getJSON(url, callback);
}
$('#CreateRoomBtn').click(function() {
    $('#CreateRoomModal').addClass('hidden');
    fetchData("/get_user_info", (user_id) => {
        if (user_id) { // 사용자가 로그인된 경우
            const room_name = $("#room_title").val();
            const room_password = $("#room_password").val();
            const room_max_human = $("#room_max_human").val();

            if (room_name && room_name.trim() !== '') {
                socket.emit('room_check', { room_name: room_name, room_password: room_password, room_max_human: room_max_human });
                // 방 이름이 제대로 입력된 경우 방 생성 및 해당 방으로 리다이렉트
            } else if (room_name !== null) { // 취소 버튼을 클릭하지 않은 경우
                alert("올바른 방 이름을 입력해주세요.");
            }
        } else { // 사용자가 로그인되지 않은 경우
            alert("로그인 후 이용해주세요");
            location.href = "/login";
        }
    });
});

socket.on('Join_room', (data) => {
    joinChatRoom(data);
})

function joinChatRoom(room_key) {
    window.location = `/multi_game?room_key=${room_key}` + `&id=${id}`;
}
//검색 기능
$(document).ready(function() {
    $('#searchInput').on('keyup', function() {
        let value = $(this).val().toLowerCase();

        $('.igeo-card').filter(function() {
            $(this).toggle($(this).find('.text-xl').text().toLowerCase().indexOf(value) > -1);
        });
    });
});

$("#reportIcon").click(function() {

});

$(document).click(function(event) {
    // 모달을 클릭했는지, 아니면 모달 밖을 클릭했는지 확인
    if ($(event.target).closest("#myModal").length && !$(event.target).closest(".igeo-modal").length) {
        $('#myModal').addClass('hidden'); // 모달 닫기
        flag = false;
    }
});

// 모달을 열 때 발생하는 이벤트
document.getElementById('reportIcon').addEventListener('click', function() {
    document.getElementById('reportModal').classList.remove('hidden');
});

// 모달을 닫을 때 발생하는 이벤트
document.getElementById('reportModalCloseBtn').addEventListener('click', function() {
    document.getElementById('reportModal').classList.add('hidden');
});

// 신고를 제출할 때 발생하는 이벤트
document.getElementById('sendReportBtn').addEventListener('click', function() {
    const reportReason = document.getElementById('reportReason').value.trim();
    const reportDescription = document.getElementById('reportDescription').value.trim();
    const missionId = id;

    if (!reportReason || !reportDescription) {
        alert('신고사유와 신고내용을 모두 작성해주세요.');
        return;
    }

    // 신고 데이터를 서버로 전송
    fetch('/create-report', {
            method: 'POST',
            body: JSON.stringify({
                mission_id: missionId,
                reason: reportReason,
                description: reportDescription
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('신고가 성공적으로 전송되었습니다.');
                document.getElementById('reportModal').classList.add('hidden');
            } else {
                alert('신고 전송에 실패했습니다.');
            }
        });

    // 입력값 초기화
    document.getElementById('reportReason').value = '';
    document.getElementById('reportDescription').value = '';
});