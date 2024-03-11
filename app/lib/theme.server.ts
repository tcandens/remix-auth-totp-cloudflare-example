import { createCookie } from '@remix-run/cloudflare'

export const themeCookie = createCookie('theme', {
  httpOnly: true,
})

export async function getThemeFromCookies(request: Request) {
  const theme = await themeCookie.parse(request.headers.get('Cookie'))

  return theme || 'system'
}
