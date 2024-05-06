import { IPostModel } from "#/models/post-model";

function addPost(post: IPostModel) {
    const results = document.querySelector(".results");
    if (results) {
        results.innerHTML += `
            <div class="post-result" id="post${post._id}">
                <h3 class="post-title">
                    ${post.description}
                </h3>
                <iframe src="https://open.spotify.com/embed/track/${post.song}" width="300" height="80" frameborder="0" 
                    allowtransparency="true" allow="encrypted-media">
                </iframe>
                <p class="post-user">
                    @${post.user.userName}
                </p>
                <div class="comments${post._id}">
    
                </div>
            </div>
        `;
    }
}

function addComments(post: IPostModel) {
    if (post.comments) {
        const approvedComments = post.comments.filter(i => {
            return i.approved;
        });
        if (approvedComments.length > 0) {
            const comments = document.querySelector(`.comments${post._id}`);
            if (comments) {
                comments.innerHTML += `
                    <p>
                        Comments:
                    </p>
                `;
                for (let c of approvedComments) {
                    comments.innerHTML += `
                        <p>
                            ${c.username}: ${c.comment}
                        </p>
                    `
                }
            }
        }
        const postEl = document.querySelector(`#post${post._id}`);
        if (postEl) {
            postEl.innerHTML += `
                <form id="${post._id}">
                    <input type="text" class="form-control post-comment-input" placeholder="Add a comment" 
                        aria-label="Comment">
                </form>
            `;
        }
    }
}

function addDeleteButton(post: IPostModel) {
    const username = localStorage.getItem("userName");
    if (post.user.userName === username || username === "admin") {
        const delButton = document.createElement("button");
        delButton.innerHTML = "Delete";
        delButton.classList.add("btn");
        delButton.classList.add("btn-danger");
        delButton.classList.add("deleteButton");
        delButton.setAttribute("type", "button");
        const postEl = document.querySelector(`#post${post._id} > form`);
        if (postEl) {
            postEl.append(delButton);
        }
    }
}

function addRemoveFavoriteButton(form: HTMLFormElement) {
    form.innerHTML += `
        <button type="button" class="btn favButton greenC letterStyle">
            Remove from favorites
        </button>
    `;
    const favButton = form.querySelector(`.favButton`);
    if (favButton) {
        favButton.addEventListener("click", (e) => {
            e.preventDefault();
            const target = <HTMLButtonElement> e.target;
            const postId = target.parentElement?.id;
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
}

function addCommentEventListener(form: HTMLFormElement) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const target = <HTMLFormElement> e.target;
        const input = target.querySelector("input");
        if (input) {
            const comment = input.value;
            const username = localStorage.getItem("userName");
            const postID = target.id;
            input.value = "";
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
                        const comments = document.querySelector(`.comments${target.id}`);
                        if (comments) {
                            comments.innerHTML += `
                                <p>
                                    Your comment is awaiting approval
                                </p>
                            `;
                            setTimeout(() => {
                                comments.lastElementChild?.remove();
                            }, 3000);
                        }
                    }
                })
        }
    });
}

function addDeleteButtonEventListener(form: HTMLFormElement) {
    form.addEventListener("click", (e) => {
        const target = <HTMLButtonElement> e.target;
        if (target.matches(".deleteButton")) {
            e.preventDefault();
            const postId = target.parentElement?.id;
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

function loadFavoritePosts() {
    fetch(`/favposts/${localStorage.getItem("userName")}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(response.statusText);
            }
        })
        .then(posts => {
            if (posts.length === 0) {
                throw new Error("You do not have any favorite posts");
            }
            // reverse to get newer posts first
            posts = posts.reverse();
            console.log(posts);
            for (let post of posts) {
                addPost(post);
                addComments(post);
                addDeleteButton(post);
            }
            document.querySelectorAll("form").forEach(i => {
                addRemoveFavoriteButton(i);
            });
            document.querySelectorAll("form").forEach(i => {
                addCommentEventListener(i);
            });
            document.querySelectorAll("form").forEach(i => {
                addDeleteButtonEventListener(i);
            });
        })
        .catch(err => {
            const results = document.querySelector(".results");
            if (results) {
                results.innerHTML = `<div> ${err.message} </div>`;
            }
        })
}

function checkCommentsToApprove() {
    fetch(`/allPosts`)
        .then(response => {
            if (response.ok) {
                return response.json()
            } else {
                throw new Error(response.statusText);
            }
        })
        .then((posts: IPostModel[]) => {
            const filteredPosts = posts.filter(i => {
                return localStorage.getItem("userName") === i.user.userName;
            })
            for (let p of filteredPosts) {
                if (p.comments) {
                    for (let c of p.comments) {
                        if (!c.approved) {
                            const approveComments = <HTMLAnchorElement> document.querySelector("body > a[href='/approveComments']");
                            if (approveComments) {
                                approveComments.style.display = "initial";
                            }
                        }
                    }
                }
            }
        })
        .catch(err => {
            const results = document.querySelector(".results");
            if (results) {
                results.innerHTML = `<div> ${err.message} </div>`;
            }
        });
}

function init() {
    loadFavoritePosts();
    checkCommentsToApprove();
}

init();