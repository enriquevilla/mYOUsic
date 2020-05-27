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
                    <div class="post-result" id="post${post._id}">
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
                            aria-label="Comment">
                    </form>
                    
                `;
                const username = localStorage.getItem("userName");
                if (post.user.userName === username || username === "admin") {
                    const delButton = document.createElement("button");
                    delButton.innerHTML = "Delete";
                    delButton.classList.add("btn");
                    delButton.classList.add("btn-danger");
                    delButton.classList.add("deleteButton");
                    delButton.setAttribute("type", "button");
                    document.querySelector(`#post${post._id} > form`).append(delButton);
                }
            }
            fetch(`/favorites/${localStorage.getItem("userName")}`)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error(response.statusText);
                    }
                })
                .then(favorites => {
                    document.querySelectorAll("form").forEach(i => {
                        if (favorites.includes(i.id)) {
                            i.innerHTML += `
                                <button type="button" class="btn btn-primary favButton">
                                    Remove from favorites
                                </button>
                            `;
                            i.querySelector(`.favButton`).addEventListener("click", (e) => {
                                e.preventDefault();
                                const postId = e.target.parentElement.id;
                                const username = localStorage.getItem("userName");
                                const data = {
                                    username: username,
                                    postId: postId
                                }
                                const settings = {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(data)
                                };
                                console.log(data);
                                fetch("/removeFavorite", settings)
                                    .then(response => {
                                        if (response.ok) {
                                            window.location.reload();
                                        } else {
                                            throw new Error(response.statusText);
                                        }
                                    })
                            });
                        } else {
                            i.innerHTML += `
                                <button type="button" class="btn btn-primary favButton">
                                    Add to favorites
                                </button>
                            `;
                            i.querySelector(`.favButton`).addEventListener("click", (e) => {
                                e.preventDefault();
                                const postId = e.target.parentElement.id;
                                const username = localStorage.getItem("userName");
                                const data = {
                                    username: username,
                                    postId: postId
                                }
                                const settings = {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(data)
                                };
                                console.log(data);
                                fetch("/addFavorite", settings)
                                    .then(response => {
                                        if (response.ok) {
                                            return response.json();
                                        } else {
                                            throw new Error(response.statusText);
                                        }
                                    })
                                    .then(_ => {
                                        window.location.reload();
                                    })
                            });
                        }
                    })
                })

            document.querySelectorAll("form").forEach(i => {
                i.addEventListener("click", (e) => {
                    if (e.target.matches(".deleteButton")) {
                        e.preventDefault();
                        const postId = e.target.parentElement.id;
                        const username = localStorage.getItem("userName");
                        const data = {
                            username: username,
                            postId: postId
                        }
                        const settings = {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(data)
                        }

                        fetch("/deleteOwnPosts", settings)
                            .then(response => {
                                if (response.ok) {
                                    window.location.reload();
                                } else {
                                    throw new Error(response.statusText);
                                }
                            })
                    }
                })
            });

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
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
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
            document.querySelector(".results").innerHTML = `<div> ${err.message} </div>`;
        })
}

function init() {
    getAllPosts();
}

init();