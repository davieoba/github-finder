const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const AppError = require('./../utils/app-error')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 1,
    maxlength: 30,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'user must have an email address'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (val) {
        return validator.isEmail(val)
      },
      message: 'please provide a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'user must provide a password'],
    minlength: 6,
    maxlength: 18,
    trim: true,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'kindly confirm your password'],
    trim: true,
    validate: {
      validator: function (value) {
        return this.password === value
      },
      message: 'The passwords do not match'
    }
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin', 'guide', 'lead-guide']
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  photo: {
    type: String
  },
  passwordChangedAt: {
    type: Date
  },
  passwordResetToken: String,
  passwordResetTokenExpiry: Date
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  this.password = await bcrypt.hash(this.password, 12)

  this.passwordConfirm = undefined
  next()
})

userSchema.methods.passwordChangedAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000
    // console.log(jwtTimestamp, changedTimestamp)
    return jwtTimestamp < changedTimestamp
  }
  return false
}

userSchema.methods.comparePassword = async function (val) {
  return await bcrypt.compare(val, this.password)
}

userSchema.methods.forgotPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex')

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
  this.passwordResetTokenExpiry = Date.now() + 10 * 60 * 1000

  return token
}

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } })
  next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
