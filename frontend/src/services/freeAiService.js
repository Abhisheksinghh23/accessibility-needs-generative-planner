// Free, keyless AI generation for the hosted demo. Calls Pollinations.ai
// (open model, currently gpt-oss-20b) straight from the browser. This is NOT
// OpenAI. Only the activity details and the disability types/preferences in the
// profile are sent; name, email and location are never sent.
import { buildMessages, parseResponse, enrichPlan } from './openaiService'

const URL = 'https://text.pollinations.ai/openai'
export const FREE_AI_LABEL = 'Pollinations.ai free model (gpt-oss-20b)'
const MIN_GAP_MS = 5000
const MAX_PER_SESSION = 15
const TIMEOUT_MS = 110000

const SAFETY =
  '\n\nImportant: never invent specific real bus/train numbers, stop names, venue facts, opening hours or measurements. ' +
  'Give general guidance and say what the user should verify with the venue or operator. Keep to 5 or 6 steps. Stay strictly on the activity the user described.'

export function freeAiAvailable() {
  return true
}

export async function generateWithFreeAI(activityInput, userProfile) {
  const last = Number(sessionStorage.getItem('freeai_last') || 0)
  const count = Number(sessionStorage.getItem('freeai_count') || 0)
  if (count >= MAX_PER_SESSION) throw new Error('Free AI limit for this session reached')
  if (Date.now() - last < MIN_GAP_MS) throw new Error('Please wait a few seconds between AI requests')
  sessionStorage.setItem('freeai_last', String(Date.now()))
  sessionStorage.setItem('freeai_count', String(count + 1))

  const safeProfile = userProfile
    ? { disabilities: userProfile.disabilities, preferences: userProfile.preferences, location: {} }
    : null
  const messages = buildMessages(safeProfile, {
    ...activityInput,
    description: String(activityInput.description || '').slice(0, 500),
    special_requirements: String(activityInput.special_requirements || '').slice(0, 500),
  })
  messages[0].content += SAFETY

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const call = () =>
      fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({ model: 'openai', temperature: 0.4, max_tokens: 4000, messages, response_format: { type: 'json_object' } }),
      })
    let res = await call()
    if (res.status === 402 || res.status === 429) {
      // The free tier allows about one reply per 45 seconds per IP. Wait once, then retry.
      const body = await res.text()
      const m = /retry after (\d+)s/i.exec(body)
      const wait = Math.min(Number(m?.[1] || 45), 50)
      await new Promise((r) => setTimeout(r, (wait + 1) * 1000))
      res = await call()
    }
    if (!res.ok) throw new Error(`Free AI error: ${res.status}`)
    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content
    if (!raw) throw new Error('Empty response from free AI')
    const a = raw.indexOf('{'), b = raw.lastIndexOf('}')
    const plan = parseResponse(a >= 0 && b > a ? raw.slice(a, b + 1) : raw)
    if (!plan.steps.length) throw new Error('Free AI returned no steps: ' + String(raw).slice(0, 200))
    enrichPlan(plan, activityInput)
    plan.generation_note =
      'This plan was written by a free AI model (Pollinations.ai, gpt-oss-20b), not OpenAI. It can be wrong. Verify accessibility details with the venue or service provider.'
    return plan
  } finally {
    clearTimeout(timer)
  }
}
