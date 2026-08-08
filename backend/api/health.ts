import { query } from './_lib/db.js'
import { apiHandler, method } from './_lib/http.js'

export default apiHandler(async (req, res) => {
  method(req, ['GET'])
  const [result] = await query<{ ok: number }>('select 1 as ok')
  res.status(200).json({
    status: result?.ok === 1 ? 'ok' : 'degraded',
    database: result?.ok === 1,
  })
})
