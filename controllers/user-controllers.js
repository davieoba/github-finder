const User = require('./../models/user-models')
const catchAsync = require('./../utils/catch-async')
const AppError = require('../utils/app-error')

exports.getUsers = catchAsync(async (req, res) => {
  const user = await User.find()

  res.status(200).json({
    status: 'success',
    result: user.length,
    data: {
      user
    }
  })
})

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    return next(new AppError('This route is not for updating passwords', '400'))
  }

  let emptyObj = { ...req.body }
  let allowedObj = ['name', 'email']

  for (x in emptyObj) {
    if (!allowedObj.includes(x)) {
      delete emptyObj[x]
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, emptyObj, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { active: false },
    {
      new: true,
      runValidators: true
    }
  )

  res.status(204).json({
    status: 'success'
  })
})

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    res.status(200).json({
      status: 'success',
      result: user.length,
      data: {
        user
      }
    })
  } catch (err) {
    res.status(404).send(err)
    console.log(err)
  }
}

exports.updateUser = async (req, res) => {
  try {
    const user = User.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true
    })

    res.status(200).json({
      status: 'success',
      result: user.length,
      data: {
        user
      }
    })
  } catch (err) {
    res.status(404).send(err)
    console.log(err)
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)

    res.status(200).send()
  } catch (err) {
    res.status(404).send(err)
    console.log(err)
  }
}
