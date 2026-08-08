import { z } from 'zod'
import { query, transaction } from '../_lib/db.js'
import { apiHandler, method, parseBody } from '../_lib/http.js'
import { requireSession } from '../_lib/session.js'

type ProfileRow = {
  full_name: string | null
  phone: string | null
}

const updateSchema = z.object({
  fullName: z.string().trim().min(1).max(160),
  phone: z.string().trim().max(32).optional().default(''),
})

export default apiHandler(async (req, res) => {
  const session = await requireSession(req)

  if (req.method === 'GET') {
    const [profile] = await query<ProfileRow>(
      `select full_name, phone from profiles where id = $1`,
      [session.user.id],
    )
    res.status(200).json({
      fullName: profile?.full_name ?? session.user.name,
      phone: profile?.phone ?? '',
    })
    return
  }

  method(req, ['PUT'])
  const input = parseBody(req, updateSchema)
  await transaction(async (client) => {
    await client.query(
      `insert into profiles (id, full_name, phone)
       values ($1, $2, $3)
       on conflict (id) do update
         set full_name = excluded.full_name,
             phone = excluded.phone,
             updated_at = now()`,
      [session.user.id, input.fullName, input.phone],
    )
    await client.query(
      `update public."user"
          set name = $2, phone = $3, "updatedAt" = now()
        where id = $1`,
      [session.user.id, input.fullName, input.phone],
    )
  })
  res.status(200).json({ fullName: input.fullName, phone: input.phone })
})
