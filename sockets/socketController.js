const { comprobarJWT } = require('../helpers');
const { ChatMensajes } = require('../models');

const chatMensajes = new ChatMensajes();

const socketController = async (socket, io) => {
     
    const user = await comprobarJWT(socket.handshake.headers['x-token']);
    if(!user){
        return socket.disconnect();
    }
    //Agregar usuario al Array
    chatMensajes.conectarUsuario(user);
    io.emit('usuarios-activos', chatMensajes.usuariosArr);
    socket.emit('recibir-mensajes', chatMensajes.ultimos10);

    //Conectarlo a una sala especial
    socket.join(user.id);


    //Limpiar lista de Usuarios Conectados.
    socket.on('disconnect', () => {
        chatMensajes.desconectarUsuario(user.id);
        io.emit('usuarios-activos', chatMensajes.usuariosArr);
    });

    //Recibir mensaje
    socket.on('enviar-mensaje', ({uid, mensaje }) => {     
        
        if(uid){
            socket.to(uid).emit('mensaje-privado', {de: user.nombre, mensaje});
        }else{
            chatMensajes.enviarMensaje(user.id, user.nombre, mensaje);
            io.emit('recibir-mensajes', chatMensajes.ultimos10);
        }
    });

}

module.exports = {
    socketController
}