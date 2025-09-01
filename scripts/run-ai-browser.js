#!/usr/bin/env node
const path = require('path')
const { Agent, Orchestrator, providers } = require('../agents')
const { openAIChatProvider } = require('../agents/providers/openai')
const { browserProvider } = require('../agents/providers/browser')

async function main() {
  const query = process.argv.slice(2).join(' ').trim() || process.env.AI_QUERY || 'latest news about open-source browsers'

  const planner = new Agent({ name: 'Planner', systemPrompt: 'You are a planning agent. Create a concise plan and delegate tasks.', provider: openAIChatProvider() })
  const surfer = new Agent({ name: 'Surfer', systemPrompt: 'You browse the web to find relevant pages for the query.', provider: browserProvider({ headless: true, engine: 'duckduckgo' }) })
  const summarizer = new Agent({ name: 'Summarizer', systemPrompt: 'Summarize the extracted content concisely. Conclude with FINAL_ANSWER: <one sentence>.', provider: openAIChatProvider() })

  const orch = new Orchestrator({ agents: [planner, surfer, summarizer], maxTurns: 3 })
  const transcript = await orch.run(query, {})
  for (const m of transcript) {
    const who = m.role === 'user' ? 'USER' : m.name
    console.log(`\n=== ${who} ===\n${m.content}`)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

