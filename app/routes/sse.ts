import { eventStream } from 'remix-utils/sse/server'
import { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { interval } from 'remix-utils/timers'
import { events } from '~/lib/events.server'

function json(data: unknown) {
  return JSON.stringify(data)
}

export async function loader({ request, context }: LoaderFunctionArgs) {

  context.cloudflare.env

  return eventStream(request.signal, function setup(send) {
    async function run() {
      for await (const _ of interval(1000, { signal: request.signal })) {
        send({ event: 'time', data: new Date().toISOString() })
      }
    }

    run()

    events.on('message-insert', (payload) => {
      send({ event: 'message-insert', data: json(payload) })
    })

    events.on('message-delete', (payload) => {
      send({ event: 'message-delete', data: json(payload) })
    })

    return () => {}
  })

}
