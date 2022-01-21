const miForm = document.querySelector('form');
const url = (window.location.hostname.includes('localhost'))
        ? 'http://localhost:8080/api/auth/'
        : 'https://rest-server-node-sv.herokuapp.com/api/auth';
        
miForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = {};

    for(let el of miForm.elements){
        if(el.name.length > 0){
            formData[el.name] = el.value;
        }
    }

    fetch(url + 'login',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(resp => resp.json())
    .then( ({msg, token}) => {
        if(msg){
            return console.error(msg);
        }
        localStorage.setItem('token', token);
        window.location = 'chat.html';
    }).catch(err => {
        console.log(err);
    });
});

function handleCredentialResponse(response) {
    const body = {id_token: response.credential};

    fetch(url + 'google',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then(resp => resp.json())
    .then( ({token}) => {
        //console.log(token);
        localStorage.setItem('token', token);
        window.location = 'chat.html';
    }).catch(err => {
        console.log(err);
    });

}

const btn = document.getElementById('google_singout');

btn.onclick = () => {
    //console.log(google.accounts.id);
    google.accounts.id.disableAutoSelect();

    google.accounts.id.revoke(localStorage.getItem('correo'), done => {
        localStorage.clear();
        location.reload();
    });
};
