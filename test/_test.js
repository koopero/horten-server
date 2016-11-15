const test = exports

const path = require('path')
test.resolve = path.resolve.bind( path, __dirname, 'data' )
