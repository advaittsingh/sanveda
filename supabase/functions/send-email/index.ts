import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, jsonResponse, optionsResponse } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'Sanveda <onboarding@resend.dev>'

const PUBLIC_TEMPLATES = new Set([
  'enquiry_received',
  'volunteer_received',
  'membership_received',
  'internship_received',
])

type PublicPayload = {
  to: string
  subject: string
  html: string
  template?: string
  enquiryId?: string
  volunteerId?: string
  membershipId?: string
  internshipId?: string
}

async function validatePublicSend(
  serviceClient: ReturnType<typeof createClient>,
  payload: PublicPayload,
): Promise<string | null> {
  const template = payload.template ?? 'custom'
  if (!PUBLIC_TEMPLATES.has(template)) return 'Admin access required'

  if (template === 'enquiry_received') {
    if (!payload.enquiryId) return 'enquiryId is required'
    const { data } = await serviceClient
      .from('enquiries')
      .select('email')
      .eq('id', payload.enquiryId)
      .maybeSingle()
    if (!data || String(data.email).toLowerCase() !== payload.to.toLowerCase()) {
      return 'Invalid enquiry reference'
    }
    return null
  }

  if (template === 'volunteer_received') {
    if (!payload.volunteerId) return 'volunteerId is required'
    const { data } = await serviceClient
      .from('volunteer_applications')
      .select('email')
      .eq('id', payload.volunteerId)
      .maybeSingle()
    if (!data || String(data.email).toLowerCase() !== payload.to.toLowerCase()) {
      return 'Invalid volunteer reference'
    }
    return null
  }

  if (template === 'membership_received') {
    if (!payload.membershipId) return 'membershipId is required'
    const { data } = await serviceClient
      .from('memberships')
      .select('email')
      .eq('id', payload.membershipId)
      .maybeSingle()
    if (!data || String(data.email).toLowerCase() !== payload.to.toLowerCase()) {
      return 'Invalid membership reference'
    }
    return null
  }

  if (template === 'internship_received') {
    if (!payload.internshipId) return 'internshipId is required'
    const { data } = await serviceClient
      .from('internships')
      .select('email')
      .eq('id', payload.internshipId)
      .maybeSingle()
    if (!data || String(data.email).toLowerCase() !== payload.to.toLowerCase()) {
      return 'Invalid internship reference'
    }
    return null
  }

  return 'Unsupported public template'
}

async function dispatchEmail(
  serviceClient: ReturnType<typeof createClient>,
  payload: PublicPayload,
) {
  let status = 'queued'
  let errorMessage: string | null = null

  if (RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    })
    status = res.ok ? 'sent' : 'failed'
    if (!res.ok) errorMessage = await res.text()
  }

  await serviceClient.from('email_logs').insert({
    recipient: payload.to,
    subject: payload.subject,
    template: payload.template ?? 'custom',
    status,
    error_message: errorMessage,
  })

  return { success: status === 'sent' || status === 'queued', status }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  try {
    const payload = await req.json() as PublicPayload
    const { to, subject, html, template } = payload

    if (!to || !subject || !html) {
      return jsonResponse({ error: 'to, subject, and html are required' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    const isPublicTemplate = PUBLIC_TEMPLATES.has(template ?? '')

    if (isPublicTemplate) {
      const validationError = await validatePublicSend(serviceClient, payload)
      if (validationError) return jsonResponse({ error: validationError }, 403)
      const result = await dispatchEmail(serviceClient, payload)
      return jsonResponse(result)
    }

    const supabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401)

    const { data: admin } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!admin) {
      return jsonResponse({ error: 'Admin access required' }, 403)
    }

    const result = await dispatchEmail(serviceClient, payload)
    return jsonResponse(result)
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unknown error' }, 500)
  }
})
