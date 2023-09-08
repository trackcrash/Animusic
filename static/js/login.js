let totalSeconds = 300;
let verificationInterval;

function email_send(email) {
    // 입력된 이메일 주소 가져오기
    // Ajax 요청 설정
    $.ajax({
        url: "/api/send_verification_email",
        type: "POST", // POST 요청
        contentType: 'application/json',
        data: JSON.stringify({ email: email }),
        success: function(response) {
            clearInterval(verificationInterval);
            document.getElementById("confirmBtn").disabled = false;
            const sendverificationcodeBtn = document.getElementById("sendverificationcodeBtn");
            const verificationCodeInputSection = document.getElementById("verificationCodeInputSection");
            alert("이메일이 발송되었습니다. 확인해주세요");
            sendverificationcodeBtn.style.display = "none";
            verificationCodeInputSection.style.display = "block";
            totalSeconds = 300;
            verificationInterval = setInterval(() => {
                updateTimer();
            }, 1000);
        },
        error: function(xhr, status, error) {
            // 오류 처리
            console.error(error);
        }
    });
}

function padZero(num) {
    return (num < 10 ? "0" : "") + num;
}
document.getElementById("reSendEmail").addEventListener("click", (e) => {
    e.preventDefault();
    const emailInput = document.getElementById("passemail");
    const email = emailInput.value;

    email_send(email);

});

// 타이머
function updateTimer() {

    const timerElement = document.getElementById("timer");
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timeString = padZero(minutes) + ":" + padZero(seconds); // 시간과 분을 표시하고 0으로 패딩합니다.
    timerElement.textContent = timeString;
    if (totalSeconds > 0) {
        totalSeconds--; // 1초씩 감소
    } else {
        clearInterval(verificationInterval); // 타이머가 종료되면 clearInterval로 중지
        timerElement.textContent = "시간이 종료되었습니다. 메일을 다시 받아주세요"; // 원하는 메시지로 변경 가능 
        document.getElementById("confirmBtn").disabled = true;
    }
}
// 비밀번호 재설정 모달 보이기 함수
function openPasswordModal() {
    document.getElementById('newPasswordModal').style.display = 'flex';
}

// 비밀번호 재설정 모달 숨기기 함수
function closePasswordModal() {
    document.getElementById('newPasswordModal').style.display = 'none';
}

document.getElementById("forgotPasswordButton").addEventListener("click", () => {
    document.getElementById("passwordResetModal").style.display = "block";
});

function closeforgotPasswordModal() {
    document.getElementById("passwordResetModal").style.display = "none";
}

document.getElementById("sendverificationcodeBtn").addEventListener("click", async(e) => {
    e.preventDefault();
    const emailInput = document.getElementById("passemail");
    const email = emailInput.value;

    if (!isValidEmail(email)) {
        alert("유효한 이메일 주소를 입력하세요.");
        return;
    }

    email_send(email);
});

document.getElementById("confirmBtn").addEventListener("click", (e) => {
    e.preventDefault();
    const emailInput = document.getElementById("passemail");
    const email = emailInput.value;
    const code = document.getElementById("verificationCode").value;

    $.ajax({
        url: "/api/verify_forgot_password",
        type: "POST",
        data: {
            code: code,
            email: email
        },
        success: function(response) {
            if (response.message === "success") {
                alert("인증이 완료되었습니다.");
                document.getElementById("verificationCodeInputSection").innerHTML = "";
                document.getElementById("resetToken").value = response.token;
                openPasswordModal();
            } else {
                alert("인증번호를 다시확인해주세요");
            }
        }
    });
});

function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(email);
}

document.getElementById("saveNewPasswordBtn").addEventListener("click", function() {
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const tokenValue = document.getElementById("resetToken").value;

    if (newPassword !== confirmPassword) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
    }

    $.ajax({
        url: "/api/password_reset",
        type: "POST",
        data: {
            password: newPassword,
            token: tokenValue
        },
        success: function(response) {
            if (response === "success") {
                alert("비밀번호가 성공적으로 변경되었습니다!");
                closePasswordModal();
                window.location.href = '/login';
            } else {
                alert("비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
            }
        },
        error: function(err) {
            alert("서버 오류가 발생했습니다. 나중에 다시 시도해주세요.");
        }
    });
});