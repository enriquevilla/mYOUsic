function fetchSong(title){
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
            let results = document.querySelector('.results');
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
                .then( responseJson => {
                    window.value=responseJson;  
                    results.innerHTML = "";
                    document.querySelector(".results").innerHTML = "";
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

                    responseJson.tracks.items.forEach(element => {
                        const optionGroup = document.createElement("option");
                        optionGroup.innerHTML=element.name +"          |            " +element.artists[0].name;
                        selectGroup.appendChild(optionGroup);
                    });

                    const subButton = document.createElement("button");
                    subButton.setAttribute("type","button");
                    subButton.classList.add("btn");
                    subButton.classList.add("btn-primary");
                    subButton.innerHTML="This is the song";
                    // songMenu.appendChild(formGroup);
                    subButton.setAttribute("onclick","searchSong(window.value)");
                    formGroup.appendChild(subButton);
                    document.querySelector(".results").appendChild(formGroup);
                    let SongForm = document.querySelector( '.songForm' );
                    let selectedIndex = document.getElementById("controlSelect").selectedIndex;
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
        .catch( err => {
            results.innerHTML = `<div> ${err.message} </div>`;
        });
    
}

function searchSong(responseJson){
    let SongForm = document.querySelector( '.songForm' );
    let selectedIndex = document.getElementById("controlSelect").selectedIndex;
    var songId = responseJson.tracks.items[selectedIndex].uri;
    var newsongId = songId.replace('spotify:track:','');
    console.log(newsongId);
    let results = document.querySelector( '.results' );
    results.innerHTML = "";
    results.innerHTML+= `
    <iframe src="https://open.spotify.com/embed/track/${newsongId}" width="300" height="80" frameborder="0"
allowtransparency="true" allow="encrypted-media"></iframe>
    `;
    let description = document.getElementById( 'Description' ).value;
    addpostFech(newsongId,description);
}

function watchPostForm(){
    let PostForm = document.querySelector( '.Post-form' );

    PostForm.addEventListener( 'submit' , ( event ) => {
        console.log("hola2");
        event.preventDefault();
        console.log("hola2");
        let description = document.getElementById( 'Description' ).value;
        let title = document.getElementById( 'Title' ).value;

        fetchSong(title);
    })
}




function addpostFech( songId, description){

    let data = {
        song : songId,
        description: description,
        username : localStorage.getItem("userName")
    }

    let settings = {
        method : 'POST',
        headers : {
            Authorization : `Bearer BQA8sd__b56x1llRaxYdgW51jj-nzfu_QmFhMyxjv2zgEaj1aLDSK7BC_CG6vXnFPNt-u0pPNuREplzBbZM`,
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify( data )
    }

    let results = document.querySelector( '.results' );
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
        })
        .catch( err => {
            results.innerHTML = `<div> ${err.message} </div>`;
        });
}

function init(){
    watchPostForm();
}

init();