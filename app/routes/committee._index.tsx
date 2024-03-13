import { type LoaderFunctionArgs, type ActionFunctionArgs, json, redirect } from '@remix-run/cloudflare'
import { useLoaderData, useSearchParams, useFetcher, Form, Link } from '@remix-run/react'
import { createServices } from "~/lib/services.server";
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
// import { redirectBack } from 'remix-utils/redirect-back'
import { X } from 'lucide-react'
import { Sheet, SheetClose, SheetTitle, SheetContent } from '~/components/ui/sheet'
import { 
  type Committee,
  committees, 
  members, 
  users,
  insertCommitteeSchema
} from '~/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { 
    db,
    auth: { authenticator } 
  } = createServices(context)
  const sessionUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/auth/login'
  })

  const result = await db.select({
    id: committees.id,
    name: committees.name,
    createdAt: committees.createdAt,
    role: members.role,
  }).from(committees)
    .leftJoin(members, eq(committees.id, members.committeeId))
    .where(eq(members.userId, sessionUser.id))
    .execute()

  return json({
    committees: result
  })
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { 
    db,
    auth: { authenticator } 
  } = createServices(context)
  const sessionUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/auth/login'
  })

  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  const method = request.method.toLowerCase()

  if (method === 'post') {
    const input = insertCommitteeSchema.parse(data)

    const [committee] = await db.insert(committees)
      .values(input)
      .returning().execute()

    await db.insert(members)
      .values({
        userId: sessionUser.id,
        committeeId: committee.id,
        role: 'owner',
      })
      .execute()

    return redirect('/committee')
  } else if (method === 'delete') {
    const id = data.id.toString()
    if (!id) return json({ error: 'missing id' }, { status: 400 })
    await db.delete(committees).where(eq(committees.id, id))
    return json({ deleted: true })
  }

}

export function CommitteeIndex() {
  const fetcher = useFetcher({ key: 'committee' })
  const data = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()

  const creatingParams = searchParams.get('create')
  const isCreating = creatingParams === 'true' || creatingParams === '1'

  return (
    <div className="p-3 flex flex-col gap-3">
      <div className="flex flex-row">

        <Sheet open={isCreating} onOpenChange={(open) => {
          if (!open) {
            setSearchParams({})
          }
        }}>
          <Button
            onClick={(e) => {
              setSearchParams({ create: 'true' })
            }}
          >
            Create
          </Button>
          <SheetContent side="right">
            <SheetTitle>Form Committee</SheetTitle>
            <SheetClose />
            <Form method="POST" className="flex flex-col gap-3">
              <Input type="text" name="name" placeholder="Name" />
              <Button type="submit">Create</Button>
            </Form>
          </SheetContent>
        </Sheet>

      </div>

      <ul className="flex flex-col gap-3">
        {data.committees.map(committee => (
          <li 
            key={committee.id}
            className="p-3 flex flex-row justify-between items-center rounded-md border"
          >
            <Link to={`/committee/${committee.id}`}>
              {committee.name}
            </Link>
            <fetcher.Form method="DELETE">
              <input type="hidden" name="id" value={committee.id} />
              <Button
                variant="destructive"
                size="icon"
              >
                <X />
              </Button>
            </fetcher.Form>
          </li>
        ))}
      </ul>
      
    </div>
  )
}

export default function Route() {
  return (
    <CommitteeIndex />
  )
}
