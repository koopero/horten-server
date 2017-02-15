/*
  Adds arguments to an argparse object.
*/
module.exports = function argparseArguments( parser ) {
  parser.addArgument(
    ['--http'],
    {
      dest: 'listen',
      help: "Listen on port. Default: 7004",
      defaultValue: '7004'
    }
  )

  parser.addArgument(
    ['--data'],
    {
      help: "Load data from file.",
      nargs: '+'
    }
  )

  parser.addArgument(
    ['--persist'],
    {
      help: "Persist to file.",
    }
  )

  parser.addArgument(
    ['--index'],
    {
      help: "File to use as index.",
    }
  )

  parser.addArgument(
    ['--require'],
    {
      dest: 'require',
      help: "Javascript files to require after opening.",
      nargs: '+'
    }
  )

  parser.addArgument(
    ['--pages'],
    {
      dest: 'pageDir',
      help: "Directories from which to load control pages.",
      nargs: '+'
    }
  )

}
