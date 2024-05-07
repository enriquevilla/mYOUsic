import express from "express";
import bodyParser from "body-parser";
import { connect, disconnect } from "mongoose";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { Headers, RequestInit, HeadersInit, BodyInit } from "node-fetch";
import fetch from "node-fetch";

import { DBURL, PORT, SECRET_TOKEN, SPOTIFY_KEY, PRODUCTION_MODE } from "#/config";
import { Users, IUser, IUserModel } from "#/models/user-model";
import { IPost, Posts } from '#/models/post-model';
import { Comments } from "#/models/comments-model";

const app = express();
const jsonParser = bodyParser.json();

const root = PRODUCTION_MODE ? "dist/public" : "public";

app.use(express.static(root));

import { cors } from "#/middleware/cors";
app.use(cors);

// Application routing
app.get("/", (_, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/about", (_, res) => {
    res.sendFile(__dirname + "/public/pages/about.html");
});

app.get("/login", (_, res) => {
    res.sendFile(__dirname + "/public/pages/login.html");
});

app.get("/register", (_, res) => {
    res.sendFile(__dirname + "/public/pages/register.html");
});

app.get("/createPost", (_, res) => {
    res.sendFile(__dirname + "/public/pages/createPost.html");
});

app.get("/myProfile", (_, res) => {
    res.sendFile(__dirname + "/public/pages/myProfile.html");
});

app.get("/favorites", (_, res) => {
    res.sendFile(__dirname + "/public/pages/favorites.html")
});

app.get("/approveComments", (_, res) => {
    res.sendFile(__dirname + "/public/pages/approveComments.html")
});

app.get("/followedUserPosts", (_, res) => {
    res.sendFile(__dirname + "/public/pages/followedUserPosts.html");
});

app.get("/validate-token", (req, res) => {
    const token = <string> req.headers.sessiontoken;
    jsonwebtoken.verify(token, SECRET_TOKEN, (err, decoded) => {
        if (err) {
            res.statusMessage = "Your session expired";
            return res.status(409).end();
        } else if (decoded) {
            const { userName } = decoded as IUser;
            return res.status(200).json({
                userName: userName
            });
        }
    });
});

app.get("/genAccessToken", (req, res) => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Basic " + SPOTIFY_KEY);
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    const urlencoded = new URLSearchParams();
    urlencoded.append("grant_type", "client_credentials");

    const requestOptions: RequestInit = {
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

app.post('/login', jsonParser, (req, res) => {
    let { userName, password } = req.body;
    if (!userName || !password) {
        res.statusMessage = "Parameter missing in the body of the request.";
        return res.status(406).end();
    }

    Users
        .getUserByUserName(userName)
        .then((user: IUser) => {
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
                .catch((err: Error) => {
                    res.statusMessage = err.message;
                    return res.status(400).end();
                });
        })
        .catch((err: Error) => {
            res.statusMessage = "User not found";
            return res.status(400).end();
        });

})

app.post('/register', jsonParser, (req, res) => {
    let { userName, password } = req.body;

    if (!userName || !password) {
        res.statusMessage = "Parameter missing in the body of the request.";
        return res.status(406).end();
    }
    bcrypt.hash(password, 10)
        .then(hashedPassword => {
            const newUser: IUser = {
                userName,
                password: hashedPassword
            };

            Users
                .createUser(newUser)
                .then((result: IUser) => {
                    return res.status(201).json(result);
                })
                .catch((err: Error) => {
                    res.statusMessage = err.message;
                    return res.status(400).end();
                });
        })
        .catch(err => {
            res.statusMessage = err.message;
            return res.status(400).end();
        });
});


app.post('/posts', jsonParser, (req, res) => {
    const {description, song, username} = req.body;

    if (!song || !description || !username) {
        res.statusMessage = "Field or fields missing in request body";
        return res.status(406).end();
    }

    Users
        .getUserByUserName(username)
        .then((userJSON: IUserModel) => {
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
                .catch((err: Error) => {
                    res.statusMessage = "Something went wrong";
                    return res.status(500).end();
                });
        })
        .catch((err: Error) => {
            res.statusMessage = "Something went wrong";
            return res.status(500).end();
        })
  });

app.get("/allPosts", (_, res) => {
    Posts
        .getAllPosts()
        .then((posts: IPost) => {
            return res.status(200).json(posts);
        })
        .catch((err: Error) => {
            res.statusMessage = "Something went wrong";
            return res.status(500).end();
        })
});

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
        .then((user: IUserModel) => {
            Posts
                .getPostByID(postID)
                .then((post: IPost) => {
                    if (String(post.user) === String(user._id)) {
                        newComment.approved = true;
                    }
                    Comments
                        .createComment(newComment)
                        .then(comment => {
                            Posts
                                .updatePostComments(postID, comment._id)
                                .then((updatedPost: IPost) => {
                                    return res.status(201).json(updatedPost.comments);
                                })
                                .catch(() => {
                                    res.statusMessage = "Something went wrong when updating post comments";
                                    return res.status(500).end();
                                });
                        })
                        .catch(() => {
                            res.statusMessage = "Something went wrong when adding comment.";
                            return res.status(500).end();
                        })
                })
        })

});

app.post("/addFavorite", jsonParser, (req, res) => {
    const {postId, username} = req.body;
   
    if (!postId || !username) {
        res.statusMessage = "Field or fields missing in request body";
        return res.status(406).end();
    }

    Users
        .createFavorite(username, postId)
        .then((favJSON: any) => {
            return res.status(200).json(favJSON);
        })
        .catch(() => {
            res.statusMessage = "Something went wrong when creating favorite";
            return res.status(500).end();
        });
});

app.post("/removeFavorite", jsonParser, (req, res) => {
    const {username, postId} = req.body;

    Users
        .removeFavorite(username, postId)
        .then(() => {
            return res.status(204).json({});
        })
        .catch(() => {
            res.statusMessage = "Something went wrong when removing a favorite";
            return res.status(500).end();
        })
});

app.get("/favorites/:username", (req, res) => {
    const { username } = req.params;

    Users
        .getUserByUserName(username)
        .then((user: IUser) => {
            return res.status(200).json(user.favorites);
        })
        .catch(() => {
            res.statusMessage = "Something went wrong when getting favorites by user";
            return res.status(500).end();
        })
})

app.get("/posts/:username", (req, res) => {
    const {username} = req.params;

    Users
        .getUserByUserName(username)
        .then((userJSON: IUserModel) => {
            Posts
                .getPostsByUserID(userJSON._id)
                .then((posts: IPost[]) => {
                    return res.status(200).json(posts);
                })
                .catch(() => {
                    res.statusMessage = "Something went wrong getting posts by own ID";
                    return res.status(500).end();
                });
        })
        .catch(() => {
            res.statusMessage = "Something went wrong when getting user by username";
            return res.status(500).end();
        });
});

app.delete("/deleteOwnPosts", jsonParser, (req, res)=>{
    const { postId } = req.body;

    if (!postId) {
        res.statusMessage = "Field or fields missing in request body";
        return res.status(406).end();
    }
    Posts
        .deleteOwnPosts(postId)
        .then((deleted: any) => {
            return res.status(200).json(deleted);
        })
        .catch(() => {
            res.statusMessage = "Something went wrong when deleting post";
            return res.status(500).end();
        });
});

app.get("/favposts/:username", (req, res) => {
    const { username } = req.params;

    Users
        .getFavoritesByUsername(username)
        .then((userJSON: IUser) => {
            return res.status(200).json(userJSON.favorites);
        })
        .catch(() => {
            res.statusMessage = "Something went wrong when getting favorite posts";
            return res.status(500).end();
        })
});

app.patch("/approveComment", jsonParser, (req, res) => {
    const {commentID} = req.body;

    Comments
        .approveComment(commentID)
        .then(() => {
            return res.status(204).json({})
        })
        .catch(() => {
            res.statusMessage = "Something went wrong when approving a comment";
            return res.status(500).end();
        })
});

app.delete("/rejectComment", jsonParser, (req, res) => {
    const {commentID} = req.body;

    Comments
        .deleteComment(commentID)
        .then(() => {
            return res.status(200).json({});
        })
        .catch(() => {
            res.statusMessage = "Something went wrong when rejecting a comment";
            return res.status(500).end();
        })
});

app.post("/follow", jsonParser, (req, res) => {
    const {username, userToFollow} = req.body;

    Users
        .getUserByUserName(userToFollow)
        .then((user: IUserModel) => {
            Users
                .followUser(username, user._id)
                .then(() => {
                    return res.status(200).json({});
                })
                .catch(() => {
                    res.statusMessage = "Something went wrong when following a user";
                    return res.status(500).end();
                })
        })
        .catch(() => {
            res.statusMessage = "Something went wrong when getting user by username";
            return res.status(500).end();
        });
});

app.patch("/unfollow", jsonParser, (req, res) => {
    const {username, userToUnfollow} = req.body;

    Users
        .getUserByUserName(userToUnfollow)
        .then((user: IUserModel) => {
            Users
                .unfollowUser(username, user._id)
                .then(() => {
                    return res.status(204).json({});
                })
                .catch(() => {
                    res.statusMessage = "Something went wrong when unfollowing user";
                    return res.status(500).end();
                })
        })
        .catch(() => {
            res.statusMessage = "Something went wrong when getting user by username";
            return res.status(500).end();
        })
});

app.get("/following/:username", (req, res) => {
    const {username} = req.params;

    Users
        .getFollowingByUsername(username)
        .then((userJSON: IUser) => {
            return res.status(200).json(userJSON.following);
        })
        .catch(() => {
            res.statusMessage = "Something went wrong when getting followed users";
            return res.status(500).end();
        })
});

app.get("/getPostsFromFollowed/:username", (req, res) => {
    const {username} = req.params;

    Users
        .getUserByUserName(username)
        .then((userJSON: any) => {
            if (userJSON.following) {
                const following = userJSON.following.map((user: any) => {
                    return user._id;
                })
                Posts
                    .getPostsByUserList(following)
                    .then((posts: any) => {
                        return res.status(200).json(posts);
                    })
                    .catch(() => {
                        res.statusMessage = "Something went wrong when getting followed users posts";
                        return res.status(500).end();
                    })
            } 
        })
});

app.listen(PORT, () => {
    console.log(`Server running on localhost:${PORT}`);
    new Promise((resolve, reject) => {
        connect(DBURL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log("Connected to db successfully");
                return resolve(200);
            }
        });
    })
    .catch(err => {
        disconnect();
        console.log(err);
    });
});

export { Users };
