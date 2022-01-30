const express = require('express')
const router = express.Router()
const tourController = require('./../controllers/tour-controllers')
const authController = require('./../controllers/authController')
const reviewRouter = require('./../routes/review-routes')

router.use('/:tourId/reviews', reviewRouter)

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopFive, tourController.getAllTours)

router.route('/tour-stats').get(tourController.getTourStats)

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  )
  .get(tourController.getAllTours)

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    tourController.deleteTour
  )

module.exports = router
