const nodemailer = require('nodemailer')
require('dotenv').config({
  path: './../.env'
})

const sendEmail = async (options) => {
  var transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  const mailOptions = {
    from: 'David Bodunrin <hello@david.io>',
    to: options.email,
    subject: options.subject,
    text: options.message
  }

  return await transport.sendMail(mailOptions)
}

module.exports = sendEmail
