require('dotenv').config()

// all errors that occur in async code that are not handled are called uncaught exception
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message)
  console.log('UNCAUGHT EXCEPTION 🔥! SHUTTING DOWN ... ')
  process.exit(1)
})

const app = require('./app')
const chalk = require('chalk')

const port = process.env.PORT || 4000
const mongoose = require('mongoose')

const DB = mongoose
  .connect(process.env.LOCAL_DB)
  .then(() => {
    console.log(chalk.green.inverse(`connected successfully to the DB`))
  })
  .catch((err) => {
    console.log(`err connecting to the DB`)
  })

const server = app.listen(port, () => {
  console.log(chalk.blue.inverse(`application has started on port: ${port}`))
})

// globally handle (unhandled rejection) unhandled rejection occurs when u dont handle rejection from a promise, now the rejection that are handled here are the ones that I cannot control they may come from a third party module or application like mongodb that crashed etc
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message)
  console.log('UNHANDLED REJECTION ... 🔥 shutting down')
  server.close(() => {
    // this is called exiting gracefully instead of just killing the node process with process.exit() we handle all request coming to the server by closing them before exiting the code
    process.exit(1)
  })
})
