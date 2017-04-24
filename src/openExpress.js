const _ = require('lodash')
    , HortenWebsocket = require('horten-websocket')
    , NS = HortenWebsocket.NS
    , Logger = HortenWebsocket.Logger
    , Server = HortenWebsocket.Server
    , HortenControl = require('horten-control')
    , express = require('express')
    , pathlib = require('path')
    , pathposix = pathlib.posix

const resolveModule = pathlib.resolve.bind( null, __dirname, '..')


module.exports = function openExpress() {
  const self = this
      , config = self.configuration
      , cursor = self.cursor

  self.websocket = new Server()
  self.websocket[ NS.verbose ] = true
  const app = self.app = self.websocket.middleWare()
  self.logger = new Logger()
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
          , data = cursor.get( path )

      if ( data === undefined )
        res.status('204','Content === undefined').end()
      else
        res.json( data )
    } )
  }

  function addIndex() {
    app.get('/default/index.md', ( req, res ) => res.send(
`
**Default page. Nothing here.**
`
    ))
    app.get('')
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
      const parsed = pathlib.parse( dir )
          , abs = pathlib.resolve( config.root, dir )

      let path = dir

      if ( !path.startsWith('/') )
        path = '/' + path

      if ( !path.endsWith( '/' ) )
        path += '/'


      app.use( path, express.static( abs ) )
    }
  }

  function renderPage( res, src ) {
    const page = _.merge( {}, config.page )

    src = src || config.index || '/default/index.md'

    page.content = { src }

    res.render( 'page', {
      layout: 'main',
      title: page.title || '',
      __HortenPage: JSON.stringify( page, null, 2 )
    } )
  }
}
