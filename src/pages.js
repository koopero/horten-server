module.exports = pages

const _ = require('lodash')
    , Promise = require('bluebird')
    , glob = require('glob-promise')
    , path = require('path')

function pages( { dirs } ) {
  dirs = dirs.slice()

  const result = {}

  return Promise.resolve( dirs )
  .map( loadDir )
  // console.log( dirs )
}


function loadDir( dir ) {
  const result = {}

  function addResult( key, file ) {
    result[key] = result[key] || []
    result[key].push( file )
  }

  return Promise.resolve(
    glob( '**/*{md,yaml}', { cwd: dir } )
  )
  .map( function ( filename ) {
    const fullname = path.resolve( dir, filename )
        , parsed = path.parse( filename )
        , file = {
          absolute: fullname
        }

    addResult( filename, file )
    addResult( path.posix.join( parsed.dir, parsed.name ), file )
  } )
  .then( () => result )

}
