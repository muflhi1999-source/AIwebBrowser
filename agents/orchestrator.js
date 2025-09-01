class Orchestrator {
  constructor(options = {}) {
    const {
      agents = [],
      maxTurns = 6,
      shouldStop = (message) => typeof message.content === 'string' && message.content.includes('FINAL_ANSWER:')
    } = options
    this.agents = agents
    this.maxTurns = maxTurns
    this.shouldStop = shouldStop
  }

  async run(initialUserMessage, context = {}) {
    const transcript = []
    if (initialUserMessage) {
      transcript.push({ role: 'user', name: 'user', content: String(initialUserMessage) })
    }

    for (let turn = 0; turn < this.maxTurns; turn++) {
      for (const agent of this.agents) {
        const content = await agent.respond(transcript, context)
        const message = { role: 'assistant', name: agent.name, content }
        transcript.push(message)
        if (this.shouldStop(message, transcript)) {
          return transcript
        }
      }
    }
    return transcript
  }
}

module.exports = { Orchestrator }

