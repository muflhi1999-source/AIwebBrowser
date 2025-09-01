class Agent {
  constructor(options = {}) {
    const { name, role = 'assistant', systemPrompt = '', provider } = options
    if (!name) {
      throw new Error('Agent requires a name')
    }
    this.name = name
    this.role = role
    this.systemPrompt = systemPrompt
    this.provider = provider
  }

  async respond(transcript, context = {}) {
    if (!this.provider || typeof this.provider !== 'function') {
      throw new Error(`Agent "${this.name}" has no provider configured`)
    }
    const response = await this.provider({ agent: this, transcript, context })
    return typeof response === 'string' ? response : String(response || '')
  }
}

module.exports = { Agent }

