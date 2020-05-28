function addPost(post) {
    document.querySelector(".results").innerHTML += `
        <div class="post-result" id="post${post._id}">
            <h3 class="post-title">
                ${post.description}
            </h3>
            <iframe src="https://open.spotify.com/embed/track/${post.song}" width="300" height="80" frameborder="0" 
                allowtransparency="true" allow="encrypted-media">
            </iframe>
            <div class="comments${post._id} comments-to-approve">

            </div>
        </div>
    `;
}

function addCommentsToApprove(post) {
    const unapprovedComments = post.comments.filter(i => {
        return !i.approved;
    });
    if (unapprovedComments.length > 0) {
        document.querySelector(`.comments${post._id}`).innerHTML += `
            <p>
                Comments to approve:
            </p>
        `;
        for (let c of unapprovedComments) {
            document.querySelector(`.comments${post._id}`).innerHTML += `
                <p class="c${c._id}">
                    ${c.username}: ${c.comment}
                    <span>
                        <button type="button" class="btn btn-primary approve-comment-button">
                            Approve
                        </button>
                        <button type="button" class="btn btn-danger reject-comment-button">
                            Reject
                        </button>
                    </span>
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

function addEventListenerToButtons() {
    if (document.querySelectorAll(".comments-to-approve").length > 0) {
        document.querySelectorAll(".comments-to-approve").forEach(i => {
            i.addEventListener("click", (e) => {
                if (e.target.matches(".approve-comment-button")) {
                    const data = {
                        commentID: e.target.parentNode.parentNode.className.substr(1)
                    }
                    const settings = {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    }
                    fetch("/approveComment", settings)
                        .then(response => {
                            if (response.ok) {
                                window.location.reload();
                            } else {
                                document.querySelector(".results").innerHTML = `
                                    <div>
                                        ${response.statusText}
                                    </div>
                                `
                            }
                        })
                }
                if (e.target.matches(".reject-comment-button")) {
                    const data = {
                        commentID: e.target.parentNode.parentNode.className.substr(1)
                    }
                    const settings = {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    }
                    fetch("/rejectComment", settings)
                        .then(response => {
                            if (response.ok) {
                                window.location.reload();
                            } else {
                                document.querySelector(".results").innerHTML = `
                                    <div>
                                        ${response.statusText}
                                    </div>
                                `
                            }
                        })
                }
            });
        })
    }
}

function loadCommentsToApprove() {
    fetch(`/allPosts`)
        .then(response => {
            if (response.ok) {
                return response.json()
            } else {
                throw new Error(response.statusText);
            }
        })
        .then(posts => {
            const newerPosts = posts.reverse();
            const filteredPosts = newerPosts.filter(i => {
                return localStorage.getItem("userName") === i.user.userName;
            });
            let approveExists = false;
            for (let p of filteredPosts) {
                let approvedArray = [];
                for (let c of p.comments) {
                    approvedArray.push(c.approved);
                }
                if (approvedArray.includes(false)) {
                    addPost(p);
                    addCommentsToApprove(p);
                    approveExists = true;
                }
            }
            if (!approveExists) {
                throw new Error("No comments to approve");
            }
            addEventListenerToButtons();
        })
        .catch(err => {
            document.querySelector(".results").innerHTML = `<div> ${err.message} </div>`;
        });
}

function init() {
    loadCommentsToApprove();
}

init();