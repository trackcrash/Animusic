const profileList = document.getElementById("profile_list");

$.getJSON("/api/get_user", (userData) => {
    if (userData["permissions"] < 1) {
        alert("후원자 전용 기능입니다. 후원하기는 페이지 하단에 있습니다.");
        window.location = "/";
    }
    $.getJSON("/api/get_files", (fileData) => {
        const profileList = document.getElementById("profile_list");
        const fileInput = document.getElementById("file-input");
        const files = fileData.files;
        const currentUserId = fileData.current_user;
        
        if (files && files.length > 0) {
            // 이미지 파일 목록을 기반으로 박스를 생성하고 페이지에 추가
            files.forEach((filename) => {
                // 이미지 박스 생성
                const profileBox = document.createElement("div");
                profileBox.className = "profile-card flex flex-col items-center justify-between bg-gray-700 p-4 rounded-lg shadow-md my-2";
                profileBox.style.backgroundImage = `url("/static/img/profile_background/${currentUserId}/${filename}")`;
                profileBox.style.backgroundSize = "cover";
                profileBox.style.backgroundRepeat = "no-repeat";
                profileBox.style.width = "364px";
                profileBox.style.height = "240px";
                profileBox.style.overflow = "hidden";
                profileBox.setAttribute("data-filename", filename);
                // 이미지 제거 버튼 생성
                const removeButton = document.createElement("button");
                removeButton.textContent = "Remove";
                removeButton.className = "remove-image-button"; // 적절한 CSS 클래스를 추가하세요
                removeButton.style.width = "100%";
                removeButton.style.backgroundColor = "#B3B3B3";
                removeButton.style.textAlign ="center";
                removeButton.className = "remove-image-button"; // 
                removeButton.addEventListener("click", function () {
                    const filename = profileBox.getAttribute("data-filename");
                    
                    // 서버로 이미지 제거 요청을 보냅니다.
                    fetch("/api/remove_profile_background", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ filename }),
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // 이미지가 성공적으로 제거되었으므로 해당 이미지 박스를 제거합니다.
                            profileList.removeChild(profileBox);
                            
                            // 이미지 제거 버튼을 다시 숨깁니다.
                            removeImageButton.style.display = "none";
                        } else {
                            alert("이미지 제거 실패");
                        }
                    })
                    .catch(error => {
                        console.error("이미지 제거 오류:", error);
                    });
                });
                
                // 이미지 박스에 제거 버튼 추가
                profileBox.appendChild(removeButton);
                
                // 프로필 목록에 이미지 박스 추가
                profileList.insertBefore(profileBox, profile_list.querySelector("#add-button-box"));
            });
        }
        
        // + 박스 생성 및 클릭 시 파일 선택 다이얼로그 열기
        const addButtonBox = document.createElement("div");
        addButtonBox.className = "flex flex-col items-center justify-between bg-gray-700 p-4 rounded-lg shadow-md my-2";
        addButtonBox.style.width = "364px";
        addButtonBox.style.height = "240px";
        addButtonBox.style.overflow = "hidden";
        addButtonBox.id = "add-button-box"; // 버튼을 식별하기 위한 ID 추가
        addButtonBox.addEventListener("click", () => {
            fileInput.click();
        });
        
        // + 버튼 생성
        const addButton = document.createElement("button");
        addButton.innerText = "+";
        addButton.className = "text-center text-6xl m-auto";
        addButton.addEventListener("click", function () {
            fileInput.click(); // 파일 선택 다이얼로그 열기
        });
        
        // + 버튼을 박스에 추가
        addButtonBox.appendChild(addButton);
        
        // 프로필 목록에 + 버튼 박스 추가
        profileList.appendChild(addButtonBox);
        
        // 이미지가 있는 박스 클릭 시
        profileList.addEventListener("click", function (event) {
            const target = event.target;
            
            if (target.tagName === "DIV" && target.classList.contains("profile-card")) {
                const filename = target.getAttribute("data-filename");
                
                // 서버로 데이터베이스 업데이트 요청을 보냅니다.
                fetch("/api/update_profile_background", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ filename }),
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    if (data.success) {
                        alert("프로필 백그라운드가 업데이트되었습니다.");
                    } else {
                        alert("프로필 백그라운드 업데이트 실패");
                    }
                })
                .catch(error => {
                    console.error("프로필 백그라운드 업데이트 오류:", error);
                });
            }
        });
        
        // 파일이 선택되었을 때 실행되는 이벤트 핸들러
        fileInput.addEventListener("change", function (event) {
            const file = event.target.files[0];
            
            if (file) {
                if(file.size >= 5 *1024*1024)
                {
                    alert("파일 크기 5mb 이상은 등록 할 수 없습니다.");
                    return;
                }               
                const formData = new FormData();
                formData.append("file", file);
                // 서버로 파일 업로드 요청을 보냅니다.
                fetch("/api/upload_profile_background", {
                    method: "POST",
                    body: formData,
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // 이미지가 업로드되었으므로 이미지 박스를 생성합니다.
                        const profileBox = document.createElement("div");
                        profileBox.className = "profile-card flex flex-col items-center justify-between bg-gray-700 p-4 rounded-lg shadow-md my-2";
                        profileBox.style.backgroundImage = `url("/static/img/profile_background/${currentUserId}/${data.filename}")`;
                        profileBox.style.backgroundSize = "cover";
                        profileBox.style.backgroundRepeat = "no-repeat";
                        profileBox.style.width = "364px";
                        profileBox.style.height = "240px";
                        profileBox.style.overflow = "hidden";
                        profileBox.setAttribute("data-filename", data.filename);
                        
                        // 이미지 박스에 제거 버튼 추가
                        const removeButton = document.createElement("button");
                        removeButton.textContent = "Remove";
                        removeButton.style.width = "100%";
                        removeButton.style.backgroundColor = "#B3B3B3";
                        removeButton.style.textAlign ="center";
                        removeButton.className = "remove-image-button"; // 적절한 CSS 클래스를 추가하세요
                        removeButton.addEventListener("click", function () {
                            const filename = profileBox.getAttribute("data-filename");
                            
                            // 서버로 이미지 제거 요청을 보냅니다.
                            fetch("/api/remove_profile_background", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ filename }),
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    // 이미지가 성공적으로 제거되었으므로 해당 이미지 박스를 제거합니다.
                                    profileList.removeChild(profileBox);
                                    
                                    // 이미지 제거 버튼을 다시 숨깁니다.
                                } else {
                                    alert("이미지 제거 실패");
                                }
                            })
                            .catch(error => {
                                console.error("이미지 제거 오류:", error);
                            });
                        });
                        // 이미지 박스에 제거 버튼 추가
                        profileBox.appendChild(removeButton);
                        // 프로필 목록에 이미지 박스 추가
                        profileList.insertBefore(profileBox, profile_list.querySelector("#add-button-box"));
                        
                    } else {
                        alert("파일 업로드 실패");
                    }
                })
                .catch(error => {
                    console.error("파일 업로드 오류:", error);
                });
            }
        });
    });
});
