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
  const files = addFiles()
  openPages()

  addAPI()
  addIndex()

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

  function openPages() {
    const pages = {}

    self.pages = pages
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
    app.get('/index.md', ( req, res ) => res.send(
`
**Default page. Nothing here.**
`
    ))
    app.get('/', ( req, res ) => renderPage( res ) )
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

  function renderPage( res, pageName ) {
    const page = {}
        , pages = self.pages
        , file = pageName ? '' : '/file/index.md'
        , content = {
          src: file
        }

    page.content = content
    // if ( !( page in pages ) )
    //   return res.render( 'error', { layout: 'main'} )

    res.render( 'page', { layout: 'main',
      __HortenPage: JSON.stringify( page, null, 2 )
    } )
  }
}
