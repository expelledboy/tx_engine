const express = require('express')
const JSONStream = require('JSONStream')
const router = express.Router()
const Transaction = require('../models/Transaction.js')
const { assocEvolve } = require('../utils.js')

router.post('/', async (req, res) => {
  try {
    let trx

    trx = await Transaction.findOne({ trx_id: req.body.trx_id })

    if (!trx) {
      trx = new Transaction(req.body)
      await trx.save()
      const process = trx.perform()
      // TODO figure out how to start rollback while processing
      const timerRef = setTimeout(async () => {
        await process
        await trx.rollback()
      }, req.body.timeout || 60000)
      await process
      clearTimeout(timerRef)
    }

    const result = await trx.complete()

    if (req.body._result) {
      const meta = assocEvolve(req.body._result, trx.data)
      trx.meta = Object.assign(meta, trx.meta)
      trx.save()
    }

    res.status(200).json(result)
  } catch (e) {
    if (e.name === 'ValidationError') {
      const errors = []
      let field
      for (field in e.errors) {
        errors.push({ field, error: e.errors[field].message })
      }
      return res.status(400).json({ error: e.name, errors })
    }

    console.error(e)
    res.status(500).send()
  }
})

router.post('/query', async (req, res) => {
  // XXX: For performance reasons we can only query meta.

  const notMeta = ['pageSize', 'page']
  const query = Object.keys(req.body).reduce(function (result, key) {
    if (notMeta.includes(key)) return result
    result[`meta.${key}`] = req.body[key]
    return result
  }, {})

  const limit = req.body.pageSize || 10
  const skip = limit * ((req.body.page || 1) - 1)

  Transaction
    .find(query)
    .skip(skip)
    .limit(limit)
    .cursor()
    .pipe(JSONStream.stringify())
    .pipe(res.type('json'))
})

module.exports = router
