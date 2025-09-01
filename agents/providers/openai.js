const OpenAI = require('openai')

function buildOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  return new OpenAI({ apiKey })
}

function toMessages(transcript, systemPrompt) {
  const messages = []
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
  for (const m of transcript) {
    const role = m.role === 'user' ? 'user' : 'assistant'
    messages.push({ role, content: m.content || '' })
  }
  return messages
}

function openAIChatProvider({ model = process.env.OPENAI_MODEL || 'gpt-4o-mini' } = {}) {
  const client = buildOpenAIClient()
  if (!client) {
    return async ({ agent, transcript }) => {
      const lastUser = transcript.filter(m => m.role === 'user').slice(-1)[0]
      return lastUser ? `Echo: ${lastUser.content}` : 'Echo.'
    }
  }
  return async ({ agent, transcript }) => {
    const messages = toMessages(transcript, agent.systemPrompt)
    const resp = await client.chat.completions.create({ model, messages, temperature: 0.2 })
    return resp.choices?.[0]?.message?.content || ''
  }
}

module.exports = { openAIChatProvider }

