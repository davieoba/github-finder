const express = require('express')
const reviewController = require('./../controllers/review-controller')
const authController = require('./../controllers/authController')

const router = express.Router({ mergeParams: true })

router.use(authController.protect)

router
  .route('/')
  .get(reviewController.getReviews)
  .post(authController.restrictTo('user'), reviewController.createReview)

module.exports = router
