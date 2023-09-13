window.onload = () => {
    $.get('/api/get_ranking_data')
        .done(displayRanking)
        .fail(error => {
            console.error('Error fetching mission table data:', error);
        });
}
let flag = false;
let id = null;
function displayRanking(data) {
    const play_ranking_div = document.getElementById("play_ranking");
    let rank = 1;
    for (const element of data) {
        const newDiv = document.createElement("div");
        newDiv.className = "bg-gray-400 rounded overflow-hidden shadow-lg p-4 space-y-3 igeo-card";
        newDiv.setAttribute("data-id",element.id);
        newDiv.setAttribute("data-description",element.Description);
        newDiv.addEventListener("click",(e)=>
        {
            if (flag) return;
            e.preventDefault();
            id = newDiv.getAttribute('data-id');
            const description = newDiv.getAttribute('data-description');
            const thumbnailSrc = newDiv.querySelector('img').getAttribute('src');
            const title = newDiv.querySelector('h3.text-xl').innerText;
    
            // Populate the modal with the clicked map's information.
            document.querySelector('#modalTitle').innerText = title;
            document.querySelector('#modalDescription').innerText = description;
            document.querySelector('#modalThumbnail').setAttribute('src', thumbnailSrc);
            document.querySelector('#singlePlayLink').setAttribute('href', `/single-play?id=${id}`);
            flag = true;
            // Show the modal.
            document.querySelector('#myModal').classList.remove('hidden');
            
        })
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
        const rankLabel = document.createElement("span");
        rankLabel.className = "text-white text-xs font-bold py-1 px-2 rounded-full " + getRankingClass(rank);
        rankLabel.textContent = "#" + rank;

        const mapNameLabel = document.createElement("h3");
        mapNameLabel.className = "text-xl text-white font-bold";
        mapNameLabel.textContent = element["MapName"];

        const thumbnail = document.createElement("img");
        thumbnail.src = element["Thumbnail"];
        thumbnail.alt = element["MapName"];
        thumbnail.className = "w-full h-48 object-cover";

        const mapProducerLabel = document.createElement("p");
        mapProducerLabel.className = "text-lg text-white";
        mapProducerLabel.textContent = "제작자: " + element["MapProducer"];

        newDiv.appendChild(rankLabel);
        newDiv.appendChild(mapNameLabel);
        newDiv.appendChild(thumbnail);
        newDiv.appendChild(mapProducerLabel);
        play_ranking_div.appendChild(newDiv);

        rank++;
        
    }
}

function getRankingClass(rank) {
    switch (rank) {
        case 1:
            return 'ranking-first';
        case 2:
            return 'ranking-second';
        case 3:
            return 'ranking-third';
        default:
            return 'ranking-other';
    }
}


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