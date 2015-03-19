exports.connection = function (socket) {
  socket.emit('yay', { hello: 'world' })
  socket.on('my other event', function (data) {
    console.log(data)
  })
}