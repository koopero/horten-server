const _ = require('lodash')
const H = require('horten')
const yaml = require('js-yaml')
const HortenWebsocket = require('horten-websocket')
const NS = HortenWebsocket.NS
const Logger = HortenWebsocket.Logger
const Server = HortenWebsocket.Server
const HortenControl = require('horten-control')
const bodyParser = require('body-parser')
const express = require('express')
const fs = require('fs-extra')
const pathlib = require('path')
const pathposix = pathlib.posix

const resolveModule = pathlib.resolve.bind( null, __dirname, '..')


module.exports = function openExpress() {
  const self = this
  const config = self.configuration
  const cursor = self.cursor

  self.websocket = new Server()
  self.websocket[ NS.verbose ] = !!config.verbose
  const app = self.app = self.websocket.middleWare()


  var logEvents = config.verbose ? [
    'listen',
    'open',
    'close',
    'message',
    'send'
  ] : config.silent ? false : true

  self.logger = new Logger( logEvents )
  self.logger.target = self.websocket

  app.use( '/horten-control/', express.static( HortenControl.staticDir ) )

  addViews()
  addFiles()
  addDirs()
  addPages()
  addAPI()
  addIndex()

  self.emit('openExpress', app )

  return

  function addViews() {

    const exphbs = require('express-handlebars')
    const hbs = exphbs.create({
      extname: '.hbs',
      layoutsDir: resolveModule('views', 'layouts')
    })

    app.engine('.hbs', hbs.engine);
    app.set('view engine', '.hbs');
    app.set('views', resolveModule('views') )
  }


  function addAPI() {
    app.get('/horten/get/*', ( req, res ) => {
      const path = H.path.resolve( req.params[0] )
          , data = cursor.get( path  )

      if ( data === undefined )
        res.status('204','Content === undefined').end()
      else
        res.json( data )
    } )

    app.post(
      '/horten/patch/*',
      bodyParser.text( {
        type: '*/*'
      }),
      ( req, res ) => {
        const path = H.path.resolve( req.params[0] )
            , mutant = self.cursor.mutant.walk( path )

        // try {
        var data = req.body
        try {
          data = yaml.safeLoad( data )
          data = H.util.compose( data )
        } catch ( err ) {
          res.status(400)
          return res.end()
        }

        mutant.patch( data )

        if ( data === undefined )
          res.status('204','Content === undefined').end()
        else
          res.json( mutant.get() )
      }
    )


  }

  function addIndex() {
    app.get('/default/index.md', ( req, res ) => res.send(
`
**Default page. Nothing here.**
`
    ))
    app.get('/', ( req, res ) => renderPage( res ) )
  }

  function addPages() {
    app.get('/page/*', ( req, res ) => {
      let src = req.params[0]
      if ( !src.startsWith('/') )
        src = '/'+src
      renderPage( res, src )
    } )

    _.map( config.page, ( key, src ) => {
      app.get(`/${key}`, ( req, res ) => renderPage( res, key ) )
    } )
  }

  function addFiles() {
    const files = config.files
    _.uniq( files ).forEach( addFile )

    function addFile( file ) {
      const parsed = pathlib.parse( file )
          , path = pathposix.join('/file/', parsed.base )

      app.get( path, ( req, res ) => res.sendFile( file, { root: config.root } ) )
    }
  }

  function addDirs() {
    _.uniq( config.dirs ).forEach( addDir )

    function addDir( dir ) {
      const abs = pathlib.resolve( config.root, dir )

      let path = dir

      if ( path == '.' )
        path = '/'

      if ( !path.startsWith('/') )
        path = '/' + path

      if ( !path.endsWith( '/' ) )
        path += '/'

      console.log('addDir', { dir, abs, path })

      app.use( path, express.static( abs ) )
    }
  }

  function renderPage( res, src ) {
    const page = {}
    _.merge( page, config.page )

    let indexRegion = 'content'

    if ( src ) {
      page[indexRegion] = src
    }

    if ( !page[indexRegion] ) {
      page[indexRegion] = config.index || findIndexURL()
    }

    let html = HortenControl.renderPageHTML( page )
    res.send( html )
  }

  function findIndexURL() {
    let test = ['index.md','index.yaml']
    return _.find( test, path => fs.existsSync( pathlib.resolve( config.root, path ) ) )
  }
}
