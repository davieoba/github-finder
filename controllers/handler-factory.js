const catchAsync = require('./../utils/catch-async')
const AppError = require('./../utils/app-error')

exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)

    if (!doc) {
      return next(new AppError('Tour not found on the server', '404'))
    }

    res.status(204).json({
      status: 'success',
      data: null
    })
  })
}

// exports.deleteTour =
