const debug = require('debug')('tx:mock:action');

function execute(context, cb) {
  let { throw: exception, delay } = context;

  if (exception) {
    if (typeof exception == 'string') exception = { reason: exception };
    debug('throw %o', context);
    const error = Error('fatal crash');
    Object.assign(error, exception);
    throw error;
  }

  const result = { status: context.status || 0 };

  if (delay) {
    debug('async %o', context);
    setTimeout(function() {
      debug('done');
      return cb(null, result);
    }, delay);
  } else {
    debug('execute %o', context);
    return cb(null, result);
  }
}

function unexecute(context, error, cb) {
  debug('unexecute %o %o', context, error);
  const result = { status: context.status || 0 };
  cb(null, result);
}

module.exports = {
  name: 'mock',
  execute,
  unexecute,
}
