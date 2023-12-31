$(function() {
    const notificationIcon = $("#notificationIcon");
    const dropdown = $("#notificationList");
    const notificationCountElem = $("#notificationCount");

    notificationIcon.on("click", function() {
        dropdown.parent().toggleClass("hidden");
    });
    if(notificationIcon.length > 0)
    {
        $.ajax({
            url: '/api/notification',
            method: 'GET',
            success: function(notifications) {
                // 알림 갯수 설정
                notificationCountElem.text(notifications.length);
                if (notifications.length === 0) {
                    notificationCountElem.addClass("hidden");
                } else {
                    notificationCountElem.removeClass("hidden");
                }
    
                notifications.forEach(notification => {
                    const li = $('<li></li>')
                        .addClass("p-3 hover:bg-green-300 cursor-pointer")
                        .text(notification.content)
                        .on("click", function() {
                            $.ajax({
                                url: `/api/notification/${notification.id}`,
                                method: 'PUT',
                                success: function(data) {
                                    if (data.status === "success") {
                                        li.remove();
                                        let remainingCount = parseInt(notificationCountElem.text()) - 1;
                                        notificationCountElem.text(remainingCount);
    
                                        if (remainingCount === 0) {
                                            notificationCountElem.addClass("hidden");
                                            $(".fa-bell").addClass("hidden");
                                        }
                                    } else {
                                        console.error(data.message);
                                    }
                                }
                            });
                        });
                    dropdown.append(li);
                });
                const a = document.createElement('a');
                a.textContent = "전체보기";
                a.classList.add("bg-gray-600", "text-white", "hover:bg-green-300", "p-3", "flex", "justify-center", "w-full");
                a.href = "/report"
                dropdown.append(a);
            }
        });
    }
    else
    {
        notificationCountElem.addClass("hidden");
    }
});