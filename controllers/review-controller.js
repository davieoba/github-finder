const { Review } = require('./../models/reviews-models')
const catchAsync = require('./../utils/catch-async')
const AppError = require('./../utils/app-error')

exports.createReview = catchAsync(async (req, res, next) => {
  // so with this we make it possible that the user can manually select the tour and the user id, so the below code is to define them when they are not in the request body
  if (!req.body.tour) req.body.tour = req.params.tourId
  // if the user is not passed in the body then the logged in user _id
  if (!req.body.user) req.body.user = req.user._id
  const review = await Review.create(req.body)

  res.status(200).json({
    status: 'success',
    results: review.length,
    data: {
      review
    }
  })
})

exports.getReviews = catchAsync(async (req, res, next) => {
  let filter = {}
  if (req.params.tourId) filter = { tour: req.params.tourId }
  const review = await Review.find(filter)

  res.status(200).json({
    status: 'success',
    results: review.length,
    data: {
      review
    }
  })
})
