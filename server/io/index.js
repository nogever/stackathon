'use strict';
var socketio = require('socket.io');
var io = null;

module.exports = function (server) {

    if (io) return io;

    io = socketio(server);

    io.on('connection', function (socket) {

        console.log('Now have access to socket, wowzers!');
        var room;
        socket.on('joinRoom', function(board) {
            room = board._id;
            socket.join(room);
            console.log('room???', room);
            console.log('socket rooms???', socket.rooms);
        });
        
        socket.on('createNote', function(data) {
            // room = data.board;
            // console.log('room???', room);
            // socket.join(room);
            console.log('rooms in socket???', socket.rooms);
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

        socket.on('changeBoardBg', function(data){
            socket.broadcast.to(room).emit('onChangeBoardBg', data);
        });
        
        socket.on('changeBoardGrid', function(data){
            socket.broadcast.to(room).emit('onChangeBoardGrid', data);
        });
        
        socket.on('removeBoardGrid', function(data){
            socket.broadcast.to(room).emit('onRemoveBoardGrid', data);
        });

        socket.on('upvoteNote', function(data){
            socket.broadcast.to(room).emit('onUpvoteNote', data);
        });

        socket.on('downvoteNote', function(data){
            socket.broadcast.to(room).emit('onDownvoteNote', data);
        });
        
        socket.on('updateNoteColor', function(data){
            socket.broadcast.to(room).emit('onUpdateNoteColor', data);
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
