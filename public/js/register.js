function userRegisterFetch( userName, password ){
    let url = '/register';

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
            } else{
                throw new Error( response.statusText );
            }
        })
        .then( responseJSON => {
            console.log( responseJSON );
            window.location.href="/login";
        })
        .catch( err => {
            results.innerHTML = `<div> ${err.message} </div>`;
        });
}



function watchRegisterForm(){
    let registerForm = document.querySelector( '.register-form' );

    registerForm.addEventListener( 'submit' , ( event ) => {
        event.preventDefault();
        let userName = document.getElementById( 'userName' ).value;
        let password = document.getElementById( 'userPassword' ).value;

        userRegisterFetch( userName, password );
    })
}

function init(){
    watchRegisterForm();
}

init();