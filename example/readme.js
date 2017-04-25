const H = require('horten')
    , HortenServer = require('../index')

let server = new HortenServer()

// Configure the server.
server.configure( {
  listen: 8080,
  root: __dirname,
  persist: 'data/persist.yaml',
  verbose: true,

  // The page configuration is sent to horten-control.
  // Here is a very simple pages with a single control.
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

// Open the server.
server.open()

// Use a Horten Cursor to listen to incoming changes from the server.
new H.Cursor( {
  listening: true,
  path: 'myDwarf/',
  onValue: ( value ) => console.log(`User chose ${value} as their dwarf. What's with that?`)
})
