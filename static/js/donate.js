document.addEventListener("DOMContentLoaded", function() {
    const donateButton = document.getElementById("donateButton");
    const donationAmountInput = document.getElementById("donationAmount");
    const donationNameInput = document.getElementById("donationName");
    donateButton.addEventListener("click", function() {
        const amount = donationAmountInput.value;
        const name = donationNameInput.value;
        const data = { "amount": amount, "name": name };
        $.ajax({
            type: "POST",
            url: "/api/donate",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
                console.log(response.message); // 서버에서 반환한 메시지 출력
            },
            error: function(error) {
                console.error(error);
            }
        });
    });
});

$(showDonateContainer).ready(function() {
    $("#showDonateContainer").click(function() {
        $(".donate-container").removeClass("hidden");
    });
});