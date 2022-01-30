const mongoose = require('mongoose')

const LocationSchema = new mongoose.Schema({
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: [Number],
  day: {
    type: Number
  },
  address: String
})

module.exports = LocationSchema

// "description": "Lummus Park Beach",
//         "type": "Point",
//         "coordinates": [-80.128473, 25.781842],
//         "day": 1
