const Tour = require('./../models/tour-models')
const AppError = require('./../utils/app-error')
const catchAsync = require('./../utils/catch-async')
const factory = require('./handler-factory')

exports.aliasTopFive = async (req, res, next) => {
  req.query.limit = '5'
  req.query.fields = 'name difficulty price summary ratingsAverage'
  req.query.sort = 'price -ratingsAverage'

  next()
}

exports.createTour = catchAsync(async (req, res) => {
  const tour = await Tour.create(req.body)

  res.status(200).json({
    status: 'success',
    results: tour.length,
    data: {
      tour
    }
  })
})

exports.getAllTours = catchAsync(async (req, res) => {
  const excludedQuery = ['page', 'sort', 'limit', 'fields']
  const queryObj = { ...req.query }

  excludedQuery.forEach((el) => {
    if (queryObj[el]) {
      delete queryObj[el]
    }
  })
  // all these above are queries but unlike querying for difficulty=easy, price=400, I cannot search for all this ones like that I can only query for them on the (Tour.find) query

  // in postman ( duration[gte]=5 ) this is how to look for duration is greater than or equal to 5

  //  if I log out req.query for ( duration[gte]=5 ) it would look like this {duration: { gte: 5 }}
  // if I want to query it in mongodb it would be like this
  // { duration: { $gte: 5} } so that means I have to add ( $ ) to the front of my query string to take care of all queries involving (gt , gte, lt, lte)

  let queryStr = JSON.stringify(queryObj)
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, function (match) {
    return `$${match}`
  })

  let query = Tour.find(JSON.parse(queryStr))

  if (req.query.sort) {
    req.query.sort = req.query.sort.split(',').join(' ')
    query = query.sort(req.query.sort)
  }

  if (req.query.fields) {
    req.query.fields = req.query.fields.split(',').join(' ')
    query = query.select(req.query.fields)
  }

  const page = req.query.page || 1
  const limitBy = req.query.limit || 10
  // skip is how many results will be skipped
  // limit is how many results will be displayed at a time

  query = query.skip((page - 1) * limitBy).limit(limitBy)
  // if (req.query.page) {
  // }

  const tour = await query

  // res.send(tour)

  res.status(200).json({
    status: 'success',
    results: tour.length,
    data: {
      tour
    }
  })
})

exports.getTour = catchAsync(async (req, res, next) => {
  // const tour = await Tour.findById(req.params.id).populate({
  //   path: 'guides',
  //   select: '-__v'
  // })
  const tour = await Tour.findById(req.params.id).populate('reviews')
  if (!tour) {
    return next(new AppError('Tour not found on the server', '404'))
  }

  res.status(200).json({
    status: 'success',
    results: tour?.length,
    data: {
      tour
    }
  })
})

exports.updateTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true
  })

  if (!tour) {
    return next(new AppError('Tour not found on the server', '404'))
  }

  res.status(200).json({
    status: 'success',
    results: tour.length,
    data: {
      tour
    }
  })
})

exports.deleteTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndDelete(req.params.id)

  if (!tour) {
    return next(new AppError('Tour not found on the server', '404'))
  }

  res.status(204).json({
    status: 'success',
    data: null
  })
})

// exports.deleteTour = factory.deleteOne(Tour)

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.4 } }
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ])

  res.status(200).json({
    status: 'success',
    result: stats.length,
    data: {
      stats
    }
  })
})

// {
//   $match: {
//     ratingsAverage: {
//       $gte: 4.5
//     }
//   }
// }

// populate the location schema
// Tour.location.push({
//   _id: '5c88fa8cf4afda39709c2959',
//   description: 'Lummus Park Beach',
//   type: 'Point',
//   coordinates: [-80.128473, 25.781842],
//   day: 1
// })
