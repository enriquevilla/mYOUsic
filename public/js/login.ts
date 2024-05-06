function userLoginFetch(userName: string, password: string) {
    const url = '/login';

    const data = {
        userName,
        password
    }

    const settings = {
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify( data )
    }

    const results = document.querySelector('.results');

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
            if (results) {
                results.innerHTML = `<div> ${err.message} </div>`;
            }
        });
}

function watchLoginForm(){
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        loginForm.addEventListener( 'submit' , ( event ) => {
            event.preventDefault();
            const usernameField = <HTMLInputElement> document.querySelector('#userName');
            const passwordField = <HTMLInputElement> document.querySelector('#userPassword');
            const username = usernameField.value;
            const password = passwordField.value;
    
            userLoginFetch(username, password);
        })
    }
}

function init(){
    watchLoginForm();
}

init();