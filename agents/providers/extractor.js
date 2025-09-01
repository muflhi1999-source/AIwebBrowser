const { BrowserController } = require('../browser')

function extractorProvider(options = {}) {
  const controller = new BrowserController({ headless: options.headless !== false })
  return async ({ transcript }) => {
    // This simplistic extractor expects that the previous step already navigated.
    // For a standalone run, it attempts to extract from current page (noop if none).
    await controller.start()
    try {
      const data = await controller.extractMainContent()
      return `EXTRACTED:\nTITLE: ${data.title}\nURL: ${data.url}\nTEXT:\n${data.text}`
    } catch (e) {
      return 'EXTRACTED: No active page context.'
    } finally {
      await controller.stop()
    }
  }
}

module.exports = { extractorProvider }

