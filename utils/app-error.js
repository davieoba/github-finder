class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    // this.message = message
    this.statusCode = statusCode
    this.status = this.statusCode.startsWith('4') ? 'error' : 'fail'
    this.isOperational = true
    console.log(this.constructor)
    // Error.captureStackTrace(this, this.constructor)
    // there is no need for this code above because I can inherit it from the the Error class
  }
}

const app = new AppError('test', '101')

module.exports = AppError
