function loadMyPosts() {
    fetch(`/posts/${localStorage.getItem("userName")}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(response.statusText);
            }
        })
        .then(posts => {
            posts = posts.reverse();
            console.log(posts);
            for (let post of posts) {
                document.querySelector(".results").innerHTML += `
                    <div class="post-result" id="post${post._id}">
                        <h3 class="post-title">
                            ${post.description}
                        </h3>
                        <iframe src="https://open.spotify.com/embed/track/${post.song}" width="300" height="80" frameborder="0" 
                            allowtransparency="true" allow="encrypted-media">
                        </iframe>
                        <div class="comments${post._id}">

                        </div>
                    </div>
                `;
                if (post.comments.length > 0) {
                    document.querySelector(`.comments${post._id}`).innerHTML += `
                        <p>
                            Comments:
                        </p>
                    `;
                    for (let c of post.comments) {
                        document.querySelector(`.comments${post._id}`).innerHTML += `
                            <p>
                                ${c.username}: ${c.comment}
                            </p>
                        `
                    }
                }
                document.querySelector(`#post${post._id}`).innerHTML += `
                    <form id="${post._id}">
                        <input type="text" class="form-control post-comment-input" placeholder="Comment" 
                            aria-label="Comment" id="commentinput${post._id}">
                    </form>
                `;
            }
            document.querySelectorAll("form").forEach(i => {
                i.addEventListener("submit", (e) => {
                    e.preventDefault();
                    const comment = e.target.querySelector("input").value;
                    const username = localStorage.getItem("userName");
                    const postID = e.target.id;
                    e.target.querySelector("input").value = "";
                    const data = {
                        comment: comment,
                        username: username,
                        postID: postID
                    };
                    const settings = {
                        method: 'POST',
                        headers : {
                            'Content-Type': 'application/json'
                        },
                        body : JSON.stringify(data)
                    };
                    fetch("/addComment", settings)
                        .then(response => {
                            if (response.ok) {
                                return response.json();
                            } else {
                                throw new Error(response.statusText);
                            }
                        })
                        .then(post => {
                            const comments = post.comments.reverse();
                            document.querySelector(`.comments${e.target.id}`).innerHTML += `
                                <p>
                                    ${comments[0].username}: ${comments[0].comment}
                                </p>
                            `
                        })
                });
            }) 
        })
        .catch(err => {
            results.innerHTML = `<div> ${err.message} </div>`;
        })
}

function admin(){
    const username = localStorage.getItem("userName");
    console.log("admin funct");
    if (username === "admin") {
        addButton = document.querySelector(".rounded-circle ");
        addButton.setAttribute("style","display:none");
    }
}

function init() {
    admin();
    document.title = localStorage.getItem("userName") + "'s Profile";
    loadMyPosts();
    
}

init();