import { type LoaderFunctionArgs, json } from '@remix-run/cloudflare'
import { ClientOnly } from 'remix-utils/client-only'
import { useLoaderData } from '@remix-run/react'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import { createServices } from "~/lib/services.server";
import Socket from '~/components/socket'

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { 
    db,
    auth: { authenticator } 
  } = createServices(context)
  const sessionUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/auth/login'
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

export function SocketRoute() {
  return (
    <div>
      <ClientOnly>
        {() => <Socket />}
      </ClientOnly>
    </div>
  )
}

export default function Route() {
  const { dehydratedState } = useLoaderData<typeof loader>()

  return (
    <HydrationBoundary
      state={dehydratedState}
    >
      <SocketRoute />
    </HydrationBoundary>
  )
}
