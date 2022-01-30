const AppError = require('../utils/app-error')

//====> note this is my global error handling middleware
require('dotenv').config({
  path: './../.env'
})

const handleTokenExpire = () => {
  return new AppError('Token expired, Login again', '401')
}

const handleJWTError = () => {
  return new AppError('Invalid token, Log in again', '401')
}

const handleValidationErrorDB = (err) => {
  const errArr = Object.values(err.errors).map((el) => {
    return el.message
  })

  console.log(errArr.join(','))
  const message = errArr.join('..., ')
  return new AppError(message, '404')
}

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, '400')
}

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  // console.log(value)
  const message = `Duplicate field value: ${value}, use another value `
  return new AppError(message, '400')
}

const sendErrorDev = (err, req, res) => {
  // console.log(err)
  let statusCode = err.statusCode || 500
  let status = err.status || 'fail'

  res.status(statusCode).json({
    status: status,
    error: err,
    message: err.message,
    stacktrace: err.stack
  })
}

const sendErrorProd = (err, req, res) => {
  // operational, trusted error: send message to the client
  // console.log(err.isOperational)
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  } else {
    // programming or other unknown error: don't leak error details
    // generic message
    console.error('error 🔥:', err)
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong'
    })
  }
}

module.exports = (err, req, res, next) => {
  // console.log(process.env.NODE_ENV)
  if (process.env.NODE_ENV === 'development') {
    // console.log(err.message)
    // console.log(err)
    console.log(err.name)

    sendErrorDev(err, req, res)
  } else if (process.env.NODE_ENV === 'production') {
    console.log(err.name)
    // console.log(err)
    let error = { ...err }

    if (err.name === 'CastError') error = handleCastErrorDB(error)
    if (err.code === 11000) error = handleDuplicateFieldsDB(err)
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err)
    if (err.name === 'JsonWebTokenError') error = handleJWTError()
    if (err.name === 'TokenExpiredError') error = handleTokenExpire()
    // console.log(error)
    if (err.name === 'Error') {
      return sendErrorProd(err, req, res)
    }
    sendErrorProd(error, req, res)
  }
}

// note: this error (if (err.isOperational) ) that is created here will only be called when I create my error from the AppError class
