import { type ActionFunctionArgs, json, redirect } from '@remix-run/cloudflare'
import { createServices } from "~/lib/services.server";
import { members, invites, insertInviteSchema, users, committees } from '~/lib/db/schema'
import { and, eq } from 'drizzle-orm';
import invariant from 'tiny-invariant'
import { z } from 'zod'

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const {
    db,
    auth: { authenticator },
  } = createServices(context)

  const sessionUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/auth/login',
  })

  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  const input = insertInviteSchema.extend({
    redirectTo: z.string(),
    committeeId: z.string(),
    fromMemberId: z.coerce.number(),
  }).parse(data)


  const member = await db.query.members.findFirst({
    where: eq(members.id, input.fromMemberId)
  })
    .execute()

  invariant(member?.userId === sessionUser.id, 'Not a member')

  await db.insert(invites)
    .values({
      fromMemberId: input.fromMemberId,
      invitingEmail: input.invitingEmail,
    })
    .execute()

  return redirect(input.redirectTo)
}
