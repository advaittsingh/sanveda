import { describe, expect, it } from 'vitest'
import { escapeHtml } from './email.js'
import {
  buildEnquiryOrgNotifyHtml,
  buildEnquiryUserConfirmHtml,
  sanitizeEmailSubject,
} from './enquiryNotify.js'

const xss = {
  name: `<img src=x onerror=alert('n')>`,
  email: `attacker@example.com"><script>alert(1)</script>`,
  phone: `+91<script>alert(1)</script>`,
  subject: `Hello</title><script>alert('s')</script>`,
  message: `Line1\n<script>alert('m')</script>\nLine3`,
  id: `abc"><img src=x onerror=alert(1)>`,
}

describe('enquiry output encoding', () => {
  it('escapeHtml encodes HTML-sensitive characters', () => {
    expect(escapeHtml(`<script>alert("x")</script>&'`)).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;&amp;&#39;',
    )
  })

  it('user confirmation HTML escapes the donor name', () => {
    const html = buildEnquiryUserConfirmHtml(xss.name)
    expect(html).not.toMatch(/<img\b/i)
    expect(html).toContain('&lt;img src=x onerror=alert(&#39;n&#39;)&gt;')
  })

  it('org notify HTML escapes name, subject, and message (including newlines)', () => {
    const html = buildEnquiryOrgNotifyHtml(xss)
    // No executable markup nodes from user fields — only escaped text + intentional <br>.
    expect(html).not.toMatch(/<(script|img)\b/i)
    expect(html).toContain(escapeHtml(xss.name))
    expect(html).toContain(escapeHtml(xss.subject))
    expect(html).toContain(escapeHtml(xss.message).replace(/\n/g, '<br>'))
    expect(html).toContain('Line1<br>&lt;script&gt;alert(&#39;m&#39;)&lt;/script&gt;<br>Line3')
  })

  it('sanitizes CR/LF from email subjects', () => {
    expect(sanitizeEmailSubject('Hello\r\nBcc: evil@example.com')).toBe(
      'Hello Bcc: evil@example.com',
    )
  })
})
