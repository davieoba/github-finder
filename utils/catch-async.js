const AppError = require('./app-error')

module.exports = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next)
    } catch (err) {
      // console.log('from the catch', err)
      //   console.log(err.message)
      //   next(new AppError(err.message, '500'))
      next(err)
      // next()
    }
  }
}

// module.exports = (fn) => {
//   return async (req, res, next) => {
//     await fn(req, res, next).catch(next)
//   }
// }
