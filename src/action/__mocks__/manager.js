const { execute, unexecute } = require('../plugins/mock.js');

const actions = {};

const result = { status: 0 };

const action = (name) => ({
  name,
  execute: jest.fn(execute),
  unexecute: jest.fn(unexecute),
});

const find = name => actions[name];

const install = (name = 'mock') => actions[name] = action(name);

const reset = () => {
  for (var member in actions) delete actions[member];
}

module.exports = {
  find,
  mock: {
    result,
    install,
    reset,
    actions,
  },
}
