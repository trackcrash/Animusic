let verificationInterval;
let emailConfirm = false;
let totalSeconds = 300;
let emailOk = false;
let nameOk = false;
let passwordOk = false;

function email_send(email) {
    // 입력된 이메일 주소 가져오기
    // Ajax 요청 설정
    $.ajax({
        url: "/api/send_verification_email", // 서버 엔드포인트 URL 설정
        type: "POST", // POST 요청
        contentType: 'application/json', // JSON 형식으로 데이터 보내기
        data: JSON.stringify({ email: email }), // JSON 문자열로 데이터 전송
        success: function(response) {
            // 서버에서 받은 응답 처리
            clearInterval(verificationInterval); // 타이머가 종료되면 clearInterval로 중지
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
document.getElementById("reSendEmail").addEventListener("click", (e) => {
    e.preventDefault();
    const emailInput = document.getElementById("email");
    const email = emailInput.value;

    email_send(email);

})
document.getElementById("confirmBtn").addEventListener("click", (e) => {
    e.preventDefault();
    const emailInput = document.getElementById("email");
    const email = emailInput.value;
    const code = document.getElementById("verificationCode").value;
    $.ajax({
        url: "/api/verify_verification_code", // 인증 코드 검증을 위한 서버 엔드포인트
        type: "POST",
        data: {
            code: code,
            email: email
        }, // 클라이언트에서 입력한 코드를 서버에 전송
        success: function(response) {
            if (response === "success") {
                // 인증 코드가 일치할 때 처리
                alert("인증이 완료되었습니다.");
                clearInterval(verificationInterval);
                emailOk = true;
                document.getElementById("verificationCodeInputSection").innerHTML = "";
            } else {
                // 인증 코드가 일치하지 않을 때 처리
                alert("인증번호를 다시확인해주세요");
            }
        },
        error: function(xhr, status, error) {
            // 오류 처리
            console.error(error);
        }
    });

})

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

function padZero(num) {
    return (num < 10 ? "0" : "") + num;
}

// 페이지가 로드될 때 타이머 시작

document.getElementById("sendverificationcodeBtn").addEventListener("click", async(e) => {
    e.preventDefault();
    const emailInput = document.getElementById("email");
    const email = emailInput.value;

    const emailAvailability = await checkEmailAvailability(email);

    if (emailAvailability !== 3) {
        // 이메일 확인이 실패한 경우
        alert("이메일을 확인하여주세요");
    } else {
        emailInput.disabled = true;
        email_send(email);
        // 이메일 확인이 성공한 경우
        // 추가 로직을 여기에 추가
    }
});


document.getElementById("email").addEventListener("input", function() {
    const emailInput = document.getElementById("email");
    const email = emailInput.value;
    checkEmailAvailability(email)
        .then(result => {
            const email_check_text = document.getElementById("email_check_text");
            if (result === 1) {
                email_check_text.classList.remove("text-green-400")
                email_check_text.classList.add("text-red-400")
                email_check_text.textContent = "이메일을 입력하세요.";
            } else if (result === 2) {
                email_check_text.classList.remove("text-green-400")
                email_check_text.classList.add("text-red-400")
                email_check_text.textContent = "유효한 이메일 주소를 입력하세요.";
            } else if (result === 3) {
                email_check_text.classList.remove("text-red-400")
                email_check_text.classList.add("text-green-400")

                email_check_text.textContent = "사용 가능한 이메일입니다.";
            } else {
                email_check_text.classList.remove("text-green-400")
                email_check_text.classList.add("text-red-400")
                email_check_text.textContent = "이미 가입된 이메일입니다.";
            }
        })
        .catch(error => {
            console.error('Error checking email availability:', error);
        });
});

async function checkEmailAvailability(email) {
    try {
        const isAvailable = await UsedEmailcheck(email);
        console.log(isAvailable);
        if (!email) {
            return 1;
        } else if (!isValidEmail(email)) {
            return 2;
        } else if (isAvailable) {
            return 3;
        } else {
            return 4;
        }
    } catch (error) {
        console.error('Error in checkEmailAvailability:', error);
        throw error; // 오류 처리
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function UsedEmailcheck(email) {
    return $.get(`/api/email_check?email=${email}`)
        .then(data => {
            return data === "Success";
        })
        .catch(error => {
            console.error('Error fetching email check data:', error);
            return false; // 에러가 발생한 경우, 가입된 이메일이 아닌 것으로 처리
        });
}
document.getElementById("nicknameCheck").addEventListener("click", () => {
    const name = document.getElementById("name").value;
    if (nicknameCheck(name)) {
        alert("사용가능한 닉네임입니다.");
        nameOk = true;
    } else {
        alert("사용불가능한 닉네임입니다.");
    }
})
document.getElementById("name").addEventListener("input", () => {
    nameOk = false;
})
document.getElementById("confirm-password").addEventListener("input", () => {
    const password = document.getElementById("password").value;
    const confirm_password = document.getElementById("confirm-password").value;
    const passwordCheck = document.getElementById("passwordCheck");
    if (password == confirm_password) {
        passwordCheck.classList.remove("text-red-400");
        passwordCheck.classList.add("text-green-400");
        passwordCheck.textContent = "비밀번호가 동일합니다";
        passwordOk = true;
    } else {
        passwordCheck.classList.remove("text-green-400");
        passwordCheck.classList.add("text-red-400");
        passwordCheck.textContent = "비밀번호를 다시 확인해주세요"
        passwordOk = false;
    }
})

function validateForm(name) {
    agree = document.getElementById("terms").checked
        // 이메일 유효성 검사 로직 예시 (추가 검증 로직 필요)
    if (emailOk && passwordOk && nameOk && agree) {
        const emailInput = document.getElementById("email");
        emailInput.disabled = false;
        return true;
    } else {
        alert("입력내용을 다시확인 해주시기 바랍니다.");
        return false;
    }
}

function nicknameCheck(name) {
    return $.get(`/api/name_check?name=${name}`)
        .then(data => {
            return data === "Success";
        })
        .catch(error => {
            console.error('Error fetching email check data:', error);
            return false; // 에러가 발생한 경우, 가입된 이메일이 아닌 것으로 처리
        });
}
// 약관 모달 보이기 함수
function showTermsModal() {
    document.getElementById('termsModal').style.display = 'flex';
}

// 약관 모달 숨기기 함수
function closeTermsModal() {
    document.getElementById('termsModal').style.display = 'none';
}