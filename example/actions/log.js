async function execute (context) {
  console.log({ context })
  return context
}

async function unexecute (context, error) {
  console.log({ context, error })
  return context
}

module.exports = {
  name: 'log',
  execute,
  unexecute
}
