const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    minlength: 10,
    required: [true, 'A tour should have a review']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user']
  },
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to a Tour']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

reviewSchema.set('toJSON', {
  virtuals: true
})

reviewSchema.pre(/^find/, function (next) {
  this.populate('user')

  next()
})
const Review = mongoose.model('Review', reviewSchema)

module.exports = {
  reviewSchema,
  Review
}
