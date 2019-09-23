const mockingoose = require('mockingoose').default;
const Action = require('../Action.js');
const { normalizeJson } = require('./helpers.js');

// disable action error logging
console.error = jest.fn();

beforeEach(() => {
  mockingoose.resetAll();
});

describe('mongoose Action model', () => {

  it('will find implementation from action plugins by name', () => {
    const action = new Action({ name: 'mock' });
    expect(action.implementation.name).toBe(action.name);
    expect(action.implementation.execute).toBeInstanceOf(Function);
    expect(action.implementation.unexecute).toBeInstanceOf(Function);
  });

  it('assign to the result when performing or rolling back action', async () => {
    const action = new Action({ name: 'mock' });
    action.start();
    await action.perform();
    expect(action.result).toEqual({ status: 0 });
    const failed = new Action({ name: 'mock', params: { throw: 'error' } });
    failed.start();
    await failed.perform();
    expect(failed.result).toBeUndefined();
    await failed.rollback();
    expect(failed.result).toEqual({ status: 0 });
  });

  it('assign an error when failing performing action', async () => {
    const action = new Action({ name: 'mock', params: { throw: 'error' } });
    action.start();
    await action.perform();
    expect(action.error.perform).toEqual({ name: 'Error', message: 'fatal crash', reason: 'error' });
  });

  it('allows params to extract from transaction history', async () => {
    const action = new Action({ params: { $val: '$.action[0].value' } });
    action.start([ { name: 'action', result: { value: true } } ]);
    expect(action.context).toEqual({ val: true });
  });

});
