const url = (window.location.hostname.includes('localhost'))
        ? 'http://localhost:8080/api/auth/'
        : 'https://rest-server-node-sv.herokuapp.com/api/auth';

let usuarios = null;
let socket = null;
//Referencias HTML elements
const txtUid     = document.querySelector('#txtUid');
const txtMensaje = document.querySelector('#txtMensaje');
const ulUsuarios = document.querySelector('#ulUsuarios');
const ulMensajes = document.querySelector('#ulMensajes');
const btnSalir   = document.querySelector('#btnSalir');


//Validar el token que esta almacenado en el localStorage
const validarJWT = async () => {
    const token = localStorage.getItem('token') || '';
    if (token.length <= 10) {
        window.location = 'index.html';
        throw new Error('No hay token en el localStorage');
    }

    const resp = await fetch(url, { 
        headers: {'x-token': token}
    });

    const {usuario: userDB, token: tokenDB} = await resp.json();
    //console.log(userDB, tokenDB);
    localStorage.setItem('token', tokenDB);
    usuario = userDB;
    document.title = usuario.nombre;
    
    await conectarSocket();
}

const conectarSocket = async () => {
    socket = io({
        'extraHeaders': {
            'x-token': localStorage.getItem('token')
        }
    });

    socket.on('connect', () => {
        //console.log('Sockets online');
    });

    socket.on('disconnect', () => {
        //console.log('Sockets offline');
    });    

    socket.on('recibir-mensajes', dibujarMensajes );
    socket.on('usuarios-activos', dibujarUsuarios );
    socket.on('mensaje-privado', ( payload ) => {
        console.log('Privado:', payload )
    });;      
}

const dibujarUsuarios = (usuarios = []) => {
    let userHTML = '';
    usuarios.forEach(({nombre, uid}) => {
        userHTML += `
            <li>
                <p>
                    <h5 class="text-success">${nombre}</h5>
                    <span class="fs-6 text-muted">${uid}</span>
                </p>
            </li>
        `;
    });
    ulUsuarios.innerHTML = userHTML;
}

const dibujarMensajes = (mensajes = []) => {
    let smsHTML = '';
    mensajes.forEach(({nombre, mensaje}) => {
        smsHTML += `
            <li>
                <p>
                    <span class="text-primary">${nombre}:</span>
                    <span>${mensaje}</span>
                </p>
            </li>
        `;
    });
    ulMensajes.innerHTML = smsHTML;
}

txtMensaje.addEventListener('keyup', ({keyCode})=>{
    const uid = txtUid.value;
    const data = txtMensaje.value;
    const mensaje = data.trim();

    if(keyCode !== 13){ return; }
    if(mensaje.length === 0){ return; }

    socket.emit('enviar-mensaje', { uid, mensaje});    
    txtMensaje.value = '';
    
});

btnSalir.addEventListener('click', ()=> {

    localStorage.removeItem('token');

    /*const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then( () => {
        console.log('User signed out.');
        window.location = 'index.html';
    });*/
    window.location = 'index.html';
});

const main = async() => {
    // Validar JWT
    await validarJWT();
}

/*(()=>{
    gapi.load('auth2', () => {
        gapi.auth2.init();
        main();
    });
})();*/

main();

  