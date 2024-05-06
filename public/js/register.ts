function userRegisterFetch(userName: string, password: string) {
    const url = '/register';

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

    const results = document.querySelector( '.results' );
    console.log(data);
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
            if (results) {
                results.innerHTML = `<div> ${err.message} </div>`;
            }
        });
}



function watchRegisterForm(){
    let registerForm = document.querySelector( '.register-form' );

    if (registerForm) {
        registerForm.addEventListener( 'submit' , ( event ) => {
            event.preventDefault();
            const usernameField = <HTMLInputElement> document.getElementById('userName');
            const username = usernameField.value;
            if (/^[a-z]+$/.test(username)) {
                const passwordField = <HTMLInputElement> document.getElementById('userPassword');
                const password = passwordField.value;
                userRegisterFetch( username, password );
            } else {
                const results = document.querySelector('.results');
                if (results) {
                    results.innerHTML = `
                        <div>
                            Usernames can only contain lowercase letters
                        </div>
                    `;
                }
            }
        })
    }

}

function init(){
    watchRegisterForm();
}

init();