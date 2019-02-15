module.exports = function configureCLI() {
  const _ = require('lodash')
  const argparse = require('argparse')
  const pkg = require('../package.json')
  const parser = new argparse.ArgumentParser({
    version: pkg.version,
    addHelp: true,
  })

  require('./argparseArguments')( parser )

  this.configure( parser.parseArgs() )

  return this
}
