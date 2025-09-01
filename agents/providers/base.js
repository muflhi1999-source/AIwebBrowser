function getLastUserMessage(transcript) {
  for (let i = transcript.length - 1; i >= 0; i--) {
    if (transcript[i].role === 'user') return transcript[i].content || ''
  }
  return ''
}

function getLastAssistantMessage(transcript) {
  for (let i = transcript.length - 1; i >= 0; i--) {
    if (transcript[i].role === 'assistant') return transcript[i].content || ''
  }
  return ''
}

async function basicLocalProvider({ agent, transcript }) {
  const userPrompt = getLastUserMessage(transcript)
  const lastAssistant = getLastAssistantMessage(transcript)

  const name = (agent.name || '').toLowerCase()

  if (name.includes('planner')) {
    const plan = [
      '- Identify the problem and constraints',
      '- Propose a step-by-step approach',
      '- Hand off a concrete subtask to Coder',
      '- Request review from Critic',
      '- Compile final answer'
    ]
    const derived = userPrompt ? ` for: "${userPrompt}"` : ''
    return `Plan${derived}\n${plan.join('\n')}`
  }

  if (name.includes('coder')) {
    const task = lastAssistant && !lastAssistant.toLowerCase().includes('plan')
      ? lastAssistant
      : `Implement core logic${userPrompt ? ` for: "${userPrompt}"` : ''}`
    return `Draft implementation outline:\n- Inputs: described in prompt\n- Algorithm: greedy then refine\n- Output: working result\nNext: Ask Critic to review.`
  }

  if (name.includes('critic')) {
    return 'Review: check correctness, performance, and edge cases. If acceptable, reply with FINAL_ANSWER: <concise summary>'
  }

  // Default assistant behavior: concise helpful reply.
  return userPrompt
    ? `Here is a concise answer based on the current plan and draft for: "${userPrompt}".`
    : 'Ready.'
}

module.exports = { basicLocalProvider }

