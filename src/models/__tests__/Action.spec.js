const mockingoose = require('mockingoose').default;
const Action = require('../Action.js');
const { normalizeJson } = require('./helpers.js');

// disable action error logging
console.error = jest.fn();

beforeEach(() => {
  mockingoose.resetAll();
});

describe('mongoose Action model', () => {

  it('is resolved when have result', () => {
    const action = new Action({});
    expect(action.resolved).toBe(false);
    action.result = { status: 0 };
    expect(action.resolved).toBe(true);
  });

  it('status is determined from model state', () => {
    const action = new Action({});
    expect(action.status).toBe('new');
    action.context = {};
    expect(action.status).toBe('processing');
    action.result = { status: 0 };
    expect(action.status).toBe('completed');
    action.error = { perform: { status: 500 } };
    expect(action.status).toBe('rolledback');
  });

  it('will find implementation from action plugins by name', () => {
    const action = new Action({ name: 'mock' });
    expect(action.implementation.name).toBe(action.name);
    expect(action.implementation.execute).toBeInstanceOf(Function);
    expect(action.implementation.unexecute).toBeInstanceOf(Function);
  });

  it('assign to the result when performing or rolling back action', () => {
    const action = new Action({ name: 'mock' });
    action.start();
    action.perform();
    expect(action.result).toEqual({ status: 0 });
    const failed = new Action({ name: 'mock', params: { throw: 'error' } });
    failed.start();
    failed.perform();
    expect(failed.result).toBeUndefined();
    failed.rollback();
    expect(failed.result).toEqual({ status: 0 });
  });

  it('assign an error when failing performing action', () => {
    const action = new Action({ name: 'mock', params: { throw: 'error' } });
    action.start();
    action.perform();
    expect(action.error.perform).toEqual({ name: 'Error', message: 'fatal crash', reason: 'error' });
  });

});
