const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const AppError = require('../utils/app-error')
const User = require('./../models/user-models')
const catchAsync = require('./../utils/catch-async')
const sendEmail = require('./../utils/email')
const crypto = require('crypto')

require('dotenv').config({
  path: './../.env'
})

createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)

  res.cookie('jwt', token, {
    expiresIn: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    secure: process.env.NODE_ENV === 'production' ? true : '',
    httpOnly: true
  })

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  })
}

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY
  })
}

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  })

  createSendToken(user, 201, res)
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password)
    return next(new AppError('please provide login details', '400'))

  const user = await User.findOne({ email: email })?.select('+password')
  if (!user) return next(new AppError('Incorrect login details', '404'))

  // compare the password provided in the body with the password saved in the database -- for that I have to create a model methods and document methods
  const auth = await user.comparePassword(password)

  if (!auth)
    return next(new AppError('password or email is not correct', '401'))

  createSendToken(user, 200, res)
})

exports.protect = catchAsync(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  // console.log(token)
  if (!token) {
    return next(
      new AppError(
        'You are not logged in!, Login to have access to this resource',
        '401'
      )
    )
  }

  //   util.promisify Takes a function following the common error-first callback style, i.e. taking a (err, value) => ... callback as the last argument, and returns a version that returns promises.
  //   so normally the code for jwt verify would look like this

  //   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
  //     if (err) {
  //       console.log(err)
  //       next(new AppError('Invalid login details', '401'))
  //     } else {
  //       console.log(decoded)
  //     }
  //   })
  //   https://nodejs.org/dist/latest-v8.x/docs/api/util.html#util_util_promisify_original

  const ans = promisify(jwt.verify)
  const decoded = await ans(token, process.env.JWT_SECRET)
  //   console.log(decoded)

  const user = await User.findById(decoded.id)
  if (!user) return next(new AppError('The user no longer exists', '400'))

  // we want to know if the password was changed after the token was issued if true then the password was changed after the token was issued so we cannot allow the user to continue to use that token

  const auth = user.passwordChangedAfter(decoded.iat)
  //   console.log(auth)
  if (auth)
    return next(new AppError('Password recently changed, log in again', '401'))
  // console.log(user)
  req.user = user
  next()
})

exports.restrictTo = (...role) => {
  return catchAsync((req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', '403')
      )
    }

    next()
  })
}

exports.getMe = catchAsync((req, res, next) => {
  const { user } = req
  req.params.id = req.user._id
  if (user.active === false)
    return next(new AppError('user account deleted', '404'))

  next()
})

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body

  if (!email)
    return next(new AppError('Please provide an email address', '401'))

  const user = await User.findOne({ email: email })
  if (!user)
    return next(new AppError('There is no user with this email address', '404'))
  // console.log(user)

  // generate a random token, note the token generated here and the one saved in the database are not the same thing, the token stored in the database is an encrypted version of the token sent to the user email, so when the user sends the new password it comes with the token and then I would encrypt the one the user sends and compare it with the encrypted one stored in the database
  const resetToken = user.forgotPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  // send the reset password email to the user
  const url = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetpassword/${resetToken}`

  const message = `Forgot your password ?, please enter your new password and confirm password to ${url}.\n If you did not forget your password, please ignore this message`

  await sendEmail({
    email: user.email,
    message: message,
    subject: 'your password reset token is valid for 10 minutes'
  })
    .then(() => {
      return res.status(200).json({
        status: 'success',
        message: 'token sent to the mail successfully'
      })
    })
    .catch(async (err) => {
      user.passwordResetToken = undefined
      user.passwordResetTokenExpiry = undefined
      await user.save({ validateBeforeSave: false })
      return next(
        new AppError('Error sending message to the user, try again', '500')
      )
    })
})

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiry: { $gt: Date.now() }
  })

  if (!user) return next(new AppError('Token is invalid or has expired', '400'))
  console.log(user)

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetTokenExpiry = undefined
  user.passwordChangedAt = new Date.now()
  await user.save()

  createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
  //I want the user to provide his password as a security measure to authenticate that he is who he is, so ask for the current password before updating it
  const user = await User.findById(req.user._id).select('+password')

  if (!user) return next(new AppError('please login to have access', '401'))

  const password = req.body.password
  // compare the password and the password stored in the database

  const auth = await user.comparePassword(password)

  if (!auth) return next(new AppError('user password is not correct', '401'))

  const newPassword = req.body.newPassword
  const passwordConfirm = req.body.passwordConfirm

  user.password = newPassword
  user.passwordConfirm = passwordConfirm
  user.passwordChangedAt = Date.now()
  await user.save()

  createSendToken(user, 200, res)
})
