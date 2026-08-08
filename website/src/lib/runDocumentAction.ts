/** Wrap certificate / ID / letter actions so UI can show success or a real error. */
export async function runDocumentAction(
  action: () => void | Promise<void>,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    await action()
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Document generation failed.',
    }
  }
}
