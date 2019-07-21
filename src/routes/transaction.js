const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction.js')

router.post('/', async (req, res) => {
  try {
    let trx;

    trx = await Transaction.findOne({ trx_id: req.body.trx_id })

    if (!trx) {
      trx = new Transaction(req.body);
      await trx.save();
      const process = trx.perform();
      // TODO figure out how to start rollback while processing
      const timerRef = setTimeout(async () => {
        await process;
        await trx.rollback();
      }, req.body.timeout || 60000)
      await process;
      clearTimeout(timerRef);
    }

    const result = await trx.complete();

    res.status(200).json(result);
  } catch (e) {

    if (e.name == 'ValidationError') {
      const errors = [];
      for (field in e.errors) {
        errors.push({ field, error: e.errors[field].message });
      }
      return res.status(400).json({ error: e.name, errors });
    }

    console.error(e);
    res.status(500).send();
  }
});

module.exports = router;
