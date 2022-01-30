const mongoose = require('mongoose')
const validator = require('validator')
const LocationSchema = require('./location-schema')

const tourSchema = new mongoose.Schema({
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5']
  },
  ratingsQuantity: {
    type: Number
  },
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    maxlength: [40, 'A tour name must have less or equal 40 characters'],
    minlength: [10, 'A tour name must have greater or equal 10 characters']
    // validate: [validator.isAlpha, 'Tour must only contain alphabets']
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration']
  },
  difficulty: {
    type: String,
    default: 'easy',
    required: [true, 'A tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty can be: easy, medium, difficult'
    }
  },
  price: {
    type: Number,
    required: true,
    min: 1
  },
  discount: {
    type: Number,
    validate: {
      validator: function (val) {
        return val < this.price
      },
      message: 'Discount should be less than the actual price'
    }
  },
  summary: {
    type: String
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false
  },
  startDates: [Date],
  secret: {
    type: Boolean,
    default: false
  },
  locations: [LocationSchema],
  startLocation: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
    // in geojson long, lat  but in google maps it lat, long
  },
  guides: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
})

tourSchema.set('toJSON', {
  virtuals: true
})

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
})

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7
})

// this is a pre-hook for queries such as find, findOne etc
tourSchema.pre(/^find/, function (next) {
  this.find({ secret: { $ne: true } }).populate({
    path: 'guides',
    select: '-__v'
  })
  next()
})

tourSchema.pre('aggregate', function (next) {
  // console.log(this.pipeline())
  this.pipeline().unshift({ $match: { secret: { $ne: true } } })
  next()
})
const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour
