const debug = require("debug")("tx:mock:action");

async function execute(context) {
  let { throw: exception } = context;

  if (exception) {
    if (typeof exception === "string") exception = { reason: exception };
    debug("throw %o", context);
    const error = Error("fatal crash");
    Object.assign(error, exception);
    throw error;
  }

  const result = { status: context.status || 0 };

  if (context.delay) {
    debug("async %o", context);
    return Promise(resolve =>
      setTimeout(() => {
        debug("done");
        resolve(result);
      }, context.delay)
    );
  }
  debug("execute %o", context);
  return result;
}

async function unexecute(context, error) {
  debug("unexecute %o %o", context, error);
  const result = { status: context.status || 0 };
  return result;
}

module.exports = {
  name: "mock",
  execute,
  unexecute
};
