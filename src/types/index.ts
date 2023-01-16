export type ServerOptions = {
  client_id: string
}

export type Request = {
  method: string
  path: string
  protocol_version: string
  header: string
  header_datas: Record<string, string>[]
}