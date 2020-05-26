function getAllPosts() {
    fetch("/allPosts")
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(response.statusText);
            }
        })
        .then(posts => {
            // reverse to get newer posts first
            posts = posts.reverse();
            console.log(posts);
            for (let post of posts) {
                document.querySelector(".results").innerHTML += `
                    <div class="post-result">
                        <h3 class="post-title">
                            ${post.description}
                        </h3>
                        <iframe src="https://open.spotify.com/embed/track/${post.song}" width="300" height="80" frameborder="0" 
                            allowtransparency="true" allow="encrypted-media">
                        </iframe>
                        <p class="post-user">
                            Post by: ${post.user.userName}
                        </p>
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
                    for (let comment of post.comments) {
                        document.querySelector(`.comments${post._id}`).innerHTML += `
                            <p>
                                ${comment}
                            </p>
                        `
                    }
                }
                document.querySelector(`.comments${post._id}`).innerHTML += `
                    <form id="${post._id}">
                        <input type="text" class="form-control post-comment-input" placeholder="Comment" 
                            aria-label="Comment" id="commentinput${post._id}">
                    </form>
                `;
                console.log(post._id);
                document.getElementById(`${post._id}`).addEventListener("submit", (e) => {
                    e.preventDefault();
                    const comment = document.getElementById(`${post._id}`).querySelector("input").value;
                    const username = localStorage.getItem("userName");
                    const postID = document.getElementById(`${post._id}`).parentNode.parentNode.id;
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
                        .then(comments => {
                            console.log(comments);
                        })
                });
            }
        })
        .catch(err => {
            document.querySelector(".results").innerHTML = `<div> ${err.message} </div>`;
        })
}

function init() {
    getAllPosts();
}

init();