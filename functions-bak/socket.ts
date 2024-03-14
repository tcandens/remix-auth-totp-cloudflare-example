import { type PagesFunction } from '@cloudflare/workers-types'

export const onRequest: PagesFunction = async ({ request }) => {
  const upgradeHeader = request.headers.get('Upgrade')

  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return new Response(null, {
      status: 400,
      statusText: 'Bad Request',
    })
  }

  const wsPair = new WebSocketPair()
  const [client, server] = Object.values(wsPair)

  server.accept()
  server.addEventListener('message', (evt) => {

    try {
      const data = JSON.parse(evt.data)
      switch (data.type) {
        case 'ping':
          server.send(JSON.stringify({ type: 'pong' }))
          break;
        default:
          console.log('unknown event', data)
      }
    } catch (e) {
      console.error(e)
    }

  })

  setInterval(() => {
    const event = {
      type: 'time',
      payload: Date.now().toString()
    }
    server.send(JSON.stringify(event))
  }, 1000)

  return new Response(null, {
    status: 101,
    webSocket: client,
  })
}
