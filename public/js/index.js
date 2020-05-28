function addPost(post) {
    document.querySelector(".results").innerHTML += `
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

function addDeleteButtonEventListener(i) {
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
                    `
                    setTimeout(() => {
                        document.querySelector(`.comments${e.target.id}`).lastElementChild.remove();
                    }, 3000);
                }
            })
    });
}

function addFollowButton(i, userList) {
    const userText = i.innerText.split(" ")[0].substr(1);
    if (i.innerHTML.trim() !== `@${localStorage.getItem("userName")}`) {
        if (userList.includes(userText)) {
            i.innerHTML += `
                <span>
                    <button type="button" class="btn unfollow-button greenC letterStyle">
                        Unfollow
                    </button>
                </span>
            `;
            i.querySelector(".unfollow-button").addEventListener("click", (e) => {
                e.preventDefault();
                let url = '/unfollow';
                
                const userText = e.target.parentNode.parentNode.innerText.split(" ")[0].substr(1);

                let data = {
                    username: localStorage.getItem("userName"),
                    userToUnfollow: userText
                }

                console.log(data);

                let settings = {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }

                let results = document.querySelector('.results');

                fetch(url, settings)
                    .then(response => {
                        if (response.ok) {
                            window.location.reload();
                        } else {
                            throw new Error(response.statusText);
                        }
                    })
                    .catch(err => {
                        results.innerHTML = `<div> ${err.message} </div>`;
                    });
            });
        } else {
            i.innerHTML += `
                <span>
                    <button type="button" class="btn follow-button greenC letterStyle">
                        Follow
                    </button>
                </span>
            `;
            i.querySelector(".follow-button").addEventListener("click", (e) => {
                e.preventDefault();
                let url = '/follow';
    
                let data = {
                    username: localStorage.getItem("userName"),
                    userToFollow: userText
                }
    
                let settings = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }
    
                let results = document.querySelector('.results');
    
                fetch(url, settings)
                    .then(response => {
                        if (response.ok) {
                            window.location.reload();
                        } else {
                            throw new Error(response.statusText);
                        }
                    })
                    .catch(err => {
                        results.innerHTML = `<div> ${err.message} </div>`;
                    });
            });
        }
    }
}

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
            if (posts.length === 0) {
                throw new Error("No one has made any posts yet :(");
            }
            // reverse to get newer posts first
            posts = posts.reverse();
            console.log(posts);
            for (let post of posts) {
                addPost(post);
                addComments(post);
                addDeleteButton(post);
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

            fetch(`/following/${localStorage.getItem("userName")}`)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error(response.statusText);
                    }
                })
                .then(followed => {
                    const followedUsernames = followed.map(i => {
                        return i.userName;
                    });
                    document.querySelectorAll(".post-user").forEach(i => {
                        addFollowButton(i, followedUsernames);
                    });
                });

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
    getAllPosts();
    checkCommentsToApprove();
}

init();