module.exports = function configureCLI() {
  const _ = require('lodash')
      , yaml = require('js-yaml')
      , argparse = require('argparse')
      , pkg = require('../package.json')
      , parser = new argparse.ArgumentParser({
          version: pkg.version,
          addHelp: true,
        })

  require('./argparseArguments')( parser )

  this.configure( parser.parseArgs() )

  return this
}
