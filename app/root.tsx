import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type LoaderFunctionArgs, type MetaFunction, json } from '@remix-run/cloudflare'
import { Toaster } from '~/components/ui/sonner'
import { useState, useMemo } from 'react'
import { Nav } from '~/components/nav'
import { createServices } from '~/lib/services.server'
import { getThemeFromCookies } from '~/lib/theme.server'
import "./root.css";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { 
    auth: { authenticator } 
  } = createServices(context)

  const sessionUser = await authenticator.isAuthenticated(request)

  const theme = await getThemeFromCookies(request)

  return json({
    sessionUser,
    theme,
  })
}

export const meta: MetaFunction = () => ([
  { title: 'Remix Auth TOTP Cloudflare Example' }
])

export default function App() {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000
        }
      }
    })
  )

  const { theme, sessionUser } = useLoaderData<typeof loader>()

  const htmlProps = useMemo(() => {
    return {
      'data-theme': theme === 'system' ? undefined : theme
    }
  }, [theme])

  return (
    <html lang="en" {...htmlProps}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <div className="w-full min-h-[100vh] grid grid-rows-[auto_80px]">
            <Outlet />
            <Nav 
              isAuthenticated={!!sessionUser} 
              currentTheme={theme}
            />
          </div>
        </QueryClientProvider>
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
