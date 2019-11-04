async function execute (context) {
  console.log({ context })
  return true
}

async function unexecute (context, error) {
  console.log({ context, error })
  return true
}

module.exports = {
  name: 'log',
  execute,
  unexecute
}
