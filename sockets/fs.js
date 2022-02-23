const socketIO = require('socket.io')
const io = socketIO()
const navfs = require('../models/navegadorfsModel')

io.of('/fs').on( "connection", function( socket ) {
    console.log( "A user connected");

    socket.on('mensaje', function (data) {
        socket.emit('mensaje', data);
    })

    socket.on('sizeDirectory', function (data) {
        let resDir = {}
        function modificacion(data) {
            current = data
        }

        new Promise(function (resolve, reject) {
            resDir = navfs.sizeSubDirectory(data.directory, function(data) {
                console.log(data.current.directory)
//                modificacion(data.current.directory)
//                setImmediate(socket.emit('sizeDirectory-current', data.current.directory))
            }, 500)
            resolve()
        }).then(function() {
            socket.emit('sizeDirectory-end', resDir.sum)
        })
    })

    let current = ''
    socket.on('sizeDirectory-current', function () {
        socket.emit('sizeDirectory-current', current)
    })
})

module.exports = io
