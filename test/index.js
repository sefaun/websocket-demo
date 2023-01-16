const net = require("net")
const { WebSocketServer } = require("../build/index")

const my_ws = new WebSocketServer()
const server = net.createServer(my_ws.serverHandler)

server.listen(5000, () => console.log("WebSocketServer is Running on Port 5000"))