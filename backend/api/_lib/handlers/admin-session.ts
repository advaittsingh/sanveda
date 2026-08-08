import { apiHandler, method } from '../http.js'
import { query } from '../db.js'
import { requireAdmin } from '../session.js'

export default apiHandler(async (req, res) => {
  method(req, ['GET', 'POST'])
  const session = await requireAdmin(req)

  if (req.method === 'POST') {
    await query(
      `update admin_users
          set last_login_at = now(), updated_at = now()
        where user_id = $1`,
      [session.user.id],
    )
  }

  res.status(200).json({
    authenticated: true,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
  })
})
