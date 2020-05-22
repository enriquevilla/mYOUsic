function userLoginFetch( userName, password ){
    let url = '/login';

    let data = {
        userName,
        password
    }

    let settings = {
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify( data )
    }

    let results = document.querySelector( '.results' );

    fetch( url, settings )
        .then( response => {
            if( response.ok ){
                return response.json();
            }
            throw new Error( response.statusText );
        })
        .then( responseJSON => {
            console.log( responseJSON );
            localStorage.setItem('token',responseJSON.token);
            window.location.href="/";
        })
        .catch( err => {
            results.innerHTML = `<div> ${err.message} </div>`;
        });
}

function watchLoginForm(){
    let loginForm = document.querySelector( '.login-form' );

    loginForm.addEventListener( 'submit' , ( event ) => {
        event.preventDefault();
        let userName = document.getElementById( 'userName' ).value;
        let password = document.getElementById( 'userPassword' ).value;

        userLoginFetch( userName, password );
    })
}

function init(){
    watchLoginForm();
}

init();