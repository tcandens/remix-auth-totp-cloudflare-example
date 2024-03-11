let socket: WebSocket

export const endpoint = '/socket'

export function getSocket() {
  if (!socket) {
    const url = new URL(endpoint, window.location.href)
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    socket = new WebSocket(url.toString())
  }

  return socket
}
