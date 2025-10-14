export async function sendEmail(payload: {
  to: string
  subject: string
  text: string
  base64?: string
  filename?: string
}) {
  const res = await fetch(import.meta.env.VITE_FN_SEND_EMAIL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('email failed')
  return res.json()
}