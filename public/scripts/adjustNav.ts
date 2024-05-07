if (localStorage.getItem("token")) {
    const loginActive = <HTMLElement> document.querySelector(".login-active");
    loginActive.remove();

    const logOutLi = document.createElement("li");
    logOutLi.classList.add("nav-item");
    const logOutAnchor = document.createElement("a");
    logOutAnchor.classList.add("nav-link");
    logOutAnchor.style.cursor = "pointer";
    logOutAnchor.innerText = "Log out";
    logOutAnchor.classList.add("centered")
    logOutLi.appendChild(logOutAnchor);
    logOutLi.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "/login";
    });
    const scriptTag = <HTMLScriptElement> document.querySelector('script[src*="adjustNav.js"]');
    scriptTag.before(logOutLi);

    const myProfileLi = document.createElement("li");
    myProfileLi.classList.add("nav-item");
    const myProfileAnchor = document.createElement("a");
    myProfileAnchor.classList.add("nav-link");
    myProfileAnchor.style.cursor = "pointer";
    myProfileAnchor.innerText = "My Profile";
    myProfileAnchor.classList.add("centered");
    myProfileLi.appendChild(myProfileAnchor);
    myProfileLi.addEventListener("click", () => {
        window.location.href = "/myProfile";
    });
    const indexActive = <HTMLElement> document.querySelector(".index-active");
    indexActive.after(myProfileLi);
    if (window.location.pathname === "/myProfile") {
        indexActive.classList.remove("index-active");
        myProfileLi.classList.add("index-active");
    }

    const favoritesLi = document.createElement("li");
    favoritesLi.classList.add("nav-item");
    const favoritesAnchor = document.createElement("a");
    favoritesAnchor.classList.add("nav-link");
    favoritesAnchor.style.cursor = "pointer";
    favoritesAnchor.innerText = "Favorites";
    favoritesAnchor.classList.add("centered");
    favoritesLi.appendChild(favoritesAnchor);
    favoritesLi.addEventListener("click", () => {
        window.location.href = "/favorites";
    });
    myProfileLi.after(favoritesLi);
    if (window.location.pathname === "/favorites") {
        indexActive.classList.remove("index-active");
        favoritesLi.classList.add("index-active");
    }

    const followingLi = document.createElement("li");
    followingLi.classList.add("nav-item");
    const followingAnchor = document.createElement("a");
    followingAnchor.classList.add("nav-link");
    followingAnchor.style.cursor = "pointer";
    followingAnchor.innerText = "Followed";
    followingAnchor.classList.add("centered");
    followingLi.appendChild(followingAnchor);
    followingLi.addEventListener("click", () => {
        window.location.href = "/followedUserPosts";
    });
    favoritesLi.after(followingLi);

    if (window.location.pathname === "/followedUserPosts") {
        indexActive.classList.remove("index-active");
        followingLi.classList.add("index-active");
    }

    if (window.location.pathname === "/approveComments") {
        indexActive.classList.remove("index-active");
    }

    if (window.location.pathname === "/createPost") {
        indexActive.classList.remove("index-active");
    }
}