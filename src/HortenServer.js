const EventEmitter = require('events')
    , fs = require('fs-extra-promise')
    , path = require('path')
    , Yaml = require('js-yaml')

const HortenPersistFile = require('horten-persist-file')


const resolveModule = require('path').resolve.bind( null, __dirname, '..')


class HortenServer extends EventEmitter {

  constructor( opt ) {
    super()
    this.options = opt || {}
    this.applyOptions( this.options )
  }

  applyOptions( opt ) {
    const self = this
    if ( Array.isArray( opt.pageDir ) ) {
      opt.pageDir.forEach( ( page ) => {
        self.addPageDir( page )
      })
    }

    if ( opt.file ) {
      this.persistance = new HortenPersistFile({
        file: opt.file,
        open: true,
        listening: true
      })
    }
  }

  open() {
    this.getApp()

    const port = this.options.listen || 4000


    return this.websocket.listen( port )

  }

  getApp() {
    if ( this.app )
      return this.app

    const HortenWebsocket = require('horten-websocket')
        , NS = HortenWebsocket.NS
        , Logger = HortenWebsocket.Logger
        , Server = HortenWebsocket.Server


    this.websocket = new Server()
    this.websocket[ NS.verbose ] = true
    this.app = this.websocket.middleWare()
    this.logger = new Logger()
    this.logger.target = this.websocket
    this.addViews()

    return this.app
  }

  addViews() {
    const self = this
    const express = require('express')
    const exphbs = require('express-handlebars')
    const horten_control = require('horten-control')

    const hbs = exphbs.create({
      extname: '.hbs',
      layoutsDir: resolveModule('views', 'layouts')
    })

    self.app.engine('.hbs', hbs.engine);
    self.app.set('view engine', '.hbs');
    self.app.set('views', resolveModule('views') )

    self.app.use( '/horten-control/', express.static( horten_control.staticDir ) )

    // self.app.get('/*.html', function ( req, res ) {
    //   const key = req.params[0]
    //
    //   // res.json( { params: req.params })
    //   res.render('page', { layout: 'main'} )
    // })
  }

  addPageDir( dir ) {
    const self = this
    dir = path.resolve( dir )
    console.log('addPageDir', dir )

    const app = this.getApp()
    self.app.get('/*.html', function ( req, res, next ) {
      const key = req.params[0]

      const mdFile = path.resolve( dir, `${key}.md` )
      var control = null

      fs.readFileAsync( mdFile, 'utf-8' )
      // .then( Yaml.safeLoad )
      .catch( function ( err ) {
        console.log( 'caught', err  )

      })
      .then( function ( markdown ) {
        if ( markdown ) {
          control = control || {}
          control.markdown = markdown
        }
      })
      .then( function () {
        if ( control ) {
          res.render('page', { controlJSON: JSON.stringify( control ), layout: 'main' } )
        } else {
          next()
        }
      } )
    })
  }

  renderPage( pageName, req, res ) {
    res.json( pages )
    res.render('page', { layout: 'main'} )
  }
}

module.exports = HortenServer
