const _ = require('lodash')
const H = require('horten')
const Promise = require('bluebird')
const EventEmitter = require('events')
const path = require('path')

const HortenPersistFile = require('horten-persist-file')
const resolveModule = require('path').resolve.bind( null, __dirname, '..')

class HortenServer extends EventEmitter {

  constructor( opt ) {
    super()
    this.options = opt || {}
    this.configuration = {
      listen: 7004,
      root: null,
      persist: null,
      index: null,
      page: {},
      load: [],
      require: [],
      dirs: ['.'],
      files: [],
      verbose: true,
      silent: false,
      upload: {},
    }

    this.cursor = new H.Cursor()

    this.configure( opt )
  }

  configure( opt ) {
    const config = this.configuration

    if ( opt )
      _.map( config, ( value, key ) => {
        var newValue = opt[key]

        if ( newValue == undefined )
          return

        if ( Array.isArray( value ) )
          value = value.concat( newValue )
        else if ( _.isObject( value ) )
          value = _.merge( value, newValue )
        else
          value = newValue

        config[key] = value
      })
    // console.log('configure', opt, this.configuration )
  }

  applyOptions( opt ) {
    const self = this
    if ( Array.isArray( opt.pageDir ) ) {
      opt.pageDir.forEach( ( page ) => {
        self.addPageDir( page )
      })
    }

    if ( opt.file ) {

    }
  }

  open() {
    const config = this.configuration

    if ( !config.root )
      config.root = process.cwd()

    if ( config.index )
      config.files.push( config.index )


    this.openExpress()

    var promise = Promise.resolve()
    promise = promise.then( () => this.openPersist() )
    if ( config.listen )
      promise = promise.then( () => this.websocket.listen( config.listen ) )

    promise = promise.then( () => this.openRequire() )


    return promise
  }

  resolveFile() {
    const config = this.configuration
    config.dir = config.dir || process.cwd()
    return path.resolve.bind( null, config.dir ).apply( null, arguments )
  }

  openRequire() {
    return Promise.map( this.configuration.require, ( req ) => {
      req = this.resolveFile( req )
      require( req )
    } )
  }

  openPersist() {
    const config = this.configuration

    if ( config.persist ) {
      this.persist = new HortenPersistFile({
        mutant: this.cursor.mutant,
        root: this.cursor.root,
        file: path.resolve( config.root, config.persist ),
        listening: true
      })

      return this.persist.open()
    }
  }

  indexFile() {
    const config = this.configuration
        , files = config.files

    const file = path.resolve.apply( path, arguments )

    files.push( file )
  }

}

let __globalServer = null

HortenServer.global = function ( open ) {
  if ( !__globalServer ) {
    __globalServer = new HortenServer()

    if ( open )
      setImmediate( () => __globalServer.open() )
  }

  return __globalServer
}

HortenServer.prototype.configureCLI = require('./configureCLI')
HortenServer.prototype.openExpress = require('./openExpress')
HortenServer.prototype.horten = H
HortenServer.prototype.H = H


module.exports = HortenServer
