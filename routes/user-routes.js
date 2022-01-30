const express = require('express')
const router = express.Router()
const userController = require('./../controllers/user-controllers')
const authController = require('./../controllers/authController')

// auth controllers
router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.post('/forgotpassword', authController.forgotPassword)
router.patch('/resetpassword/:token', authController.resetPassword)

// user profile'
// router.route('')
router.get(
  '/me',
  authController.protect,
  authController.getMe,
  userController.getUser
)
router.patch(
  '/updatepassword',
  authController.protect,
  authController.updatePassword
)
router.patch('/updateme', authController.protect, userController.updateMe)
router.delete('/deleteme', authController.protect, userController.deleteMe)
// user controllers
router.route('/').get(userController.getUsers)

module.exports = router
