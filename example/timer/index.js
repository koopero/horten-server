const HortenServer = require('../../index')
    , server = HortenServer.global( true )
    , H = server.horten

new H.Tracer({
  path: '/',
  listening: true
})
    

H.root.patch( {
  'example': 'timer'
})

server.configureCLI()
server.indexFile( __dirname, 'index.md' )



const status = new H.Cursor( {
  listening: true,
  path: 'example/timer/status',
  onValue: ( v ) => {
    console.log( `Timer is now ${v}.`)
  },
  defaultValue: 'stopped'
})

const duration = new H.Cursor( {
  path: 'example/timer/duration',
  defaultValue: 5000
})

const bell = new H.Cursor( {
  listening: true,
  path: 'example/timer/bell',
  onValue: ( v ) => {
    console.log('Ding!')
  }
} )

const trigger = new H.Cursor( {
  listening: true,
  path: 'example/timer/trigger',
  onValue: ( value ) => {
    if ( value ) {
      let duration = H.root.get( 'example/timer/duration' )
      duration = 5000
      status.value = 'running'
      setTimeout( () => {
        status.value = 'done'
        bell.trigger()
      }, parseFloat( duration ) )
    }
  }
})
