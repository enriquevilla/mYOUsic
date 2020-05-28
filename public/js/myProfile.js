function addPost(post) {
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
}

function addComments(post) {
    const approvedComments = post.comments.filter(i => {
        return i.approved;
    });
    if (approvedComments.length > 0) {
        document.querySelector(`.comments${post._id}`).innerHTML += `
            <p>
                Comments:
            </p>
        `;
        for (let c of approvedComments) {
            document.querySelector(`.comments${post._id}`).innerHTML += `
                <p>
                    ${c.username}: ${c.comment}
                </p>
            `
        }
    }
    document.querySelector(`#post${post._id}`).innerHTML += `
        <form id="${post._id}">
            <input type="text" class="form-control post-comment-input" placeholder="Add a comment" 
                aria-label="Comment">
        </form>
    `;
}

function addDeleteButton(post) {
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

function addRemoveFavoriteButton(i) {
    i.innerHTML += `
        <button type="button" class="btn favButton greenC letterStyle">
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
}

function addCommentEventListener(i) {
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
            .then(comments => {
                const comment = comments.reverse()[0];
                if (comment.approved) {
                    window.location.reload();
                } else {
                    document.querySelector(`.comments${e.target.id}`).innerHTML += `
                        <p>
                            Your comment is awaiting approval
                        </p>
                    `;
                    setTimeout(() => {
                        document.querySelectorAll(`.comments${e.target.id} > p`).lastChild.remove();
                    }, 3000);
                }
            })
    });
}

function addDeleteButtonEventListener(i) {
    i.addEventListener("click", (e) => {
        if (e.target.matches(".deleteButton")) {
            e.preventDefault();
            const postId = e.target.parentElement.id;
            const data = {
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
    });
}

function addFavoriteButton(i) {
    i.innerHTML += `
        <button type="button" class="btn favButton greenC letterStyle">
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
            if (posts.length === 0) {
                throw new Error("You have not made any posts yet");
            }
            posts = posts.reverse();
            console.log(posts);
            for (let post of posts) {
                addPost(post);
                addComments(post);
                addDeleteButton(post);
                console.log(post);
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
                            addRemoveFavoriteButton(i);
                        } else {
                            addFavoriteButton(i);
                        }
                    })
                })

            document.querySelectorAll("form").forEach(i => {
                addDeleteButtonEventListener(i);
            });

            document.querySelectorAll("form").forEach(i => {
                addCommentEventListener(i);
            }) 
        })
        .catch(err => {
            document.querySelector(".results").innerHTML = `<div> ${err.message} </div>`;
        })
}

function checkCommentsToApprove() {
    fetch(`/commentsToApprove/${localStorage.getItem("userName")}`)
        .then(response => {
            if (response.ok) {
                return response.json()
            } else {
                throw new Error(response.statusText);
            }
        })
        .then(posts => {
            const filteredPosts = posts.filter(i => {
                return localStorage.getItem("userName") === i.user.userName;
            })
            for (let p of filteredPosts) {
                for (let c of p.comments) {
                    if (!c.approved) {
                        document.querySelector("body > a[href='/approveComments']").style.display = "initial";
                    }
                }
            }
        })
        .catch(err => {
            document.querySelector(".results").innerHTML = `<div> ${err.message} </div>`;
        });
}

function init() {
    document.title = localStorage.getItem("userName") + "'s Profile";
    loadMyPosts();
    checkCommentsToApprove();
}

init();