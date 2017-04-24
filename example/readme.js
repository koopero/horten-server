const H = require('horten')
    , HortenServer = require('../index')

let server = new HortenServer()

server.configure( {
  listen: 8080,
  root: __dirname,
  persist: 'data/persist.yaml',
  verbose: true,
  page: {
    content: {
      description: 'Choose a dwarf.',
      path: 'myDwarf/',
      options: [
        'Grumpy','Sleepy','Sneezy','Doc','Bashful','Dopey','Happy'
      ]
    }
  }
} )

server.open()

new H.Cursor( {
  listening: true,
  path: 'myDwarf/',
  onValue: ( value ) => console.log(`User chose ${value} as their dwarf. What's with that?`)
})
