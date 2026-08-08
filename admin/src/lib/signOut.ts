import { authClient } from './authClient'

/**
 * End the Better Auth session server-side and confirm the cookie is gone.
 * Never treat local UI state as proof of logout.
 */
export async function endAuthSession(): Promise<void> {
  const { error } = await authClient.signOut({
    fetchOptions: {
      credentials: 'include',
    },
  })

  if (error) {
    // Fallback: call the endpoint directly in case the client helper failed.
    const response = await fetch('/api/auth/sign-out', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null
      throw new Error(payload?.message ?? error.message ?? 'Sign out failed')
    }
  }

  const session = await authClient.getSession({
    fetchOptions: {
      credentials: 'include',
    },
  })
  if (session.data?.session) {
    throw new Error('Sign out did not end the server session')
  }
}
