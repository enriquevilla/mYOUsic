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
}