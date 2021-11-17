const net = require('net');
var crypto = require('crypto')

const server = new net.Server()
var key = ""

server.on('connection', (socket) => {
  console.log(socket.remoteAddress, socket.remoteFamily, socket.remotePort)

  socket.on('ready', () => {
    console.log("ready")
  })

  socket.on('data', (data) => {

    if (data.toString().indexOf('Sec-WebSocket-Key: ') != -1) {
      const secret_key = data.toString().substring(data.toString().indexOf('Sec-WebSocket-Key: ') + 19, data.toString().indexOf('Sec-WebSocket-Key: ') + 43)
      key = crypto.createHash("sha1").update(`${secret_key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`, "binary").digest("base64")
      console.log("sefakeyyy", key)
    }

    socket.write('HTTP/1.1 101 Switching Protocols\r\n')
    socket.write('Upgrade: websocket\r\n')
    socket.write('Connection: upgrade\r\n')
    socket.write(`Sec-WebSocket-Accept: ${key}\r\n\r\n`)

  })

  socket.on('close', (hadError) => {
    console.log(hadError)
  })

  socket.on('end', () => {
    console.log("client get out !")
  })


  socket.on('error', (err) => {
    console.log(err)
  })

})

server.listen(5000, () => {
  console.log("WebSocket Server is Running !")
})