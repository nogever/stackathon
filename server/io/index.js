'use strict';
var socketio = require('socket.io');
var io = null;

module.exports = function (server) {

    if (io) return io;

    io = socketio(server);

    io.on('connection', function (socket) {

        console.log('Now have access to socket, wowzers!');
        var room;
        socket.on('createNote', function(data) {
            room = data.board;
            socket.join(room);
            // console.log('room???', room);
            socket.broadcast.to(room).emit('onNoteCreated', data);
        });

        socket.on('updateNote', function(data) {
            socket.broadcast.to(room).emit('onNoteUpdated', data);
        });

        socket.on('moveNote', function(data){
            socket.broadcast.to(room).emit('onNoteMoved', data);
        });

        socket.on('deleteNote', function(data){
            socket.broadcast.to(room).emit('onNoteDeleted', data);
        });


    });


    return io;


    // if (io) return io;

    // io = socketio(server);

    // io.on('connection', function (socket) {
    //     console.log('Now have access to socket, wowzers!');
        
    //     socket.on('createNote', function(data) {
    //         socket.broadcast.emit('onNoteCreated', data);
    //     });

    //     socket.on('updateNote', function(data) {
    //         socket.broadcast.emit('onNoteUpdated', data);
    //     });

    //     socket.on('moveNote', function(data){
    //         socket.broadcast.emit('onNoteMoved', data);
    //     });

    //     socket.on('deleteNote', function(data){
    //         socket.broadcast.emit('onNoteDeleted', data);
    //     });
    // });

    // return io;

};
