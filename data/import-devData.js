const mongoose = require('mongoose')
const Tour = require('./../models/tour-models')
const User = require('./../models/user-models')
const fs = require('fs')
const chalk = require('chalk')
// get the file in json format convert it to an object by parsing it and save it to the database
const fileData = fs.readFileSync('./tours.json').toString()
const dataObj = JSON.parse(fileData)
require('dotenv').config({
  path: './../.env'
})
// console.log(dataObj)
// console.log(process.argv)
console.log(process.env.LOCAL_DB)
const DB = mongoose
  .connect(process.env.LOCAL_DB)
  .then(() => {
    console.log('DB connected successfully')
  })
  .catch(() => {
    console.log('DB connection failed')
  })

async function data() {
  if (process.argv[2] === '--import') {
    await importData()
    process.exit()
  } else if (process.argv[2] === '--delete') {
    await deleteData()
    process.exit()
  } else {
    process.exit()
  }
}

async function importData() {
  try {
    const tour = await Tour.create(dataObj)
    console.log(chalk.green.inverse.bold('tour data imported successfully'))
  } catch (err) {
    console.log(err)
  }
}

async function deleteData() {
  try {
    const tour = await Tour.deleteMany()
    console.log(chalk.red.inverse.bold('tour data deleted successfully '))
  } catch (err) {
    console.log(err)
  }
}

data()
// node import-devData.js --delete
// node import-devData.js --import
