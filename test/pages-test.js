const test = require('./_test')

const pages = require('../src/pages')

const yaml = require('js-yaml')

pages( {
  dirs: [ test.resolve('pages1/' ) ]
})
.then( ( data ) => JSON.stringify( data, null, 2 ) ) 
.then( console.log )
