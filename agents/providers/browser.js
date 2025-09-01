const { BrowserController } = require('../browser')

function browserProvider(options = {}) {
  const controller = new BrowserController({ headless: options.headless !== false })
  const engine = options.engine || 'duckduckgo'

  return async ({ agent, transcript, context = {} }) => {
    const lastUser = [...transcript].reverse().find(m => m.role === 'user')
    const query = (lastUser && lastUser.content) || context.query || ''
    await controller.start()
    try {
      await controller.search(query, engine)
      const url = await controller.openFirstResult(engine)
      const content = await controller.extractMainContent()
      return `NAVIGATED: ${url}\nTITLE: ${content.title}\nCONTENT:\n${content.text}`
    } finally {
      await controller.stop()
    }
  }
}

module.exports = { browserProvider }

