import { type ActionFunctionArgs } from '@remix-run/cloudflare'
import { redirectBack } from 'remix-utils/redirect-back'
import { themeCookie } from '~/lib/theme.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData()
  const theme = form.get('theme')

  return redirectBack(request, {
    fallback: '/',
    headers: {
      'Set-Cookie': await themeCookie.serialize(theme)
    }
  })
}
