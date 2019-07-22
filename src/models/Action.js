const mongoose = require('mongoose');
const actions = require('../action/manager.js');
const { assocEvolve } = require('../utils.js');

const ActionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  params: Object,
  context: Object,
  result: Object,
  error: {
    perform: Object,
    rollback: Object,
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

ActionSchema
  .virtual('resolved')
  .get(function () {
    return this.result !== undefined;
  });

ActionSchema
  .virtual('status')
  .get(function () {
    if (!!this.error.perform && !!this.result) return 'rolledback';
    if (this.result !== undefined && !this.context) return 'cancelled';
    if (!!this.result) return 'completed';
    if (!!this.context) return 'processing';
    return 'new';
  });

ActionSchema
  .virtual('implementation')
  .get(function () {
    const action = actions.find(this.name);
    if (!action) throw Error(`no implementation for action ${this.name}`);
    return actions.find(this.name);
  });

const parseError = err => Object.assign({}, {
  name: err.name,
  message: err.message,
}, JSON.parse(JSON.stringify(err)));

ActionSchema.methods.start = function(trxResults = []) {
  // have action in history be grouped by name eg: $.action[i].result.value
  const data = trxResults.reduce((acc, { name, result }) => {
    if (!acc[name]) acc[name] = [];
    acc[name].push(result);
    return acc;
  }, {});
  this.context = assocEvolve(this.params || {}, data);
};

ActionSchema.methods.cancel = function() {
  delete this.context;
  this.result = null;
};

ActionSchema.methods.perform = function() {
  try {
    this.implementation.execute(this.context, (err, result) => {
      if (err) return Object.assign(this.error, { perform: err });
      else this.result = result;
    });
  } catch (e) {
    console.error(e);
    Object.assign(this.error, { perform: parseError(e) });
  }
};

ActionSchema.methods.rollback = function() {
  try {
    const result = this.error.perform || this.result;
    this.implementation.unexecute(this.context, result, (err, result) => {
      if (err) return Object.assign(this.error, { rollback: err });
      else this.result = result;
    });
  } catch (e) {
    console.error(e);
    Object.assign(this.error, { rollback: parseError(e) });
  }
};

module.exports = mongoose.model('action', ActionSchema);
