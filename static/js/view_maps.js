let flag = false;
//모달 기능
document.addEventListener("DOMContentLoaded", function() {
    // Display the modal when an igeo-card is clicked.
    document.querySelectorAll('.igeo-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (flag) return;
            e.preventDefault();
            const id = card.getAttribute('data-id');
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
});

//검색 기능
$(document).ready(function() {
    $('#searchInput').on('keyup', function() {
        let value = $(this).val().toLowerCase();

        $('.igeo-card').filter(function() {
            $(this).toggle($(this).find('.text-xl').text().toLowerCase().indexOf(value) > -1);
        });
    });
});

$(document).click(function(event) {
    // 모달을 클릭했는지, 아니면 모달 밖을 클릭했는지 확인
    if ($(event.target).closest("#myModal").length && !$(event.target).closest(".igeo-modal").length) {
        $('#myModal').addClass('hidden'); // 모달 닫기
        flag = false;
    }
});