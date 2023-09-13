const notificationIcon = document.getElementById("notificationIcon");
const dropdown = document.getElementById("notificationList");

notificationIcon.addEventListener("click", function() {
    dropdown.parentElement.classList.toggle("hidden");
});

fetch('/api/notification')
    .then(response => response.json())
    .then(notifications => {
        notifications.forEach(notification => {
            const li = document.createElement("li");
            li.className = "p-3 hover:bg-gray-100 cursor-pointer";
            li.textContent = notification.content;

            li.addEventListener('click', function() {
                fetch(`/api/notification/mark-read/${notification.id}`, {
                        method: 'POST'
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === "success") {
                            li.remove();
                            if (!dropdown.children.length) {
                                document.querySelector(".fa-bell").classList.add("hidden");
                            }
                        } else {
                            console.error(data.message);
                        }
                    });
            });

            dropdown.appendChild(li);
        });
    });