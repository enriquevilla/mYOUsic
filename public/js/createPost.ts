import { SearchContent } from "spotify-types";

function fetchSong(title: string) {
    fetch("/genAccessToken")
        .then(response => {
            return response.json();
        })
        .then(tokenJSON => {
            const API_TOKEN = tokenJSON.access_token;
            console.log(API_TOKEN);
            let url = `https://api.spotify.com/v1/search?q=${title}&type=track&limit=10`;
            let settings = {
                method : 'GET',
                headers : {
                    Authorization : `Bearer ${API_TOKEN}`
                }
            }
            fetch( url, settings )
                .then( response => {
                    if( response.ok ){
                        return response.json();
                    }
                    if (response.status === 401) {
                        throw new Error("Spotify API token expired.");
                    }
                    throw new Error( response.statusText );
                })
                .then((responseJson: SearchContent) => {
                    // window.value = responseJson;
                    let results = document.querySelector('.results');
                    if (results) {
                        results.innerHTML = "";
                    }
                    // responseJson.tracks.items.forEach(element => {
                    //     document.querySelector(".results").innerHTML += `
                    //         <div>
                    //             <p>
                    //                 Title: ${element.name}
                    //             </p>
                    //             <hr>
                    //         </div>
                    //     `;
                    // });


                    // const songMenu=document.createElement("form");
                    // songMenu.classList.add("songForm");
                    const formGroup = document.createElement("div");
                    formGroup.classList.add("form-group");
                    formGroup.classList.add("songForm");
                    const labelForm = document.createElement("label");
                    labelForm.setAttribute("for","controlSelect");
                    labelForm.innerHTML="Choose the song you are looking for";
                    formGroup.appendChild(labelForm);
                    const selectGroup = document.createElement("select");
                    selectGroup.classList.add("form-control");
                    selectGroup.id="controlSelect";
                    formGroup.appendChild(selectGroup);

                    if (responseJson.tracks) {
                        responseJson.tracks.items.forEach(element => {
                            const optionGroup = document.createElement("option");
                            optionGroup.innerHTML = element.name + "          |            " + element.artists[0].name;
                            selectGroup.appendChild(optionGroup);
                        });
                    }

                    const subButton = document.createElement("button");
                    subButton.setAttribute("type","button");
                    subButton.classList.add("btn");
                    subButton.classList.add("btn-primary");
                    subButton.innerHTML="This is the song";
                    subButton.classList.add("greenC");
                    subButton.classList.add("letterStyle");

                    // songMenu.appendChild(formGroup);
                    subButton.setAttribute("onclick","searchSong(window.value)");
                    formGroup.appendChild(subButton);
                    if (results) {
                        results.appendChild(formGroup);
                    }
                    const songForm = document.querySelector(".songForm");
                    const controlSelect = <HTMLSelectElement> document.getElementById("controlSelect");
                    if (controlSelect) {
                        const selectedIndex = controlSelect.selectedIndex;
                    }
                    // SongForm.addEventListener( 'submit' , ( event ) => {
                    //     event.preventDefault();
                    //     var songId = responseJson.tracks.items[selectedIndex].uri;
                    //     var newsongId = songId.replace('spotify:track:','');
                    //     console.log(newsongId);
                    //     results.innerHTML+= `
                    //     <iframe src="https://open.spotify.com/embed/track/${newsongId}" width="300" height="80" frameborder="0"
                    // allowtransparency="true" allow="encrypted-media"></iframe>
                    //     `;
                        
                    // });
                    })
                    .catch(err => {
                        throw new Error(err.message);
                    })
        })
        .catch(err => {
            const results = document.querySelector('.results');
            if (results) {
                results.innerHTML = `<div> ${err.message} </div>`;
            }
        });
    
}

function searchSong(responseJson: SearchContent){
    let SongForm = document.querySelector( '.songForm' );
    const controlSelect = <HTMLSelectElement> document.getElementById("controlSelect");
    if (controlSelect) {
        const selectedIndex = controlSelect.selectedIndex;
        if (responseJson.tracks) {
            let songId = responseJson.tracks.items[selectedIndex].uri;
            let newsongId = songId.replace('spotify:track:','');
            console.log(newsongId);
            let results = document.querySelector('.results');
            if (results) {
                results.innerHTML = "";
                results.innerHTML+= `
                <iframe src="https://open.spotify.com/embed/track/${newsongId}" width="300" height="80" frameborder="0"
            allowtransparency="true" allow="encrypted-media"></iframe>
                `;
            }
            const descEl = <HTMLInputElement> document.getElementById('Description');
            if (descEl) {
                let description = descEl.value;
                addPostFetch(newsongId, description);
            }
        }
    }
}

function watchPostForm(){
    let postForm = document.querySelector('.Post-form');

    if (postForm) {
        postForm.addEventListener( 'submit' , ( event ) => {
            event.preventDefault();
            const descEl = <HTMLInputElement> document.getElementById('Description');
            const titleEl = <HTMLInputElement> document.getElementById('Title');
            const description = descEl.value;
            const title = titleEl.value;
            fetchSong(title);
        })
    }
}




function addPostFetch(songId: string, description: string){
    const data = {
        song : songId,
        description: description,
        username : localStorage.getItem("userName")
    }

    const settings = {
        method : 'POST',
        headers : {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify( data )
    }

    const results = document.querySelector('.results');

    if (results) {
        results.innerHTML = "";
        fetch( "/posts", settings )
            .then( response => {
                if( response.ok ){
                    return response.json();
                }
                throw new Error( response.statusText );
            })
            .then( responseJSON => {
                console.log(responseJSON);
                window.location.href = "/";
            })
            .catch( err => {
                results.innerHTML = `<div> ${err.message} </div>`;
            });
    }
}

function init(){
    watchPostForm();
    // if (localStorage.getItem("userName") === "admin") {
    //     window.location.href = "/";
    // }
}

init();