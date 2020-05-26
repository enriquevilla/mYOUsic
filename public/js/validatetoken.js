let url = '/validate-token';
let settings = {
    method: 'GET',
    headers: {
        sessiontoken : localStorage.getItem('token')
    }
}

fetch( url, settings )
    .then( response => {
        if( response.ok ){
            return response.json();
        }
        throw new Error( response.statusText );
    })
    .then( responseJSON => {
        localStorage.setItem("userName",`${responseJSON.userName}`);
        console.log( responseJSON );
    })
    .catch( err => {
        console.log(err);
        window.location.href="/login";
    });