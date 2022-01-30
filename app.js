const express = require('express')
const userRoutes = require('./routes/user-routes')
const tourRoutes = require('./routes/tour-routes')
const reviewRoutes = require('./routes/review-routes')
const AppError = require('./utils/app-error')
const globalErrorController = require('./controllers/error-controller')
const app = express()

app.use(express.json())
app.use(express.static(`${__dirname}/public`))

// app.use((req, res, next) => {
//   console.log(req.headers)
//   next()
// })

app.use('/api/v1/users', userRoutes)
app.use('/api/v1/tours', tourRoutes)
app.use('/api/v1/reviews', reviewRoutes)

// handle all unhandled routes
app.all('*', (req, res, next) => {
  //   const err = new Error(`Cannot find ${req.originalUrl} on this server`)
  //   err.statusCode = 404
  //   err.status = 'fail'

  console.log('hi : (')
  next(new AppError(`Cannot find ${req.originalUrl}`, '404'))
  // this one also goes to the global error handling middleware
  // next()
})

// creating a global error handling middleware
app.use(globalErrorController)
module.exports = app
