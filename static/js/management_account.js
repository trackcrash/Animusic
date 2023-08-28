document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');

    // {{ current_user.is_google_authenticated }} 로 불러오면 token 에러발생에 의한 조치

    let check_googleID;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/get_current_user_is_google_authenticated', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            check_googleID = response.check_googleuser;
        }
    };
    xhr.send();

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const nickname = form.querySelector('input[name="nickname"]').value;
        let password, newPassword, confirmPassword;
        try {
            password = form.querySelector('input[name="password"]').value;
            newPassword = form.querySelector('input[name="newpassword"]').value;
            confirmPassword = form.querySelector('input[name="confirmPassword"]').value;
        } catch (error) {
            password = '', newPassword = '', confirmPassword = '';
        };

        let data = [];

        if (check_googleID) {
            if (nickname === '') {
                alert('변경하실 새로운 닉네임을 입력해주세요.');
                return;
            }

        } else {
            if (password === '') {
                alert('기존 패스워드 입력은 필수사항 입니다.');
                return;
            } else if (newPassword.trim() !== confirmPassword.trim()) {
                alert('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
                return;
            }
        }

        data.push({
            nickname: nickname,
            password: password,
            newpassword: newPassword
        });
        data = JSON.stringify(data);
        $.ajax({
            type: "POST",
            url: "/update_profile",
            dataType: "json",
            contentType: "application/json",
            data: data,
            success: function(response) {
                if (response.message) {
                    console.log("성공: " + response.message);
                    alert(response.message);
                    window.location.href = '/';
                } else {
                    console.log("오류: 응답 메시지 없음");
                }
            },
            error: function(request, status, error) {
                console.log("오류: " + request.status + " - " + request.responseText);
                alert(request.responseJSON.message);
            }
        });
    });
});