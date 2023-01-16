import crypto from 'crypto'
import { Socket } from 'net'

import { WebSocketServer } from '../index'
import { Request, ServerOptions } from './types'
import { get_method, sec_websocket_key, seperators, ws_public_key } from './enums'


export class Client {

  private request = {
    method: "",
    path: "",
    protocol_version: "",
    header: "",
    header_datas: []
  } as Request
  private hand_shake_status = false

  constructor(private that: WebSocketServer, private client: Socket, private options: ServerOptions) {
    this.createClient()
  }

  private createClient(): void {
    var request_data: string = ""
    var request_header_flag: boolean = false

    this.client.on("error", (_err: Error) => this.that.deleteClientClass(this.options.client_id))
    this.client.on("end", () => this.that.deleteClientClass(this.options.client_id))
    this.client.on('data', (data: Buffer) => {
      if (this.hand_shake_status === false) {
        request_data += data.toString()

        if (request_header_flag === true && request_data === "") {
          this.clientEnd()
        }

        //For Header
        if (request_data.split(seperators.MULTI_COMMAND_SEPERATOR)[1] === '' && request_header_flag === false) {
          request_header_flag = true
          this.request.header = request_data.split(seperators.MULTI_COMMAND_SEPERATOR)[0]
          this.fetchRequestHeader()
          this.serverJobs()
        }
      } else {
        //Other Messages after handshake
        console.log(data)
      }
    })
  }

  private serverJobs(): void {
    this.sendHandShakeResponse()
  }

  private sendHandShakeResponse() {
    if (this.request.header.indexOf(sec_websocket_key) !== -1) {
      let secret_key = ''
      for (const item of this.request.header_datas) {
        if (item.hasOwnProperty(sec_websocket_key)) {
          secret_key = item[sec_websocket_key]
          break
        }
      }

      if (!secret_key) {
        this.clientEnd()
      }

      const key = crypto.createHash("sha1").update(`${secret_key}${ws_public_key}`, "binary").digest("base64")

      this.socketWrite(`HTTP/1.1 101 Switching Protocols\r\nX-Powered: SEFAUN\r\nUpgrade: websocket\r\nConnection: upgrade\r\nSec-WebSocket-Accept: ${key}\r\n\r\n`)

      this.hand_shake_status = true
      //Send Test Hello Message To Client
      this.socketWrite(Buffer.from([0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f]))
    } else {
      this.clientEnd()
    }
  }

  private fetchRequestHeader(): void {
    const header_items = this.request.header.split(seperators.COMMAND_SEPERATOR)

    for (let i = 0; i < header_items.length; i++) {
      if (i === 0) {
        this.fetchRequestMethod(header_items[i])
        this.fetchRequestPath(header_items[i])
        this.fetchRequestProtocolVersion(header_items[i])
        continue
      }

      const key_value = header_items[i].split(':')
      this.request.header_datas.push({ [key_value[0]]: key_value[1].trim() })
    }
  }

  private fetchRequestMethod(data: string): void {
    this.checkMethod(data.split(' ')[0])
  }

  private fetchRequestPath(data: string): void {
    this.request.path = data.split(' ')[1]
  }

  private fetchRequestProtocolVersion(data: string): void {
    this.request.protocol_version = data.split(' ')[2]
  }

  private checkMethod(method: string): void {
    if (method !== get_method) {
      this.clientEnd()
    }
  }

  private socketWrite(data: string | Buffer) {
    this.client.write(data)
  }

  private clientEnd(): void {
    //End Client
    this.client.end()
    //Clear Class
    this.that.deleteClientClass(this.options.client_id)
  }

}