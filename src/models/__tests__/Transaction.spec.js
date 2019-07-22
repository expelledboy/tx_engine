jest.mock('../../action/manager.js');

const mockingoose = require('mockingoose').default;
const uuid = require('uuid/v4');
const Action = require('../Action.js');
const Transaction = require('../Transaction.js');
const { normalizeJson } = require('./helpers.js');
const manager = require('../../action/manager.js');

// disable action error logging
console.error = jest.fn();

beforeEach(() => {
  mockingoose.resetAll();
  manager.mock.reset();
  manager.mock.install();
});

describe('mongoose Transaction model', () => {

  it('is resolved when all actions are resolved', () => {
    const trx = new Transaction({
      trx_id: uuid(),
      actions: [{ name: 'test' }]
    });
    expect(trx.resolved).toBe(false);
    const processed = new Transaction({
      trx_id: uuid(),
      actions: [{ name: 'test', status: 'completed' }]
    });
    expect(processed.resolved).toBe(true);
  });

  it('will perform each action in order when executed', async () => {
    const trx = new Transaction({
      trx_id: uuid(),
      actions: [
        { name: 'mock', params: { status: 1 } },
        { name: 'mock', params: { status: 2 } },
        { name: 'mock', params: { status: 3 } },
      ]
    });
    await trx.perform();
    await trx.complete();
    expect(trx.resolved).toBe(true);
    expect(trx.status).toBe('completed');
    expect(trx.results).toMatchObject([
      { status: 1 },
      { status: 2 },
      { status: 3 }
    ]);
    expect(trx.actions[0].implementation.execute).toHaveBeenCalledTimes(3);
    expect(trx.actions[0].implementation.unexecute).toHaveBeenCalledTimes(0);
  });

  it('will rollback each attempted action on any error', async () => {
    const trx = new Transaction({
      trx_id: uuid(),
      actions: [
        { name: 'mock', params: { status: 1 } },
        { name: 'mock', params: { status: 2, throw: 'crash' } },
        { name: 'mock', params: { status: 3 } },
      ]
    });
    await trx.perform();
    await trx.complete();
    expect(trx.resolved).toBe(true);
    expect(trx.status).toBe('rolledback');
    expect(trx.results).toMatchObject([
      {
        status: 'rolledback',
        result: { status: 1 }
      },
      {
        status: 'rolledback',
        result: { status: 2 },
        error: {
          perform: {
            name: 'Error',
            message: 'fatal crash',
            reason:'crash'
          }
        }
      },
      {
        status: 'cancelled',
      }
    ]);
    expect(trx.actions[0].implementation.execute).toHaveBeenCalledTimes(2);
    expect(trx.actions[0].implementation.unexecute).toHaveBeenCalledTimes(2);
  });

});
