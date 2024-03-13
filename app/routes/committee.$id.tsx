import { Suspense } from 'react'
import { useLoaderData, Await, useSearchParams, Form } from '@remix-run/react'
import { createServices } from '~/lib/services.server'
import { Skeleton } from '~/components/ui/skeleton'
import { Sheet, SheetTitle, SheetClose, SheetContent } from '~/components/ui/sheet'
import { H1 } from '~/components/typography'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import invariant from 'tiny-invariant'
import { committees, invites, members, users } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { 
  type LoaderFunctionArgs, 
  defer, 
} from '@remix-run/cloudflare'

export const loader = async ({ request, context, params }: LoaderFunctionArgs) => {
  invariant(params.id, 'id not found')

  const {
    db,
    auth: { authenticator }
  } = createServices(context)

  const sessionUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/auth/login'
  })

  const committee = await db.query.committees.findFirst({
    where: eq(committees.id, params.id)
  }).execute()

  const sessionMember = await db.query.members.findFirst({
    where: eq(members.userId, sessionUser.id)
  })

  invariant(committee, 'Committee not found')
  invariant(sessionMember, 'Not a member')

  const membersPromise = db.select({
    id: members.id,
    userId: members.userId,
    role: members.role,
    email: users.email,
  })
    .from(members)
    .where(eq(members.committeeId, params.id))
    .leftJoin(users, eq(members.userId, users.id))
    .execute()

  const invitesPromise = db.select({
    email: invites.invitingEmail,
    id: invites.id
  })
    .from(members)
    .rightJoin(invites, eq(invites.fromMemberId, members.id))
    .where(eq(members.committeeId, params.id))
    .execute()

  return defer({
    committee,
    member: sessionMember,
    members: membersPromise,
    invites: invitesPromise,
  })
}

export default function CommitteeView() {
  const { committee, member, members, invites } = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const invitingParam = searchParams.get('invite')
  const isInviting = invitingParam === 'true' || invitingParam === '1'

  return (
    <div className="p-3 flex flex-col gap-3">
      <H1>{committee.name}</H1>
      <Suspense fallback={<Skeleton className="w-full h-4" />}>
        <Await resolve={members}>
          {(members) => (
            <ul className="flex flex-col gap-3">
              {members.map(member => (
                <li key={member.id}>
                  {member.email}
                </li>
              ))}
            </ul>
          )}
        </Await>
      </Suspense>
      <Suspense fallback={<Skeleton className="w-full h-4" />} >
        <span>Invites</span>
        <Await resolve={invites}>
          {(invites) => (
            <ul className="flex flex-col gap-3">
              {invites.map(invite => (
                <li key={invite.id}>
                  {invite.email}
                </li>
              ))}

            </ul>
          )}
        </Await>
      </Suspense>
      <div className="flex flex-col gap-3">

        <Sheet open={isInviting} onOpenChange={open => {
          if (!open) {
            setSearchParams({})
          }
        }}>
          <Button
            onClick={() => {
              setSearchParams({ invite: 'true' })
            }}
          >
            Invite
          </Button>

          <SheetContent side="right">
            <SheetTitle>Invite</SheetTitle>
            <SheetClose />

            <Form 
              method="POST" 
              className="flex flex-col gap-3"
              action="/invite"
            >
              <input type="hidden" name="committeeId" value={committee.id} />
              <input type="hidden" name="fromMemberId" value={member?.id} />
              <input type="hidden" name="redirectTo" value={`/committee/${committee.id}`} />
              <Input name="invitingEmail" type="email" placeholder="Email" />
              <Button type="submit">
                Send
              </Button>
            </Form>
          </SheetContent>
        </Sheet>

      </div>
    </div>
  )

}
