const mongoose = require('mongoose')
const action = require('./Action.js')

const TransactionSchema = new mongoose.Schema({
  trx_id: {
    type: String,
    required: true,
    unique: true
  },
  meta: Object,
  status: {
    type: String,
    enum: [
      'new',
      'processing',
      'completed',
      'rolledback'
    ],
    default: 'new'
  },
  actions: [action.schema]
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})

TransactionSchema
  .virtual('resolved')
  .get(function () {
    return this.actions.findIndex(action => !action.resolved) < 0
  })

TransactionSchema
  .virtual('results')
  .get(function () {
    const reduce = this.status === 'rolledback' ? 'detail' : 'result'
    return this.actions.map(action => action[reduce])
  })

TransactionSchema.methods.perform = async function () {
  this.status = 'processing'
  await this.save()

  for (const action of this.actions) {
    action.start(this.actions)
    await this.save()

    await action.perform()
    await this.save()

    if (!action.resolved) break
  }
}

TransactionSchema.methods.complete = async function () {
  if (this.resolved) {
    this.status = 'completed'
  } else {
    await this.rollback()
    this.status = 'rolledback'
  }
  await this.save()
  return {
    status: this.status,
    // resolved: this.resolved,
    results: this.results
  }
}

TransactionSchema.methods.rollback = async function () {
  for (let i = this.actions.length - 1; i >= 0; i--) {
    const action = this.actions[i]

    switch (action.status) {
      case 'rolledback':
        break
      case 'new':
        await action.cancel()
        break
      default:
        await action.rollback()
    }
    await this.save()
  }
}

module.exports = mongoose.model('transaction', TransactionSchema)
