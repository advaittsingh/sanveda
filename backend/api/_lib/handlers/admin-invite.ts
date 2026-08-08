import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { auth } from '../auth.js'
import { query, transaction } from '../db.js'
import { serverEnv } from '../env.js'
import { apiHandler, HttpError, method, parseBody } from '../http.js'
import { requireAdmin } from '../session.js'

const requestSchema = z
  .object({
    email: z
      .email()
      .max(320)
      .transform((value) => value.trim().toLowerCase()),
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    roleKey: z
      .string()
      .trim()
      .regex(/^[a-z][a-z0-9_]*$/),
    departmentId: z.string().uuid().nullable().optional(),
    designation: z.string().trim().max(200).default(''),
  })
  .strict()

export default apiHandler(async (req, res) => {
  method(req, ['POST'])
  const session = await requireAdmin(req)
  const input = parseBody(req, requestSchema)
  const env = serverEnv()
  if (!env.RESEND_API_KEY || !env.FROM_EMAIL || !env.ADMIN_INVITE_REDIRECT_URL) {
    throw new HttpError(503, 'Admin invitations are not configured', 'invitation_unavailable')
  }

  const [permission] = await query<{ allowed: boolean }>(
    `select coalesce(ar.key, au.role) in ('super_admin', 'admin')
            or exists (
              select 1
                from admin_role_permissions arp
                join admin_permissions ap on ap.id = arp.permission_id
               where arp.role_id = au.role_id
                 and ap.module = 'admin_users'
                 and ap.action in ('invite', 'manage')
            ) as allowed
       from admin_users au
       left join admin_roles ar on ar.id = au.role_id
      where au.user_id = $1 and au.is_active and au.status = 'active'`,
    [session.user.id],
  )
  if (!permission?.allowed) {
    throw new HttpError(403, 'Admin invitation permission required', 'forbidden')
  }

  const [configuration] = await query<{
    role_id: string
    role_key: string
    department_valid: boolean
  }>(
    `select ar.id as role_id, ar.key as role_key,
            ($2::uuid is null or exists (
              select 1 from admin_departments ad where ad.id = $2
            )) as department_valid
       from admin_roles ar
      where ar.key = $1`,
    [input.roleKey, input.departmentId ?? null],
  )
  if (!configuration) {
    throw new HttpError(400, 'Selected role does not exist', 'invalid_role')
  }
  if (!configuration.department_valid) {
    throw new HttpError(400, 'Selected department does not exist', 'invalid_department')
  }
  const [existing] = await query<{ exists: boolean }>(
    `select exists (
       select 1 from admin_invitations
        where lower(email) = $1 and status = 'pending'
     ) or exists (
       select 1 from "user" where lower(email) = $1
     ) as exists`,
    [input.email],
  )
  if (existing?.exists) {
    throw new HttpError(
      409,
      'An account or pending invitation already exists for this email',
      'invite_conflict',
    )
  }

  let userId: string | undefined
  let invitationId: string | undefined
  try {
    const signup = await auth.api.signUpEmail({
      body: {
        email: input.email,
        name: `${input.firstName} ${input.lastName}`.trim(),
        password: randomBytes(32).toString('base64url'),
      },
    })
    userId = signup.user.id
    invitationId = await transaction(async (client) => {
      const invitation = await client.query<{ id: string }>(
        `insert into admin_invitations (
           email, auth_user_id, role_id, department_id, invited_by,
           first_name, last_name, designation
         ) values ($1, $2, $3, $4, $5, $6, $7, $8)
         returning id`,
        [
          input.email,
          userId,
          configuration.role_id,
          input.departmentId ?? null,
          session.user.id,
          input.firstName,
          input.lastName,
          input.designation,
        ],
      )
      await client.query(
        `insert into admin_users (
           user_id, email, role, role_id, department_id, designation,
           status, is_active, invited_by
         ) values ($1, $2, $3, $4, $5, $6, 'invited', true, $7)`,
        [
          userId,
          input.email,
          configuration.role_key,
          configuration.role_id,
          input.departmentId ?? null,
          input.designation,
          session.user.id,
        ],
      )
      return invitation.rows[0]!.id
    })

    await auth.api.requestPasswordReset({
      body: {
        email: input.email,
        redirectTo: env.ADMIN_INVITE_REDIRECT_URL,
      },
    })
  } catch (error) {
    if (invitationId) {
      await query(
        `update admin_invitations
            set status = 'failed', error_message = 'Invitation delivery failed'
          where id = $1`,
        [invitationId],
      ).catch(() => undefined)
    }
    if (userId) {
      await query('delete from "user" where id = $1', [userId]).catch(() => undefined)
    }
    if (error instanceof HttpError) throw error
    console.error('Admin invitation failed', { error })
    throw new HttpError(502, 'Admin invitation could not be created', 'invitation_failed')
  }

  res.status(201).json({ success: true, invitationId, userId })
})
