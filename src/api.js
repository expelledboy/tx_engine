const debug = require('debug')('tx:api')
const app = require('express')()
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const config = require('./config.js')
const transaction = require('./routes/transaction.js')
const auth = require('./middleware/auth.js')

// parse the request
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// authenticate with basic auth
app.use(auth)

// install api routes
app.use('/api/transaction', transaction)

// mount api when connected to mongo
mongoose.connection.on('connected', function () {
  debug(`connected to mongo database ${config.mongo.url}`)
  app.listen(config.api.port, () => {
    debug(`server started on port ${config.api.port}`)
    console.log({ listening: `${config.api.external_url}` })
  })
})

// log errors
mongoose.connection.on('error', function (err) {
  debug(`connection error to ${config.mongo.url}: ${err}`)
  console.error(`${new Date()} mongo connection error`, err)
})

// log closed connections
mongoose.connection.on('close', function () {
  debug(`connection closed to ${config.mongo.url}`)
  console.log(`${new Date()} mongo connection closed`)
})

// connect to the mongo
mongoose.connect(config.mongo.url, { useNewUrlParser: true })
