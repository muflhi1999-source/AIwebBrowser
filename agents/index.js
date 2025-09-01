const { Agent } = require('./agent')
const { Orchestrator } = require('./orchestrator')
const { basicLocalProvider } = require('./providers/base')

module.exports = {
  Agent,
  Orchestrator,
  providers: {
    basicLocalProvider
  }
}

