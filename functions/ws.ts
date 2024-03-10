export const onRequest = async ({ request }: { request: Request }) => {
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
    if (evt.data === 'ping') {
      server.send('pong')
    }
  })

  setInterval(() => {
    server.send(Date.now().toString())
  }, 1000)

  return new Response(null, {
    status: 101,
    webSocket: client,
  })
}
