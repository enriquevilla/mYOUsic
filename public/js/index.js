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
                    </div>
                `
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