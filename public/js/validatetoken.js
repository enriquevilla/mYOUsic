let url = '/validate-token';
let settings = {
    method: 'GET',
    headers: {
        sessiontoken : localStorage.getItem('token')
    }
}

fetch( url, settings )
    .then( response => {
        if ( response.ok ){
            return response.json();
        }
        throw new Error( response.statusText );
    })
    .then(responseJSON => {
        localStorage.setItem("userName",`${responseJSON.userName}`);
        // const username = localStorage.getItem("userName");
        // if (username !== "admin") {
        //     addButton = document.querySelector("body > a");
        //     addButton.setAttribute("style", "display: initial");
        // }
    })
    .catch( err => {
        window.location.href="/login";
    });