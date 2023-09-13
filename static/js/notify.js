document.querySelector(".fa-bell").addEventListener("click", function() {
    fetch('/api/notification')
        .then(response => response.json())
        .then(notifications => {
            const dropdown = document.getElementById("notification-dropdown");
            dropdown.innerHTML = ""; // Clear existing notifications

            notifications.forEach(notification => {
                const div = document.createElement("div");
                div.className = "notification-item";
                div.textContent = notification.content;

                div.addEventListener('click', function() {
                    fetch(`/api/notification/mark-read/${notification.id}`, {
                            method: 'POST'
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === "success") {
                                div.remove();
                                data.length === 0 ? document.querySelector(".fa-bell").classList.add("hidden") : null;
                            } else {
                                console.error(data.message);
                            }
                        });
                });

                dropdown.appendChild(div);
            });
        });
});