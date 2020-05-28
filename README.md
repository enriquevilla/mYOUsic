# Web Applications Development Final Project

## Full stack web application 

<p>
    Technologies used: MongoDB, Express, Node, Bootstrap
</p>
<p>
    Languages used: HTML, CSS and Vanilla Javascript
</p>

<p>
    By: 
</p>
<ul>
    <li>
        Enrique Marcelo Villa García A01193635
    </li> 
    <li>
        Diego Alberto Partida González A01195444
    </li>
</ul>

<a href="https://glacial-scrubland-24431.herokuapp.com/">
    Click to go to the app
</a>


validar el sessiontoken del usuario
app.get("/validate-token", (req, res) => {
    let token = req.headers.sessiontoken;
    jsonwebtoken.verify(token, SECRET_TOKEN, (err, decoded) => {
        if (err) {
            res.statusMessage = "Your session expired";
            return res.status(409).end();
        }
        return res.status(200).json({
            userName: decoded.userName
        });
    });
});

generar accesstoken para Spotify API
app.get("/genAccessToken", (req, res) => {
    let myHeaders = new fetch.Headers();
    myHeaders.append("Authorization", "Basic " + SPOTIFY_KEY);
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    let urlencoded = new URLSearchParams();
    urlencoded.append("grant_type", "client_credentials");

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    fetch("https://accounts.spotify.com/api/token", requestOptions)
        .then(response => response.json())
        .then(result => { return res.status(200).json(result) })
        .catch(error => {
            throw new Error(error);
        });
});

validar credenciales para login
app.post('/login', jsonParser, (req, res) => {
    let { userName, password } = req.body;
    if (!userName || !password) {
        res.statusMessage = "Parameter missing in the body of the request.";
        return res.status(406).end();
    }

    Users
        .getUserByUserName(userName)
        .then(user => {
            bcrypt.compare(password, user.password)
                .then(result => {
                    if (result) {
                        let userData = {
                            userName: user.userName
                        };
                        jsonwebtoken.sign(userData, SECRET_TOKEN, { expiresIn: '1h' }, (err, token) => {
                            if (err) {
                                res.statusMessage = err.message;
                                return res.status(400).end();
                            }
                            console.log(token);
                            return res.status(200).json({ token });
                        });
                    } else {
                        res.statusMessage = "Wrong credentials";
                        return res.status(409).end();
                    }
                })
                .catch(err => {
                    res.statusMessage = err.message;
                    return res.status(400).end();
                });
        })
        .catch(err => {
            res.statusMessage = "User not found";
            return res.status(400).end();
        });

})

creación de usuarios
app.post('/register', jsonParser, (req, res) => {
    let { userName, password } = req.body;

    if (!userName || !password) {
        res.statusMessage = "Parameter missing in the body of the request.";
        return res.status(406).end();
    }
    bcrypt.hash(password, 10)
        .then(hashedPassword => {
            const newUser = {
                userName,
                password: hashedPassword
            };

            Users
                .createUser(newUser)
                .then(result => {
                    return res.status(201).json(result);
                })
                .catch(err => {
                    res.statusMessage = err.message;
                    return res.status(400).end();
                });
        })
        .catch(err => {
            res.statusMessage = err.message;
            return res.status(400).end();
        });
});

creación de posts
app.post('/posts', jsonParser, (req, res) => {
    const {description, song, username} = req.body;

    if (!song || !description || !username) {
        res.statusMessage = "Field or fields missing in request body";
        return res.status(406).end();
    }

    Users
        .getUserByUserName(username)
        .then(userJSON => {
            const newPost = {
                description: description,
                song : song,
                user : userJSON._id
            };
            Posts
                .createPost(newPost)
                .then(post => {
                    console.log("New Post", newPost);
                    return res.status(201).json(post);
                })
                .catch(_ => {
                    res.statusMessage = "Something went wrong";
                    return res.status(500).end();
                });
        })
        .catch(_ => {
            res.statusMessage = "Something went wrong";
            return res.status(500).end();
        })
  });

traer todos los posts de la base de datos
app.get("/allPosts", (_, res) => {
    Posts
        .getAllPosts()
        .then(posts => {
            return res.status(200).json(posts);
        })
        .catch(_ => {
            res.statusMessage = "Something went wrong";
            return res.status(500).end();
        })
});

agregar comentarios a los posts
app.post("/addComment", jsonParser, (req, res) => {
    const {postID, comment, username} = req.body;

    if (!postID || !comment || !username) {
        res.statusMessage = "Field or fields missing in request body";
        return res.status(406).end();
    }

    let newComment = {
        comment: comment,
        username: username,
        approved: false
    }

    Users
        .getUserByUserName(username)
        .then(user => {
            Posts
                .getPostByID(postID)
                .then(post => {
                    if (String(post.user) === String(user._id)) {
                        newComment.approved = true;
                    }
                    Comments
                        .createComment(newComment)
                        .then(comment => {
                            Posts
                                .updatePostComments(postID, comment._id)
                                .then(updatedPost => {
                                    return res.status(201).json(updatedPost.comments);
                                })
                                .catch(_ => {
                                    res.statusMessage = "Something went wrong when updating post comments";
                                    return res.status(500).end();
                                });
                        })
                        .catch(_ => {
                            res.statusMessage = "Something went wrong when adding comment.";
                            return res.status(500).end();
                        })
                })
        })

});

agregar posts favoritos
app.post("/addFavorite", jsonParser, (req, res) => {
    const {postId, username} = req.body;
   
    if (!postId || !username) {
        res.statusMessage = "Field or fields missing in request body";
        return res.status(406).end();
    }

    Users
        .createFavorite(username, postId)
        .then(favJSON => {
            return res.status(200).json(favJSON);
        })
        .catch(_ => {
            res.statusMessage = "Something went wrong when creating favorite";
            return res.status(500).end();
        });
});

quitar post de favoritos
app.post("/removeFavorite", jsonParser, (req, res) => {
    const {username, postId} = req.body;

    Users
        .removeFavorite(username, postId)
        .then(_ => {
            return res.status(204).json({});
        })
        .catch(_ => {
            res.statusMessage = "Something went wrong when removing a favorite";
            return res.status(500).end();
        })
});

obtener los posts favoritos de un usuario
app.get("/favorites/:username", (req, res) => {
    const {username} = req.params;

    Users
        .getUserByUserName(username)
        .then(user => {
            return res.status(200).json(user.favorites);
        })
        .catch(_ => {
            res.statusMessage = "Something went wrong when getting favorites by user";
            return res.status(500).end();
        })
})

obtener los posts de un usuario
app.get("/posts/:username", (req, res) => {
    const {username} = req.params;

    Users
        .getUserByUserName(username)
        .then(userJSON => {
            Posts
                .getPostsByUserID(userJSON._id)
                .then(posts => {
                    return res.status(200).json(posts);
                })
                .catch(_ => {
                    res.statusMessage = "Something went wrong getting posts by own ID";
                    return res.status(500).end();
                });
        })
        .catch(_ => {
            res.statusMessage = "Something went wrong when getting user by username";
            return res.status(500).end();
        });
});

borrar posts
app.delete("/deleteOwnPosts", jsonParser, (req, res)=>{
    const {postId} = req.body;

    if (!postId) {
        res.statusMessage = "Field or fields missing in request body";
        return res.status(406).end();
    }
    Posts
        .deleteOwnPosts(postId)
        .then(deleted => {
            return res.status(200).json(deleted);
        })
        .catch(_ => {
            res.statusMessage = "Something went wrong when deleting post";
            return res.status(500).end();
        });
});

obtener los posts favoritos de un usuario
app.get("/favposts/:username", (req, res) => {
    const {username} = req.params;

    Users
        .getFavoritesByUsername(username)
        .then(userJSON => {
            return res.status(200).json(userJSON.favorites);
        })
        .catch(_ => {
            res.statusMessage = "Something went wrong when getting favorite posts";
            return res.status(500).end();
        })
});

aprobación de comentarios
app.patch("/approveComment", jsonParser, (req, res) => {
    const {commentID} = req.body;

    Comments
        .approveComment(commentID)
        .then(_ => {
            return res.status(204).json({})
        })
        .catch(_ => {
            res.statusMessage = "Something went wrong when approving a comment";
            return res.status(500).end();
        })
});

rechazo de comentarios
app.delete("/rejectComment", jsonParser, (req, res) => {
    const {commentID} = req.body;

    Comments
        .deleteComment(commentID)
        .then(_ => {
            return res.status(200).json({});
        })
        .catch(_ => {
            res.statusMessage = "Something went wrong when rejecting a comment";
            return res.status(500).end();
        })
});

seguir un usuario
app.post("/follow", jsonParser, (req, res) => {
    const {username, userToFollow} = req.body;

    Users
        .getUserByUserName(userToFollow)
        .then(user => {
            Users
                .followUser(username, user._id)
                .then(_ => {
                    return res.status(200).json({});
                })
                .catch(_ => {
                    res.statusMessage = "Something went wrong when following a user";
                    return res.status(500).end();
                })
        })
        .catch(_ => {
            res.statusMessage = "Something went wrong when getting user by username";
            return res.status(500).end();
        });
});

dejar de seguir un usuario
app.patch("/unfollow", jsonParser, (req, res) => {
    const {username, userToUnfollow} = req.body;

    Users
        .getUserByUserName(userToUnfollow)
        .then(user => {
            Users
                .unfollowUser(username, user._id)
                .then(_ => {
                    return res.status(204).json({});
                })
                .catch(_ => {
                    res.statusMessage = "Something went wrong when unfollowing user";
                    return res.status(500).end();
                })
        })
        .catch(_ => {
            res.statusMessage = "Something went wrong when getting user by username";
            return res.status(500).end();
        })
});

obtener a los que sigue un usuario
app.get("/following/:username", (req, res) => {
    const {username} = req.params;

    Users
        .getFollowingByUsername(username)
        .then(userJSON => {
            return res.status(200).json(userJSON.following);
        })
        .catch(_ => {
            res.statusMessage = "Something went wrong when getting followed users";
            return res.status(500).end();
        })
});

obtener posts de los que sigue un usuario
app.get("/getPostsFromFollowed/:username", (req, res) => {
    const {username} = req.params;

    Users
        .getUserByUserName(username)
        .then(userJSON => {
            const following = userJSON.following.map(i => {
                return i._id;
            })
            Posts
                .getPostsByUserList(following)
                .then(posts => {
                    return res.status(200).json(posts);
                })
                .catch(_ => {
                    res.statusMessage = "Something went wrong when getting followed users posts";
                    return res.status(500).end();
                })
        })
});