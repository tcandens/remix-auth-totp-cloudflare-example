import { useEventSource } from 'remix-utils/sse/react'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { createServices } from "~/lib/services.server";
import { useEffect } from 'react'
import { messages } from '~/lib/db/schema'
import { events } from '~/lib/events.server'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import { 
  type LoaderFunctionArgs, 
  type ActionFunctionArgs,
  json 
} from '@remix-run/cloudflare'
import { eq } from 'drizzle-orm';


export async function action({ request, context }: ActionFunctionArgs) {

  const { db, auth: { authenticator }} = createServices(context)
  const sessionUser = await authenticator.isAuthenticated(request)

  console.log('method', request.method)

  switch (request.method.toLowerCase()) {
    case 'post': {
      const formdata = await request.formData()
      const data = Object.fromEntries(formdata)
      const inserted = await db
        .insert(messages)
        .values({
          content: data.content,
          agent: sessionUser.id,
        })
        .returning()

      await events.emit('message-insert', inserted)
      return json({ inserted })
    }
    case 'delete': {
      const formdata = await request.formData()
      const data = Object.fromEntries(formdata)
      await db.delete(messages).where(eq(messages.id, data.id))
      await events.emit('message-delete', { id: data.id })
      return json({ deleted: true })
    }
  }

}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { 
    db,
    auth: { authenticator } 
  } = createServices(context)
  const sessionUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login'
  })

  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['messages'],
    queryFn: () => {
      return db.query.messages.findMany()
    }
  })

  return json({
    sessionId: sessionUser.id,
    dehydratedState: dehydrate(queryClient)
  })
}

export function Counter({ sessionId }: { sessionId: number }) {
  const time = useEventSource('/sse', { event: 'time' })
  const fetcher = useFetcher({ key: 'messages' })
  const queryClient = useQueryClient()
  const { data: messages } = useQuery({
    queryKey: ['messages'],
    queryFn: () => {
      fetcher.load('/messages')
      console.log(fetcher.data)
      return fetcher.data
    }
  })

  useEffect(() => {

    const eventSource = new EventSource('/sse')

    eventSource.addEventListener('message-insert', (e) => {
      try {
        const parsed = JSON.parse(e.data)
        queryClient.setQueryData(['messages'], (old) => {
          return [...old, ...parsed]
        })
      } catch (err) {
        console.warn(err)
      }
    })

    eventSource.addEventListener('message-delete', (e) => {
      try {
        const parsed = JSON.parse(e.data)
        queryClient.setQueryData(['messages'], (old) => {
          return old.filter((m) => m.id !== parsed.id)
        })
      } catch (err) {
        console.warn(err)
      }
    })

    return () => {
      eventSource.close()
    }
  }, [])

  return (
    <div className="flex flex-col gap-2 p-3">
      <time dateTime={time ?? null}>
        {time ? new Date(time).toLocaleTimeString('en', {
          minute: '2-digit',
          second: '2-digit',
          hour: 'numeric',
        }) : '00:00:00'}
      </time>
      <fetcher.Form method="post">
        <input placeholder="message" type="text" name="content" />
        <input type="hidden" name="agent" value={sessionId} />
        <button type="submit">Send</button>
      </fetcher.Form>

      <ul>
        {messages.length && messages.map((m) => (
          <li 
            key={m.id}
            className="flex flex-row justify-between"
          >
            <span>
              {m.content}
            </span>

            <fetcher.Form 
              method="delete"
            >
              <input type="hidden" name="id" value={m.id} />
              <button
                type="submit"
              >
                X
              </button>
            </fetcher.Form>
          </li>
        ))}
      </ul>

    </div>
  )
}

export default function CounterRoute() {
  const { dehydratedState, sessionId } = useLoaderData<typeof loader>()
  return (
    <HydrationBoundary
      state={dehydratedState}
    >
      <Counter sessionId={sessionId} />
    </HydrationBoundary>
  )
}
