function execute (context, cb) {
  console.log({ context })
  cb(null, true)
}

function unexecute (context, error, cb) {
  console.log({ context, error })
  cb(null, true)
}

module.exports = {
  name: 'log',
  execute,
  unexecute
}
