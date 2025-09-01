const { chromium } = require('playwright')

class BrowserController {
  constructor(options = {}) {
    this.headless = options.headless !== false
    this.browser = null
    this.context = null
    this.page = null
  }

  async start() {
    if (this.browser) return
    this.browser = await chromium.launch({ headless: this.headless })
    this.context = await this.browser.newContext()
    this.page = await this.context.newPage()
  }

  async stop() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      this.context = null
      this.page = null
    }
  }

  async goto(url) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' })
  }

  async search(query, engine = 'duckduckgo') {
    if (engine === 'google') {
      const url = 'https://www.google.com/search?q=' + encodeURIComponent(query)
      await this.goto(url)
      return 'google'
    }
    // default: duckduckgo
    const url = 'https://duckduckgo.com/?q=' + encodeURIComponent(query)
    await this.goto(url)
    return 'duckduckgo'
  }

  async openFirstResult(engine = 'duckduckgo') {
    // Extract first external result URL and navigate to it.
    const resultUrl = await this.page.evaluate((engineName) => {
      const isExternal = (href) => {
        if (!href || !href.startsWith('http')) return false
        try {
          const u = new URL(href)
          const host = u.hostname || ''
          if (engineName === 'google') {
            if (host.includes('google.') || host.includes('gstatic.') || href.includes('/search?') || href.includes('webcache')) return false
          } else {
            if (host.includes('duckduckgo.com')) return false
          }
          return true
        } catch (_) {
          return false
        }
      }

      const candidates = Array.from(document.querySelectorAll('a[href]'))
        .map(a => a.getAttribute('href'))
        .filter(isExternal)
      return candidates[0] || null
    }, engine)

    if (!resultUrl) {
      throw new Error('No external result link found')
    }
    await this.page.goto(resultUrl, { waitUntil: 'domcontentloaded' })
    return this.page.url()
  }

  async extractMainContent() {
    return await this.page.evaluate(() => {
      function pickText(el) {
        if (!el) return ''
        const maxLen = 12000
        const main = el.innerText || ''
        return main.replace(/\s+/g, ' ').trim().slice(0, maxLen)
      }
      const title = document.title || ''
      const main = document.querySelector('main, article, #content, .content, body')
      return { title, url: location.href, text: pickText(main) }
    })
  }
}

module.exports = { BrowserController }

