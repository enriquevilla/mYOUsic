if (localStorage.getItem("token")) {
    document.querySelector(".login-active").remove();


    const logOutLi = document.createElement("li");
    logOutLi.classList.add("nav-item");
    const logOutAnchor = document.createElement("a");
    logOutAnchor.classList.add("nav-link");
    logOutAnchor.style.cursor = "pointer";
    logOutAnchor.innerText = "Log out";
    logOutLi.appendChild(logOutAnchor);
    logOutLi.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "/login";
    });
    const scriptTag = document.querySelector('script[src="./js/adjustNav.js"]') 
                        || document.querySelector('script[src="../js/adjustNav.js"]');
    scriptTag.before(logOutLi);


    const myProfileLi = document.createElement("li");
    myProfileLi.classList.add("nav-item");
    const myProfileAnchor = document.createElement("a");
    myProfileAnchor.classList.add("nav-link");
    myProfileAnchor.style.cursor = "pointer";
    myProfileAnchor.innerText = "My Profile";
    myProfileLi.appendChild(myProfileAnchor);
    myProfileLi.addEventListener("click", () => {
        window.location.href = "/myProfile";
    });
    document.querySelector(".index-active").after(myProfileLi);

}