# Horten Server

`horten-server` is a batteries-included package to provide control and persistence for reactive, shared-state creative applications. It includes:

* Realtime communication provided by [horten-websocket](https://github.com/koopero/horten-websocket).
* Simple persistence using [horten-persist-file](https://github.com/koopero/horten-persist-file).
* Client-side controls from [horten-control](https://github.com/koopero/horten-control).
* RESTful access to Horten data. 

# Example

## Javascript

``` javascript
let server = new HortenServer()

// Configure the server.
server.configure( {
  listen: 8080,
  root: __dirname,
  persist: 'data/persist.yaml',
  verbose: true,

  // The page configuration is sent to horten-control.
  // Here is a very simple page with a single control.
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

```

## CLI

``` sh
sudo npm install -g horten-server

horten-server \
  --http 8080 \
  --persist data/persist.yaml \
  --index yourControls.md \
  --require yourLogic.js
```
